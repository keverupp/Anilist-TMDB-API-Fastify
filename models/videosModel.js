const knex = require('knex')(require('../knexfile').development);

// Inserir múltiplos vídeos no banco de dados
async function insertVideos(videos) {
  return await knex('videos').insert(videos).onConflict('key').ignore();
}

// Buscar vídeos por série
async function getVideosByShowId(showId) {
  return await knex('videos').where({ show_id: showId });
}

module.exports = { insertVideos, getVideosByShowId };
