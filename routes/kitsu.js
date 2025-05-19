// routes.js (ou onde você registra suas rotas)
const {
  updateEpisodesKitsune,
} = require("../controllers/KitsuEpisodeController");

async function kitsuRoutes(fastify, options) {
  // Rota para importar episódios
  fastify.post("/animes/:animeId/update-episodes-kitsune", updateEpisodesKitsune);
}

module.exports = kitsuRoutes;
