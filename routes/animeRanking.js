const {
  getAnimeRankings,
  rateAnime,
  pickSeasonBest,
  UserRanking,
} = require("../controllers/animeRankingController");
const { authenticate } = require("../middlewares/AuthMiddleware");

async function animeRankingRoutes(fastify, options) {
  // Rota para obter o ranking de animes (público)
  fastify.get("/anime/ranking", getAnimeRankings);

  // Rota para avaliar um anime com estrelas (requer autenticação)
  fastify.post("/anime/rate", { preHandler: authenticate }, rateAnime);

  // Rota para escolher o melhor anime da temporada (requer autenticação)
  fastify.post(
    "/anime/best-pick",
    { preHandler: authenticate },
    pickSeasonBest
  );

  fastify.get("/anime/my-ratings", { preHandler: authenticate }, UserRanking);
}

module.exports = animeRankingRoutes;
