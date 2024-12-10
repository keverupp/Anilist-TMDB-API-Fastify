const knex = require('knex')(require('../knexfile').development);

async function insertTitles(titles) {
  try {
    await knex('titles')
      .insert(titles)
      .onConflict('id') // Previne duplicatas pelo ID
      .merge(); // Atualiza os dados caso o ID já exista
  } catch (error) {
    throw new Error('Failed to insert titles into database: ' + error.message);
  }
}

// Busca títulos na tabela "titles"
const findTitles = async (query) => {
    return knex('titles')
        .where('english_title', 'ilike', `%${query}%`)
        .orWhere('pt_title', 'ilike', `%${query}%`)
        .orWhere('native_title', 'ilike', `%${query}%`)
        .select('id', 'english_title', 'pt_title', 'native_title');
};

// Busca anime_id na tabela "alternative_titles"
const findAnimeIdByAlternativeTitle = async (query) => {
  const results = await knex('alternative_titles')
      .where('title', 'ilike', `%${query}%`)
      .select('anime_id');
  return results;
};


// Busca título principal na tabela "titles" usando anime_id
const findTitleById = async (animeId) => {
  return knex('titles')
      .where('id', animeId)
      .select('id', 'english_title', 'pt_title', 'native_title')
      .first();
};


module.exports = {
  insertTitles,
  findTitles,
  findTitleById,
  findAnimeIdByAlternativeTitle,
};
