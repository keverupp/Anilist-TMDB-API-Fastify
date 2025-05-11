const {
  fetchEpisodes,
  listEpisodes,
  updatePendingEpisodes,
  getAllRecentEpisodes,
  getEpisodeById,
} = require("../controllers/episodesController");

const {
  getRecentEpisodes,
} = require("../controllers/recentEpisodesController");

const { getUpcomingEpisodes } = require("../controllers/getUpcomingEpisodes");

async function episodeRoutes(fastify, options) {
  // Rota para importar episódios
  fastify.post("/anime/:animeId/episodes", fetchEpisodes);

  // Rota para listar episódios de um anime com paginação
  fastify.get("/anime/:animeId/episodes", listEpisodes);

  // Rota para atualizar episódios com runtime nulo
  fastify.post("/episodes/update-pending", updatePendingEpisodes);

  fastify.get("/episodes/all-recent-episodes", getAllRecentEpisodes);

  fastify.get("/episodes/recent", getRecentEpisodes);

  fastify.get("/episodes/get-upcoming", getUpcomingEpisodes);

  fastify.get("/episodes/:episodeId", getEpisodeById);
}

module.exports = episodeRoutes;
