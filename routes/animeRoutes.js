const { getAnime } = require("../controllers/animeController");

async function animeRoutes(fastify, options) {
  fastify.get("/anime/:id", getAnime);
}

module.exports = animeRoutes;
