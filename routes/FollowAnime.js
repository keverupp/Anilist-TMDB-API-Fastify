const { toggleFollowAnime } = require("../controllers/AnimeController");
const { authenticate } = require("../middlewares/AuthMiddleware");

async function animeRoutes(fastify, options) {
  // Rota para alternar seguir/parar de seguir um anime
  fastify.post("/anime/follow", { preHandler: authenticate }, toggleFollowAnime);
}

module.exports = animeRoutes;
