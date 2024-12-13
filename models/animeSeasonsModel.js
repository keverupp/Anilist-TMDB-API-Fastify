const knex = require('knex')(require('../knexfile').development);

async function getAnimeSeasons(animeId) {
  return await knex('anime_seasons')
    .join('seasons', 'anime_seasons.season_id', 'seasons.id')
    .select('anime_seasons.id as anime_season_id', 'seasons.season', 'seasons.year')
    .where('anime_seasons.anime_id', animeId);
}

async function getAnimeSeasonId(animeId, season, year) {
  const query = knex('anime_seasons')
    .join('seasons', 'anime_seasons.season_id', 'seasons.id')
    .select('anime_seasons.id as anime_season_id');

  if (animeId) {
    query.where('anime_seasons.anime_id', animeId);
  }
  if (season) {
    query.where('seasons.season', season);
  }
  if (year) {
    query.where('seasons.year', year);
  }

  return await query.first(); // Retorna o primeiro resultado encontrado
}

module.exports = { getAnimeSeasons, getAnimeSeasonId };
