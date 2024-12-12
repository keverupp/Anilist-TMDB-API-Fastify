const { toggleFollowAnime, listFollowedAnimes } = require("../controllers/FollowAnimeController");
const { authenticate } = require("../middlewares/AuthMiddleware");

async function animeRoutes(fastify, options) {
  // Rota para alternar seguir/parar de seguir um anime
  fastify.post("/anime/follow", { preHandler: authenticate }, toggleFollowAnime);

  // Rota para listar animes seguidos pelo usuário
  fastify.get("/anime/followed", { preHandler: authenticate }, listFollowedAnimes);
}

module.exports = animeRoutes;
