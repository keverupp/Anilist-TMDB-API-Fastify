const { getAnime } = require("../controllers/AnimeController");
const { getAllAnimes} = require('../controllers/listAnimesController');

async function animeRoutes(fastify, options) {
  
  fastify.get("/anime/:id", getAnime);

  fastify.get('/animes', getAllAnimes);
  }


module.exports = animeRoutes;
