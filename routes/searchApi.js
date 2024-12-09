const { searchAnimes } = require('../controllers/searchController');

async function searchApiRoutes(fastify) {
  fastify.get('/search-api', searchAnimes);
}

module.exports = searchApiRoutes;
