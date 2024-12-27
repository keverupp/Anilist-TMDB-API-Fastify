const {
  addSeason,
  getSeason,
  getSeasons,
  editSeason,
  removeSeason,
  getSeasonsByAnimeId,
} = require('../controllers/seasonController');

async function seasonRoutes(fastify, options) {
  fastify.post('/seasons', addSeason); // Adicionar nova temporada
  fastify.get('/seasons', getSeasons); // Listar temporadas com filtros
  fastify.get('/seasons/:id', getSeason); // Buscar temporada por ID
  fastify.put('/seasons/:id', editSeason); // Atualizar temporada por ID
  fastify.delete('/seasons/:id', removeSeason); // Excluir temporada por ID
  fastify.get('/animes/:anime_id/seasons', getSeasonsByAnimeId);
}

module.exports = seasonRoutes;
