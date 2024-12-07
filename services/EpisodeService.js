const axios = require("axios");
const knex = require("knex")(require("../knexfile").development);
const { notifyNewEpisode } = require("./NotificationService");

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getCurrentSeasonAndYear() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentSeason = ["WINTER", "SPRING", "SUMMER", "FALL"][
    Math.floor(currentDate.getMonth() / 3)
  ];
  return { currentSeason, currentYear };
}

async function fetchEpisodesFromAnilist(animeId) {
  try {
    const response = await axios.post("https://graphql.anilist.co", {
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
      variables: { id: animeId },
    });

    return response.data?.data?.Media?.streamingEpisodes || [];
  } catch (error) {
    throw new Error(`Erro ao buscar episódios no AniList: ${error.message}`);
  }
}

async function processAndSaveEpisodes(animeId, episodes, fastify) {
  const newEpisodes = await Promise.all(
    episodes.reverse().map(async (episode, index) => {
      try {
        const translatedTitle = await processEpisodeTitle(
          episode.title || `Episódio ${index + 1}`,
          index + 1,
          fastify
        );

        const episodeData = {
          anime_id: animeId,
          episode_number: index + 1,
          title_english: episode.title || `Episódio ${index + 1}`,
          title_translated: translatedTitle,
          url: episode.url,
          site: episode.site,
          image_url: episode.thumbnail || "https://via.placeholder.com/300",
        };

        const insertedEpisode = await knex("episodes")
          .insert(episodeData)
          .onConflict(["anime_id", "episode_number"])
          .ignore()
          .returning("id");

        // O `insertedEpisode` pode ser um array dependendo do banco
        const episodeId = insertedEpisode[0]?.id || insertedEpisode?.id;

        // Verifica se o episódio foi inserido e chama a notificação
        if (episodeId) {
          fastify.log.info(`Notificando seguidores sobre o episódio ${episodeId}`);
          await notifyNewEpisode(animeId, episodeId);
        } else {
          fastify.log.info(`Episódio ${index + 1} já existia no banco.`);
        }

        return episodeData;
      } catch (error) {
        fastify.log.error(
          `Erro ao salvar episódio para anime ${animeId}: ${error.message}`
        );
        return null;
      }
    })
  );

  return newEpisodes.filter((ep) => ep !== null);
}



async function processEpisodeTitle(title, episodeNumber, fastify) {
  try {
    const normalizedTitle = title.replace(/Episode \d+ - /i, "").trim();
    const translatedResult = await fastify.deeplTranslator.translateText(
      normalizedTitle,
      "en",
      "pt-BR",
      { splitSentences: "1" }
    );
    return `Episódio ${episodeNumber} - ${translatedResult.text}`;
  } catch (error) {
    fastify.log.error(`Erro ao traduzir título do episódio: ${error.message}`);
    return `Episódio ${episodeNumber} - ${title}`;
  }
}

module.exports = {
  getCurrentSeasonAndYear,
  fetchEpisodesFromAnilist,
  processAndSaveEpisodes,
  delay,
};
