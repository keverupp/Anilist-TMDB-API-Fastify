const {
  getCurrentSeasonAnimes,
} = require("../controllers/currentSeasonAnimes");

async function currentSeasonRoutes(fastify, options) {
  // Rota para obter animes da temporada atual
  fastify.get("/anime/current-season", getCurrentSeasonAnimes);
}

module.exports = currentSeasonRoutes;
