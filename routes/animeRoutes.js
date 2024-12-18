const { getAnime } = require("../controllers/AnimeController");

async function animeRoutes(fastify, options) {
  fastify.get("/anime/:id", getAnime);
}

module.exports = animeRoutes;
