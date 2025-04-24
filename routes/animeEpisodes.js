const {
  fetchEpisodes,
  listEpisodes,
  updatePendingEpisodes,
  getRecentEpisodes,
  getEpisodeById,
} = require("../controllers/episodesController");

const {
  getRecentEpisodesFromReturningSeries,
} = require("../controllers/getRecentEpisodesFromReturningSeries");

const { getUpcomingEpisodes } = require("../controllers/getUpcomingEpisodes");

async function episodeRoutes(fastify, options) {
  // Rota para importar episódios
  fastify.post("/anime/:animeId/episodes", fetchEpisodes);

  // Rota para listar episódios de um anime com paginação
  fastify.get("/anime/:animeId/episodes", listEpisodes);

  // Rota para atualizar episódios com runtime nulo
  fastify.post("/episodes/update-pending", updatePendingEpisodes);

  fastify.get("/episodes/all-recent-episodes", getRecentEpisodes);

  fastify.get("/episodes/recent-updates", getRecentEpisodesFromReturningSeries);

  fastify.get("/episodes/get-upcoming", getUpcomingEpisodes);

  fastify.get("/episodes/:episodeId", getEpisodeById);
}

module.exports = episodeRoutes;
