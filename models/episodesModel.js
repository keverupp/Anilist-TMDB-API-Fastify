const knex = require('knex')(require('../knexfile').development);

async function findEpisode({ anime_season_id, episode_number }) {
  return await knex('episodes')
    .where({ anime_season_id, episode_number })
    .first();
}

async function createEpisode(episodeData) {
  await knex('episodes').insert(episodeData);
}

async function getEpisodesByAnimeId(animeId, page = 1, limit = 10) {
  const offset = (page - 1) * limit;

  // Buscar episódios com paginação
  const episodes = await knex('episodes')
    .join('anime_seasons', 'episodes.anime_season_id', 'anime_seasons.id')
    .select(
      'episodes.id',
      'episodes.name',
      'episodes.episode_number',
      'episodes.overview',
      'episodes.air_date',
      'episodes.vote_average',
      'episodes.vote_count',
      'episodes.still_path',
      'episodes.runtime',
      'episodes.tmdb_id',
      'anime_seasons.anime_id'
    )
    .where('anime_seasons.anime_id', animeId)
    .orderBy('episodes.episode_number', 'asc')
    .limit(limit)
    .offset(offset);

  // Contar o total de episódios
  const [{ count }] = await knex('episodes')
    .join('anime_seasons', 'episodes.anime_season_id', 'anime_seasons.id')
    .where('anime_seasons.anime_id', animeId)
    .count('episodes.id as count');

  return { episodes, total: parseInt(count, 10) };
}

// Buscar episódios com runtime nulo
async function getEpisodesWithNullRuntime() {
  return await knex('episodes')
    .select(
      'episodes.id',
      'episodes.anime_season_id',
      'episodes.episode_number',
      'episodes.tmdb_id',
      'episodes.show_id',
      'seasons.season as season_number'
    )
    .join('anime_seasons', 'episodes.anime_season_id', 'anime_seasons.id')
    .join('seasons', 'anime_seasons.season_id', 'seasons.id')
    .whereNull('episodes.runtime');
}

// Atualizar informações completas de um episódio
async function updateEpisodeInfo(id, updatedData) {
  await knex('episodes')
    .where({ id })
    .update({ ...updatedData, updated_at: knex.fn.now() });
}


module.exports = { findEpisode, createEpisode, getEpisodesByAnimeId, updateEpisodeInfo, getEpisodesWithNullRuntime };
