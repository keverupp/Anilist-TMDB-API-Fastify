const { listReturningSeries } = require('../controllers/homeController');

async function animeRoutes(fastify, options) {
  fastify.get('/animes/returning-series', listReturningSeries);
}

module.exports = animeRoutes;
