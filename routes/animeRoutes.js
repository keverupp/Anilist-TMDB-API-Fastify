const { getAnime } = require("../controllers/AnimeController");
const { getAllAnimes } = require("../controllers/listAnimesController");
const { syncTodayTitles } = require("../controllers/syncTitlesController");
const { getAiringTodayCached } = require("../controllers/getAiringTodayCached");
const { getAnimeLogos } = require("../controllers/LogosController");

async function animeRoutes(fastify, options) {
  fastify.get("/anime/:id", getAnime);

  fastify.get("/animes", getAllAnimes);

  // 🔄 Sincroniza dados do TMDB no banco (titles e alternative_titles)
  fastify.get("/animes/airing-today/sync", syncTodayTitles);

  // 🧠 Retorna dados da TMDB com cache em banco
  fastify.get("/animes/airing-today", getAiringTodayCached);

  fastify.get("/anime/:id/logos", getAnimeLogos);
}

module.exports = animeRoutes;
