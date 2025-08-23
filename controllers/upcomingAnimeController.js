/**
 * Controller para gerenciamento de animes futuros
 */
const axios = require("axios");
const { translateAnimeFields } = require("../services/translationService");
const {
  findUpcomingAnimeByMalId,
  insertUpcomingAnime,
  findUnprocessedUpcomingAnimes,
  updateUpcomingAnime,
} = require("../repositories/upcomingAnimeRepository");

/**
 * Busca animes futuros na Jikan API e salva no banco de dados
 * @param {Object} request - Requisição Fastify
 * @param {Object} reply - Resposta Fastify
 */
async function fetchUpcomingAnimes(request, reply) {
  try {
    // Busca todas as páginas de animes futuros na Jikan API
    let page = 1;
    let hasNextPage = true;
    const animes = [];

    while (hasNextPage) {
      const { data } = await axios.get(
        `https://api.jikan.moe/v4/seasons/upcoming?page=${page}`
      );

      if (!data || !data.data || !Array.isArray(data.data)) {
        throw new Error("Formato de resposta inválido da Jikan API");
      }

      // Filtrar animes com classificação +18
      const filtered = data.data.filter((anime) => {
        const rating = anime.rating || "";
        const hasHentaiGenre = (anime.genres || []).some(
          (g) => g.name?.toLowerCase() === "hentai"
        );
        return !/R\+|Rx/i.test(rating) && !hasHentaiGenre;
      });

      animes.push(...filtered);
      hasNextPage = data.pagination?.has_next_page;
      page++;
    }

    request.log.info(
      `Encontrados ${animes.length} animes futuros na Jikan API`
    );

    // Processa cada anime
    const results = {
      total: animes.length,
      saved: 0,
      errors: 0,
      skipped: 0,
    };

    for (const anime of animes) {
      try {
        // Verifica se o anime já existe no banco
        const existingAnime = await findUpcomingAnimeByMalId(anime.mal_id);

        if (existingAnime) {
          request.log.info(
            `Anime ${anime.title} (ID: ${anime.mal_id}) já existe no banco`
          );
          results.skipped++;
          continue;
        }

        // Extrai apenas os dados essenciais
        const animeData = {
          mal_id: anime.mal_id,
          title: anime.title,
          title_english: anime.title_english,
          title_japanese: anime.title_japanese,
          image_url: anime.images?.jpg?.large_image_url,
          trailer_youtube_id: anime.trailer?.youtube_id,
          trailer_url: anime.trailer?.url,
          season: anime.season,
          year: anime.year,
          release_date: anime.aired?.from,
          synopsis: anime.synopsis,
          processed: false,
        };

        // Salva no banco de dados
        const insertResult = await insertUpcomingAnime(animeData);
        request.log.info(
          `Anime ${anime.title} (ID: ${
            anime.mal_id
          }) salvo com sucesso. Resultado: ${JSON.stringify(insertResult)}`
        );
        results.saved++;
      } catch (error) {
        request.log.error(
          `Erro ao processar anime ${anime.title || "desconhecido"}: ${
            error.message
          }`
        );
        results.errors++;
      }
    }

    return reply.send({
      success: true,
      message: `Processamento de animes futuros concluído`,
      results,
    });
  } catch (error) {
    request.log.error(`Erro ao buscar animes futuros: ${error.message}`);
    return reply.status(500).send({
      success: false,
      error: "Erro ao buscar animes futuros",
      details: error.message,
    });
  }
}

/**
 * Processa animes não processados: traduz e busca ID na OtakuDiscuss
 * @param {Object} request - Requisição Fastify
 * @param {Object} reply - Resposta Fastify
 */
async function processUnprocessedAnimes(request, reply) {
  try {
    // Busca animes não processados
    const unprocessedAnimes = await findUnprocessedUpcomingAnimes();

    if (!unprocessedAnimes.length) {
      return reply.send({
        success: true,
        message: "Não há animes pendentes para processamento",
      });
    }

    request.log.info(
      `Encontrados ${unprocessedAnimes.length} animes para processar`
    );

    const results = {
      total: unprocessedAnimes.length,
      processed: 0,
      errors: 0,
    };

    for (const anime of unprocessedAnimes) {
      try {
        // 1. Traduzir campos essenciais
        const translatedFields = await translateAnimeFields(anime);

        // 2. Tratar nome para busca na API OtakuDiscuss
        const cleanTitle = cleanAnimeTitleForSearch(
          anime.title_english || anime.title
        );

        // 3. Buscar ID na API OtakuDiscuss
        const otakuDiscussId = await findOtakuDiscussId(cleanTitle);

        // 4. Atualizar anime com dados processados
        const updateResult = await updateUpcomingAnime(anime.id, {
          ...translatedFields,
          otaku_discuss_id: otakuDiscussId,
          processed: true,
        });

        request.log.info(
          `Anime ${anime.title} (ID: ${
            anime.id
          }) processado com sucesso. Resultado: ${JSON.stringify(updateResult)}`
        );
        results.processed++;
      } catch (error) {
        request.log.error(
          `Erro ao processar anime ${anime.title}: ${error.message}`
        );
        results.errors++;
      }
    }

    return reply.send({
      success: true,
      message: `Processamento de animes concluído`,
      results,
    });
  } catch (error) {
    request.log.error(`Erro ao processar animes: ${error.message}`);
    return reply.status(500).send({
      success: false,
      error: "Erro ao processar animes",
      details: error.message,
    });
  }
}

/**
 * Limpa o título do anime para busca na API OtakuDiscuss
 * Remove números de temporada, sufixos como "Season 2", etc.
 * @param {string} title - Título original do anime
 * @returns {string} Título limpo para busca
 */
function cleanAnimeTitleForSearch(title) {
  if (!title) return "";

  // Remove padrões de temporada como "Season 2", "2nd Season", etc.
  let cleanTitle = title
    .replace(/\s+\d+(st|nd|rd|th)?\s+season/i, "")
    .replace(/\s+season\s+\d+/i, "")
    .replace(/\s+part\s+\d+/i, "")
    .replace(/\s+\d+$/i, "")
    .replace(/\s+\(\d+\)$/i, "")
    .replace(/\s+\d+\s*:/i, ":")
    .trim();

  return cleanTitle;
}

/**
 * Busca ID do anime na API OtakuDiscuss
 * @param {string} title - Título limpo do anime
 * @returns {number|null} ID do anime na OtakuDiscuss ou null se não encontrado
 */
async function findOtakuDiscussId(title) {
  try {
    if (!title) return null;

    const encodedTitle = encodeURIComponent(title);
    const { data } = await axios.get(
      `https://api.otakudiscuss.online/search-api?query=${encodedTitle}`
    );

    if (data && data.titles && data.titles.length > 0) {
      return data.titles[0].id;
    }

    return null;
  } catch (error) {
    console.error(
      `Erro ao buscar ID na OtakuDiscuss para "${title}": ${error.message}`
    );
    return null;
  }
}

module.exports = {
  fetchUpcomingAnimes,
  processUnprocessedAnimes,
};
