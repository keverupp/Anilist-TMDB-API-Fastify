const {
  getAnimeRankings,
  rateAnime,
  pickSeasonBest,
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

  // Rota para obter os animes avaliados pelo usuário (requer autenticação)
  fastify.get(
    "/anime/my-ratings",
    { preHandler: authenticate },
    async (req, reply) => {
      // Criamos uma query para buscar os animes avaliados pelo usuário
      try {
        const user_id = req.user.id;

        // Determinar temporada atual
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        let currentSeason;
        if (currentMonth >= 12 || currentMonth <= 2) {
          currentSeason = "verão";
        } else if (currentMonth >= 3 && currentMonth <= 5) {
          currentSeason = "outono";
        } else if (currentMonth >= 6 && currentMonth <= 8) {
          currentSeason = "inverno";
        } else {
          currentSeason = "primavera";
        }

        // Buscar avaliações do usuário
        const ratings = await knex("anime_rankings")
          .select([
            "anime_rankings.anime_id",
            "anime_rankings.stars",
            "anime_rankings.updated_at",
            "animes.name",
            "animes.poster_path",
          ])
          .join("animes", "anime_rankings.anime_id", "animes.id")
          .where({
            user_id,
            season: currentSeason,
            year: currentYear,
          })
          .orderBy("anime_rankings.updated_at", "desc");

        // Buscar escolha do melhor anime
        const bestPick = await knex("season_best_picks")
          .select([
            "season_best_picks.anime_id",
            "animes.name",
            "animes.poster_path",
          ])
          .join("animes", "season_best_picks.anime_id", "animes.id")
          .where({
            user_id,
            season: currentSeason,
            year: currentYear,
          })
          .first();

        return reply.status(200).send({
          season: currentSeason,
          year: currentYear,
          ratings: ratings,
          best_pick: bestPick || null,
        });
      } catch (error) {
        console.error("Erro ao buscar avaliações do usuário:", error);
        return reply
          .status(500)
          .send({ error: "Erro ao buscar avaliações do usuário." });
      }
    }
  );
}

module.exports = animeRankingRoutes;
