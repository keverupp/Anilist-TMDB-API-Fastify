// controllers/episodeController.js

const axios = require("axios");
const qs = require("querystring");
const knex = require("knex")(require("../knexfile").development);
const { getEpisodesByAnimeId } = require("../models/episodesModel");

const DEEPL_KEY = process.env.DEEPL_KEY;
const KITSU_BASE = "https://kitsu.io/api/edge";
const KITSU_HEADERS = {
  Accept: "application/vnd.api+json",
};

// Função auxiliar para adicionar delay
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Traduz via DeepL com controle de taxa (rate limiting)
// Adiciona um delay entre chamadas e implementa retry em caso de erro 429
async function translateText(text, targetLang = "PT", retryDelay = 2000) {
  if (!text || !text.trim()) return text;

  // Aguarda um tempo antes de cada chamada à API
  await sleep(500);

  try {
    const body = qs.stringify({
      auth_key: DEEPL_KEY,
      text,
      target_lang: targetLang,
    });

    const resp = await axios.post(
      "https://api-free.deepl.com/v2/translate",
      body,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    return resp.data.translations[0].text;
  } catch (err) {
    // Se atingir o limite de requisições (429), aguarda e tenta novamente
    if (err.response && err.response.status === 429) {
      console.log(
        `DeepL rate limit atingido. Aguardando ${retryDelay}ms antes de tentar novamente...`
      );
      await sleep(retryDelay);
      // Chama recursivamente com um delay maior
      return translateText(text, targetLang, retryDelay * 1.5);
    }

    console.error("DeepL error:", err.response?.data || err.message);
    return text; // Retorna o texto original em caso de erro
  }
}

// Busca paginada de todos os episódios do anime via /anime/:id/episodes
async function fetchAllKitsuEpisodes(kitsuAnimeId) {
  const all = [];
  const limit = 20;
  let offset = 0;

  while (true) {
    const res = await axios.get(
      `${KITSU_BASE}/anime/${kitsuAnimeId}/episodes`,
      {
        params: {
          "page[limit]": limit,
          "page[offset]": offset,
        },
        headers: KITSU_HEADERS,
      }
    );
    const batch = res.data.data;
    if (!batch.length) break;
    all.push(...batch);
    if (batch.length < limit) break;
    offset += limit;
  }

  return all;
}

async function updateEpisodesKitsune(request, reply) {
  try {
    const animeId = parseInt(request.params.animeId, 10);
    if (isNaN(animeId)) {
      return reply.status(400).send({ error: "animeId inválido." });
    }

    // 1) buscar o título do anime no DB
    const anime = await knex("animes")
      .select("name")
      .where("id", animeId)
      .first();
    if (!anime) {
      return reply
        .status(404)
        .send({ error: `Anime com id ${animeId} não encontrado.` });
    }
    const animeTitle = anime.name;
    console.log(
      `→ Atualização de episódios para anime interno [${animeId}] "${animeTitle}"`
    );

    // 2) descobrir o ID no Kitsu
    const search = await axios.get(`${KITSU_BASE}/anime`, {
      params: { "filter[text]": animeTitle },
      headers: KITSU_HEADERS,
    });
    const hits = search.data.data;
    if (!hits.length) {
      console.log(`   ✖ Kitsu não encontrou anime "${animeTitle}"`);
      return reply
        .status(404)
        .send({ error: `Anime "${animeTitle}" não encontrado no Kitsu.` });
    }
    const kitsuAnimeId = hits[0].id;
    const kitsuAnimeName = hits[0].attributes.canonicalTitle;
    console.log(
      `   ✔ Encontrado no Kitsu: ID ${kitsuAnimeId} — "${kitsuAnimeName}"`
    );

    // 3) buscar todos os episódios no Kitsu
    const allEps = await fetchAllKitsuEpisodes(kitsuAnimeId);
    console.log(`   • Kitsu retornou ${allEps.length} episódios`);

    // Debug: Imprimir tipos dos primeiros episódios Kitsu para verificação
    if (allEps.length > 0) {
      const firstEp = allEps[0].attributes;
      console.log(
        `   • Debug - Kitsu primeiro ep: número=${
          firstEp.number
        } (${typeof firstEp.number}), temporada=${
          firstEp.seasonNumber
        } (${typeof firstEp.seasonNumber})`
      );
    }

    // 4) carregar todos os episódios locais
    const { total } = await getEpisodesByAnimeId(animeId, 1, 1);
    const { episodes } = await getEpisodesByAnimeId(animeId, 1, total);
    console.log(`   • Total de episódios locais: ${episodes.length}`);

    // 5) filtrar os episódios que precisam de atualização
    const toUpdate = episodes.filter(
      (ep) =>
        !ep.overview ||
        ep.overview === "Descrição não disponível." ||
        !ep.still_path ||
        ep.still_path === "Imagem não disponível"
    );
    console.log(`   • Episódios a atualizar: ${toUpdate.length}`);
    if (!toUpdate.length) {
      return reply
        .status(200)
        .send({ message: "Nenhum episódio para atualizar." });
    }

    // 6) atualizar cada episódio SEQUENCIALMENTE (não em paralelo)
    const results = [];
    for (const ep of toUpdate) {
      try {
        // 6.1) obter episode_number e season_number
        const rec = await knex("episodes as e")
          .join("anime_seasons as a", "e.anime_season_id", "a.id")
          .join("seasons as s", "a.season_id", "s.id")
          .select("e.id", "e.episode_number", "s.season as season_number")
          .where("e.id", ep.id)
          .first();

        if (!rec) {
          console.log(`   ✖ Temporada não encontrada para ep interno ${ep.id}`);
          throw new Error(`Season não encontrada (ep ${ep.id})`);
        }

        // Converter para números inteiros para garantir a comparação correta
        const episode_num = parseInt(rec.episode_number, 10);
        const season_num = parseInt(rec.season_number, 10);

        // Verificar se a conversão foi bem-sucedida
        if (isNaN(episode_num) || isNaN(season_num)) {
          console.log(
            `   ✖ Erro de conversão: E${rec.episode_number} S${rec.season_number}`
          );
          throw new Error(
            `Erro de conversão de número de episódio ou temporada (ep ${ep.id})`
          );
        }

        console.log(`   → Buscando E${episode_num} S${season_num}`);

        // 6.2) encontrar no allEps pelo número e temporada
        let match = allEps.find((e) => {
          const a = e.attributes;
          // Garantir que ambos são números para comparação
          return (
            parseInt(a.number, 10) === episode_num &&
            parseInt(a.seasonNumber, 10) === season_num
          );
        });

        if (!match) {
          // Tentar encontrar com uma comparação mais flexível (ignorando tipo)
          const flexMatch = allEps.find((e) => {
            const a = e.attributes;
            return (
              String(a.number).trim() === String(rec.episode_number).trim() &&
              String(a.seasonNumber).trim() === String(rec.season_number).trim()
            );
          });

          if (flexMatch) {
            console.log(
              `      ✓ Encontrado com comparação flexível: E${episode_num} S${season_num}`
            );
            match = flexMatch;
          } else {
            console.log(
              `      ✖ Não existe no Kitsu: E${episode_num} S${season_num}`
            );
            throw new Error(
              `Episódio ${episode_num} S${season_num} não existe no Kitsu.`
            );
          }
        }

        // 6.3) extrair dados originais
        const { canonicalTitle, synopsis = "", thumbnail } = match.attributes;
        console.log(`      ✔ Encontrado: "${canonicalTitle}"`);

        // Determinar o que precisa ser atualizado
        const needsTranslatedSynopsis =
          !ep.overview || ep.overview === "Descrição não disponível.";
        const needsThumbnail =
          !ep.still_path || ep.still_path === "Imagem não disponível";

        // Preparar os dados a serem atualizados
        const updateData = {};

        // 6.4) traduzir - Sempre atualize o nome (independente de já estar preenchido)
        updateData.name = await translateText(canonicalTitle);

        if (needsTranslatedSynopsis) {
          updateData.overview = await translateText(synopsis);
        }

        if (needsThumbnail) {
          updateData.still_path = thumbnail?.original || null;
        }

        // Sempre atualizar o timestamp
        updateData.updated_at = new Date().toISOString();

        // 6.5) atualizar no banco
        await knex("episodes").where({ id: ep.id }).update(updateData);
        console.log(`      ✔ Atualizado no DB: ep interno ${ep.id}`);

        results.push({
          status: "fulfilled",
          value: { id: ep.id, status: "updated" },
        });
      } catch (error) {
        results.push({ status: "rejected", reason: error });
      }
    }

    // 7) resumir resultados
    const updated = results.filter((r) => r.status === "fulfilled").length;
    const failed = results
      .filter((r) => r.status === "rejected")
      .map((r) => r.reason.message);

    console.log(
      `✔ Processados ${toUpdate.length}, atualizados ${updated}, falharam ${failed.length}`
    );
    return reply.status(200).send({
      message: `Processados ${toUpdate.length} episódios.`,
      summary: { updated, failed },
    });
  } catch (err) {
    console.error("updateEpisodesKitsune error:", err);
    return reply.status(500).send({ error: err.message });
  }
}

module.exports = { updateEpisodesKitsune };
