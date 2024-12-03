const axios = require("axios");
const knex = require("knex")(require("../knexfile").development);

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function episodesRoutes(fastify, options) {
  fastify.get("/episodes/new", async (request, reply) => {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentSeason = ["WINTER", "SPRING", "SUMMER", "FALL"][
        Math.floor(currentDate.getMonth() / 3)
      ];

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
          // Busca episódios na API AniList
          const anilistResponse = await axios.post(
            "https://graphql.anilist.co",
            {
              query: `
                query ($id: Int) {
                  Media(id: $id) {
                    id
                    streamingEpisodes {
                      title
                      thumbnail
                      url
                      site
                    }
                  }
                }
              `,
              variables: { id: anime.id },
            }
          );

          const episodeNodes =
            anilistResponse.data?.data?.Media?.streamingEpisodes || [];

          if (episodeNodes.length === 0) {
            results.push({ anime_id: anime.id, status: "no_episodes" });
            continue;
          }

          // Ordenar os episódios pela URL (ou outro critério confiável)
          const orderedEpisodes = episodeNodes.reverse(); // Inverte a ordem

          // Traduzir e salvar episódios
          const newEpisodes = await Promise.all(
            orderedEpisodes.map(async (episode, index) => {
              try {
                const translatedTitle =
                  await fastify.deeplTranslator.translateText(
                    episode.title || `Episódio ${index + 1}`,
                    "en",
                    "pt-BR"
                  );

                const episodeData = {
                  anime_id: anime.id,
                  episode_number: index + 1, // Atribui a numeração correta
                  title_english: episode.title || `Episódio ${index + 1}`,
                  title_translated: translatedTitle.text,
                  url: episode.url,
                  site: episode.site,
                  image_url:
                    episode.thumbnail || "https://via.placeholder.com/300",
                };

                await knex("episodes")
                  .insert(episodeData)
                  .onConflict(["anime_id", "episode_number"])
                  .ignore();

                return episodeData;
              } catch (translateOrInsertError) {
                fastify.log.error(
                  `Erro ao traduzir ou salvar episódio para anime ${anime.id}: ${translateOrInsertError.message}`
                );
                return null;
              }
            })
          );

          results.push({
            anime_id: anime.id,
            status: "episodes_added",
            newEpisodes: newEpisodes.filter((ep) => ep !== null),
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
