const {
  fetchEpisodes,
  listEpisodes,
  updatePendingEpisodes,
  getRecentEpisodes,
} = require("../controllers/episodesController");

const {
  getRecentEpisodesFromReturningSeries,
} = require("../controllers/getRecentEpisodesFromReturningSeries");

async function episodeRoutes(fastify, options) {
  // Rota para importar episódios
  fastify.post("/anime/:animeId/episodes", fetchEpisodes);

  // Rota para listar episódios de um anime com paginação
  fastify.get("/anime/:animeId/episodes", listEpisodes);

  // Rota para atualizar episódios com runtime nulo
  fastify.post("/episodes/update-pending", updatePendingEpisodes);

  fastify.get("/episodes/all-recent-episodes", getRecentEpisodes);

  fastify.get("/episodes/recent-updates", getRecentEpisodesFromReturningSeries);
}

module.exports = episodeRoutes;
