const knex = require('knex')(require('../knexfile').development);

async function createSeason(season) {
  return await knex('seasons').insert(season).returning('*');
}

async function findSeasonById(id) {
  return await knex('seasons').where({ id }).first();
}

async function listSeasons(filters = {}) {
  const query = knex('seasons').select('*');

  if (filters.year) {
    query.where('year', filters.year);
  }

  if (filters.season) {
    query.where('season', filters.season);
  }

  return await query;
}

async function updateSeason(id, data) {
  return await knex('seasons')
    .where({ id })
    .update({ ...data, updated_at: knex.fn.now() })
    .returning('*');
}

async function deleteSeason(id) {
  return await knex('seasons').where({ id }).del();
}

module.exports = {
  createSeason,
  findSeasonById,
  listSeasons,
  updateSeason,
  deleteSeason,
};
