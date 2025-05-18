// src/services/logoService.js
const axios = require("axios");
const knex = require("knex")(require("../knexfile").development);

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// Função auxiliar para processar um array de imagens (logos, posters, etc.)
function processImageArray(itemsFromApi, size) {
  if (!itemsFromApi || !Array.isArray(itemsFromApi)) return [];
  return itemsFromApi.map((item) => ({
    ...item, // Mantém todos os campos originais do TMDB (width, height, aspect_ratio, iso_639_1, etc.)
    file_path: item.file_path // Sobrescreve file_path com a URL completa
      ? `${TMDB_IMAGE_BASE_URL}/w${size}${item.file_path}`
      : null,
    language: item.iso_639_1, // Adiciona campo 'language' para facilitar a filtragem
  }));
}

// Função auxiliar para selecionar a logo preferida
function selectPreferredLogoFromArray(logosArray, logger, animeIdForLog) {
  // Adicionado logger e animeIdForLog
  if (logger && typeof logger.info === "function" && animeIdForLog) {
    // Log para depuração
    // Converta para string para evitar problemas com objetos circulares no logger se houver
    const logosString = logosArray
      ? JSON.stringify(
          logosArray.map((l) => ({ lang: l.language, path: l.file_path }))
        )
      : "[]";
    logger.info(
      { animeId: animeIdForLog, logosAvailable: logosString },
      "Logos disponíveis para seleção"
    );
  }

  if (!logosArray || logosArray.length === 0) {
    return undefined;
  }

  const preferredOrder = ["pt", "en", "ja"];
  for (const lang of preferredOrder) {
    const foundLogo = logosArray.find((logo) => logo.language === lang);
    if (foundLogo) {
      if (logger && typeof logger.info === "function" && animeIdForLog) {
        logger.info(
          {
            animeId: animeIdForLog,
            selectedLang: lang,
            logoPath: foundLogo.file_path,
          },
          "Logo preferida encontrada"
        );
      }
      return {
        // Retorna os campos desejados
        url: foundLogo.file_path,
        width: foundLogo.width,
        height: foundLogo.height,
        aspect_ratio: foundLogo.aspect_ratio, // Incluído
        language: foundLogo.language,
      };
    }
  }

  if (logger && typeof logger.info === "function" && animeIdForLog) {
    logger.info(
      { animeId: animeIdForLog },
      "Nenhuma logo nos idiomas preferidos (pt, en, ja) foi encontrada."
    );
  }
  return undefined; // Nenhuma das preferidas encontrada
}

// Função principal de busca e cache
async function fetchAndProcessTmdbImagesWithCache(animeTmdbId, logger) {
  const existing = await knex("tmdb_anime_logos")
    .where({ anime_id: animeTmdbId })
    .first();

  if (existing && existing.data) {
    // Verifica se os logos cacheados têm o campo 'language'
    // Este é um ponto importante: se o cache é antigo, pode não ter.
    const hasLanguageField =
      existing.data.logos &&
      existing.data.logos.length > 0 &&
      existing.data.logos[0].hasOwnProperty("language");
    if (logger && typeof logger.debug === "function") {
      logger.debug(
        { animeId: animeTmdbId, hasLangInCache: hasLanguageField },
        "Logos encontradas no cache."
      );
    }
    // Se não tiver o campo 'language', o ideal seria re-buscar e re-cachear, mas por ora vamos retornar.
    // A limpeza do cache é a forma mais simples de garantir que os dados estejam no formato novo.
    return existing.data; // Assumindo que 'data' já é um objeto JS
  }

  if (logger && typeof logger.info === "function") {
    logger.info(
      { animeId: animeTmdbId },
      "Logos não encontradas no cache. Buscando na API TMDB..."
    );
  }

  const apiUrl = `https://api.themoviedb.org/3/tv/${animeTmdbId}/images?include_image_language=en,pt,ja&api_key=${TMDB_API_KEY}`;
  let apiResponse;
  try {
    const response = await axios.get(apiUrl);
    apiResponse = response.data;
  } catch (apiError) {
    if (logger && typeof logger.error === "function") {
      logger.error(
        { err: apiError, animeId: animeTmdbId, url: apiUrl },
        "Erro ao buscar imagens da API TMDB"
      );
    }
    throw apiError;
  }

  const processedData = {
    id: apiResponse.id, // ID do TMDB
    logos: processImageArray(apiResponse.logos, 500), // Processa com tamanho w500
    backdrops: processImageArray(apiResponse.backdrops, 1280),
    posters: processImageArray(apiResponse.posters, 500),
  };

  try {
    await knex("tmdb_anime_logos")
      .insert({
        anime_id: animeTmdbId,
        data: processedData, // Insere o objeto processado
      })
      .onConflict("anime_id")
      .ignore(); // Ou .merge() se quiser atualizar
    if (logger && typeof logger.info === "function") {
      logger.info({ animeId: animeTmdbId }, "Logos salvas no cache.");
    }
  } catch (dbError) {
    if (logger && typeof logger.error === "function") {
      logger.error(
        { err: dbError, animeId: animeTmdbId },
        "Falha ao salvar logos no cache."
      );
    }
  }
  return processedData;
}

// Função para o homeController
async function fetchLogosOnlyForMultipleAnimes(animeTmdbIds, logger) {
  if (!animeTmdbIds || animeTmdbIds.length === 0) {
    return [];
  }

  const results = await Promise.allSettled(
    animeTmdbIds.map(async (id) => {
      const imageData = await fetchAndProcessTmdbImagesWithCache(id, logger); // imageData contém {id, logos, backdrops, posters}
      // Passar logger e ID para selectPreferredLogoFromArray para depuração
      const preferredLogoObject = selectPreferredLogoFromArray(
        imageData.logos || [],
        logger,
        id
      );
      return {
        anime_id: id,
        logo: preferredLogoObject,
      };
    })
  );

  const successfulData = [];
  results.forEach((result) => {
    if (result.status === "fulfilled") {
      successfulData.push(result.value);
    } else {
      if (logger && typeof logger.error === "function") {
        // O ID que falhou não está diretamente em result.reason, precisaria de uma forma de passá-lo.
        // Por ora, o log dentro de fetchAndProcessTmdbImagesWithCache (se o erro for lá) ou aqui de forma genérica.
        logger.error(
          { err: result.reason },
          `Falha ao processar logo para um anime no batch (Promise.allSettled).`
        );
      }
    }
  });
  return successfulData;
}

module.exports = {
  fetchAndProcessTmdbImagesWithCache,
  fetchLogosOnlyForMultipleAnimes,
};
