const {
  fetchEpisodes,
  listEpisodes,
  updatePendingEpisodes,
} = require("../controllers/episodesController");

async function episodeRoutes(fastify, options) {
  // Rota para importar episódios
  fastify.post("/anime/:animeId/episodes", fetchEpisodes);

  // Rota para listar episódios de um anime com paginação
  fastify.get("/anime/:animeId/episodes", listEpisodes);

  // Rota para atualizar episódios com runtime nulo
  fastify.post('/episodes/update-pending', updatePendingEpisodes);
}

module.exports = episodeRoutes;
