const {
  getCurrentSeasonAndYear,
  fetchEpisodesFromAnilist,
  processAndSaveEpisodes,
  delay,
} = require("../services/EpisodeService");
const knex = require("knex")(require("../knexfile").development);

async function episodesRoutes(fastify, options) {
  fastify.get("/episodes/new", async (request, reply) => {
    try {
      // Obtém a temporada e ano atuais
      const { currentSeason, currentYear } = await getCurrentSeasonAndYear();

      // Busca animes da temporada no banco
      const currentSeasonAnimes = await knex("animes")
        .where({ season: currentSeason, season_year: currentYear })
        .select("id");

      if (currentSeasonAnimes.length === 0) {
        return reply.status(404).send({
          error: "Nenhum anime da temporada atual encontrado no banco.",
        });
      }

      const results = [];
      for (const anime of currentSeasonAnimes) {
        await delay(500); // Atraso para evitar rate limit
        try {
          // Busca episódios na AniList
          const episodes = await fetchEpisodesFromAnilist(anime.id);
          if (episodes.length === 0) {
            results.push({ anime_id: anime.id, status: "no_episodes" });
            continue;
          }

          // Processa e salva episódios no banco
          const newEpisodes = await processAndSaveEpisodes(
            anime.id,
            episodes,
            fastify
          );

          results.push({
            anime_id: anime.id,
            status: "episodes_added",
            newEpisodes,
          });
        } catch (err) {
          fastify.log.error(
            `Erro ao processar anime ${anime.id}: ${err.message}`,
            { stack: err.stack }
          );
          results.push({ anime_id: anime.id, status: "error", error: err.message });
        }
      }

      return reply.send({
        message: "Processamento de episódios concluído.",
        results,
      });
    } catch (error) {
      fastify.log.error(error);

      return reply.status(500).send({
        error: "Erro ao processar episódios.",
        details: error.message,
      });
    }
  });
}

module.exports = episodesRoutes;
