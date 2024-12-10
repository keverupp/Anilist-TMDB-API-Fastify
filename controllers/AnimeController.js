const {
  findAnimeById,
  insertAnime,
  findGenresByAnimeId,
  findGenreByName,
  insertAnimeGenreRelation,
  upsertSeason,
  insertAnimeSeasonRelation,
  getEnglishTitleFromTitles,
} = require("../models/animeModel");
const axios = require("axios");

/**
 * Valida se o ID fornecido é um número válido e positivo.
 * @param {any} id - O ID a ser validado.
 * @returns {boolean} - Retorna true se válido, caso contrário false.
 */
const isValidId = (id) => {
  const num = Number(id);
  return id && !isNaN(num) && num > 0;
};

/**
 * Formata os dados do anime provenientes da API TMDB e AniList.
 * @param {object} data - Dados brutos do anime da API TMDB.
 * @param {object} aniListInfo - Dados adicionais da AniList.
 * @returns {object} - Dados formatados do anime para inserção no banco.
 */
const formatAnimeData = (data, aniListInfo = {}) => ({
  id: data.id,
  name: data.name || "N/A",
  overview: data.overview || "Descrição não disponível.",
  poster_path: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
  backdrop_path: data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : null,
  first_air_date: data.first_air_date || null,
  is_current_season: aniListInfo.is_current_season || false, // AniList info
  anilist_id: aniListInfo.anilist_id || null, // AniList ID
  banner_path: aniListInfo.banner_path || null, // Banner do AniList
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
  episode_run_time: data.episode_run_time ? data.episode_run_time[0] || null : null,
  type: data.type || null,
});

/**
 * Busca informações do AniList com base no título em inglês.
 * @param {string} englishTitle - O título em inglês do anime.
 * @returns {object} - Dados do AniList formatados.
 */
async function fetchAniListInfo(englishTitle) {
  const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        id
        bannerImage
        nextAiringEpisode {
          airingAt
        }
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
 * @param {array} genres - Array de gêneros do anime.
 * @param {number} animeId - ID do anime.
 * @param {object} logger - Objeto de logging (ex: req.log).
 */
const processGenres = async (genres, animeId, logger) => {
  const genrePromises = genres.map(async (genre) => {
    const existingGenre = await findGenreByName(genre.name);
    if (existingGenre) {
      await insertAnimeGenreRelation(animeId, existingGenre.id);
    } else {
      logger.warn(`Gênero não encontrado no banco: ${genre.name}`);
    }
  });
  await Promise.all(genrePromises);
};

/**
 * Processa e salva as temporadas associadas ao anime.
 * @param {array} seasons - Array de temporadas do anime.
 * @param {number} animeId - ID do anime.
 * @param {object} logger - Objeto de logging (ex: req.log).
 */
const processSeasons = async (seasons, animeId, logger) => {
  const seasonPromises = seasons.map(async (season) => {
    try {
      const seasonId = await upsertSeason({
        id: season.id,
        name: season.name,
        season_number: season.season_number,
        air_date: season.air_date,
      });

      await insertAnimeSeasonRelation(animeId, seasonId);
    } catch (error) {
      logger.error(`Erro ao processar temporada: ${season.name}`, error.message);
    }
  });
  await Promise.all(seasonPromises);
};

/**
 * Controlador para obter informações de um anime, incluindo integração com TMDB e AniList.
 * @param {object} req - Objeto de requisição.
 * @param {object} reply - Objeto de resposta.
 */
async function getAnime(req, reply) {
  const { id } = req.params;

  // Validação do parâmetro `id`
  if (!isValidId(id)) {
    return reply.status(400).send({
      error: 'Parâmetro "id" inválido.',
      message: "O ID deve ser um número válido e positivo.",
    });
  }

  try {
    const animeId = Number(id);

    // Verifica se o anime já está no banco de dados
    let anime = await findAnimeById(animeId);
    if (anime) {
      const genres = await findGenresByAnimeId(animeId);
      return reply.send({ ...anime, genres });
    }

    // Obtém o título em inglês do banco
    const titleInfo = await getEnglishTitleFromTitles(animeId);
    if (!titleInfo || !titleInfo.english_title) {
      throw new Error(`Título em inglês não encontrado para o anime com ID ${animeId}.`);
    }

    const englishTitle = titleInfo.english_title;

    // Busca informações do TMDB
    const { TMDB_API_KEY } = process.env;
    const tmdbResponse = await axios.get(`https://api.themoviedb.org/3/tv/${animeId}`, {
      params: { api_key: TMDB_API_KEY, language: "pt-BR" },
    });

    const animeData = tmdbResponse.data;

    // Busca informações do AniList
    const aniListInfo = await fetchAniListInfo(englishTitle);

    // Combina as informações do TMDB e AniList
    const formattedAnime = formatAnimeData(animeData, aniListInfo);

    // Salva o anime no banco
    await insertAnime(formattedAnime);

    // Processa e salva gêneros e temporadas em paralelo
    await Promise.all([
      processGenres(animeData.genres || [], animeId, req.log),
      processSeasons(animeData.seasons || [], animeId, req.log),
    ]);

    // Recupera gêneros associados para retorno
    const genres = await findGenresByAnimeId(animeId);

    // Retorna os dados salvos
    return reply.send({ ...formattedAnime, genres });
  } catch (error) {
    req.log.error(error);

    if (error.response && error.response.data) {
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
