const {
  findAnimeById,
  insertAnime,
  findGenresByAnimeId,
  findGenreById,
  insertAnimeGenreRelation,
  upsertSeason,
  insertAnimeSeasonRelation,
  getEnglishTitleFromTitles,
  processKeywords,
  findKeywordsByAnimeId,
} = require("../models/animeModel");
const axios = require("axios");

/**
 * Valida se o ID fornecido é um número válido e positivo.
 */
const isValidId = (id) => {
  const num = Number(id);
  return id && !isNaN(num) && num > 0;
};

/**
 * Formata os dados do anime provenientes da API TMDB e AniList.
 */
const formatAnimeData = (data, aniListInfo = {}) => ({
  id: data.id,
  name: data.name || "N/A",
  overview: data.overview || "Descrição não disponível.",
  poster_path: data.poster_path
    ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
    : null,
  backdrop_path: data.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}`
    : null,
  first_air_date: data.first_air_date || null,
  is_current_season: aniListInfo.is_current_season || false,
  anilist_id: aniListInfo.anilist_id || null,
  banner_path: aniListInfo.banner_path || null,
  episodes_count: data.number_of_episodes || null,
  adult: data.adult || false,
  in_production: data.in_production || false,
  homepage: data.homepage || null,
  vote_average: data.vote_average || 0,
  vote_count: data.vote_count || 0,
  original_name: data.original_name || null,
  original_language: data.original_language || null,
  number_of_seasons: data.number_of_seasons || null,
  number_of_episodes: data.number_of_episodes || null,
  popularity: data.popularity || 0,
  status: data.status || null,
  episode_run_time: data.episode_run_time?.[0] || null,
  type: data.type || null,
});

/**
 * Busca informações do AniList.
 */
async function fetchAniListInfo(englishTitle) {
  const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        id
        bannerImage
        nextAiringEpisode { airingAt }
      }
    }
  `;
  const variables = { search: englishTitle };
  const response = await axios.post(
    "https://graphql.anilist.co",
    { query, variables },
    { headers: { "Content-Type": "application/json" } }
  );
  const data = response.data.data.Media;
  return {
    anilist_id: data.id,
    banner_path: data.bannerImage,
    is_current_season: !!data.nextAiringEpisode,
  };
}

/**
 * Processa e salva os gêneros associados ao anime.
 */
const processGenres = async (genres, animeId, logger) => {
  await Promise.all(
    genres.map(async (genre) => {
      try {
        const existingGenre = await findGenreById(genre.id);
        if (existingGenre) {
          await insertAnimeGenreRelation(animeId, existingGenre.id);
        } else {
          logger.warn(
            `Gênero não encontrado no banco: ID ${genre.id}, Nome: ${genre.name}`
          );
        }
      } catch (error) {
        logger.error(
          `Erro ao processar gênero: ID ${genre.id}, Nome: ${genre.name}`,
          error
        );
      }
    })
  );
};

/**
 * Processa e salva as temporadas associadas ao anime.
 * Ignora temporadas especiais (season_number = 0).
 */
const processSeasons = async (seasons, animeId, logger) => {
  const numberedSeasons = (seasons || []).filter((s) => s.season_number > 0);
  await Promise.all(
    numberedSeasons.map(async (season) => {
      try {
        const seasonId = await upsertSeason({
          id: season.id,
          name: season.name,
          season_number: season.season_number,
          air_date: season.air_date,
        });
        await insertAnimeSeasonRelation(animeId, seasonId);
      } catch (error) {
        logger.error(
          `Erro ao processar temporada: ${season.name}`,
          error.message
        );
      }
    })
  );
};

/**
 * Controlador para obter informações de um anime, incluindo integração com TMDB e AniList.
 */
async function getAnime(req, reply) {
  const { id } = req.params;
  if (!isValidId(id)) {
    return reply.status(400).send({
      error: 'Parâmetro "id" inválido.',
      message: "O ID deve ser um número válido e positivo.",
    });
  }

  try {
    const animeId = Number(id);
    let anime = await findAnimeById(animeId);
    if (anime) {
      // Busca tanto os gêneros quanto as keywords do anime
      const [genres, keywords] = await Promise.all([
        findGenresByAnimeId(animeId),
        findKeywordsByAnimeId(animeId),
      ]);
      return reply.send({ ...anime, genres, keywords });
    }

    const titleInfo = await getEnglishTitleFromTitles(animeId);
    if (!titleInfo?.english_title) {
      throw new Error(
        `Título em inglês não encontrado para o anime com ID ${animeId}.`
      );
    }

    // 1. Busca TMDB
    const { TMDB_API_KEY } = process.env;
    const { data: animeData } = await axios.get(
      `https://api.themoviedb.org/3/tv/${animeId}`,
      { params: { api_key: TMDB_API_KEY, language: "pt-BR" } }
    );

    // 2. Tenta AniList, mas ignora erros / 404
    let aniListInfo = {};
    try {
      aniListInfo = await fetchAniListInfo(titleInfo.english_title);
    } catch (err) {
      req.log.warn(
        `AniList não encontrou "${titleInfo.english_title}", seguindo apenas com TMDB.`
      );
    }

    // 3. Formata e salva
    const formattedAnime = formatAnimeData(animeData, aniListInfo);
    await insertAnime(formattedAnime);

    // 4. Busca keywords e processa relacionamentos
    const { data: keywordData } = await axios.get(
      `https://api.themoviedb.org/3/tv/${animeId}/keywords`,
      { params: { api_key: TMDB_API_KEY } }
    );

    await Promise.all([
      processGenres(animeData.genres || [], animeId, req.log),
      processSeasons(animeData.seasons, animeId, req.log),
      processKeywords(animeId, req.log, keywordData.results || []),
    ]);

    const [genres, keywords] = await Promise.all([
      findGenresByAnimeId(animeId),
      findKeywordsByAnimeId(animeId),
    ]);

    return reply.send({ ...formattedAnime, genres, keywords });
  } catch (error) {
    req.log.error(error);
    if (error.response?.data) {
      return reply.status(500).send({
        error: "Erro ao buscar dados da API externa.",
        details: error.response.data,
      });
    }
    return reply.status(500).send({
      error: "Erro desconhecido.",
      details: error.message,
    });
  }
}

module.exports = { getAnime };
