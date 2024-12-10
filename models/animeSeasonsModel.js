const knex = require('knex')(require('../knexfile').development);

async function getAnimeSeasons(animeId) {
  return await knex('anime_seasons')
    .join('seasons', 'anime_seasons.season_id', 'seasons.id')
    .select('anime_seasons.id as anime_season_id', 'seasons.season', 'seasons.year')
    .where('anime_seasons.anime_id', animeId);
}

module.exports = { getAnimeSeasons };
