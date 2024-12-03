const axios = require("axios");
const knex = require("knex")(require("../knexfile").development);

async function processEpisodeTitle(title, episodeNumber, fastify) {
  try {
    // Normaliza o título, removendo "Episode X - " se existir
    const normalizedTitle = title.replace(/Episode \d+ - /i, "").trim();

    // Traduz apenas a parte relevante
    const translatedResult = await fastify.deeplTranslator.translateText(
      normalizedTitle,
      "en",
      "pt-BR",
      { splitSentences: "1" } // Tradução frase por frase
    );

    // Reconstrói o título no formato padrão
    return `Episódio ${episodeNumber} - ${translatedResult.text}`;
  } catch (error) {
    fastify.log.error(`Erro ao traduzir título do episódio: ${error.message}`);
    // Retorna o título original como fallback
    return `Episódio ${episodeNumber} - ${title}`;
  }
}

async function episodesRoutes(fastify, options) {
  fastify.get("/episodes/:id", async (request, reply) => {
    const { id } = request.params;

    // Validação do parâmetro `id`
    if (!id || isNaN(Number(id)) || Number(id) <= 0) {
      return reply.status(400).send({
        error: 'Parâmetro "id" inválido.',
        message: "O ID deve ser um número positivo.",
      });
    }

    try {
      // Verifica se os episódios já estão no banco de dados
      const episodes = await knex("episodes").where({ anime_id: id }).select();

      if (episodes.length > 0) {
        // Se episódios já estão no banco, retorna
        return reply.send(episodes);
      }

      // Busca episódios na API AniList
      const anilistResponse = await axios.post("https://graphql.anilist.co", {
        query: `
          query ($id: Int) {
            Media(id: $id) {
              episodes
              streamingEpisodes {
                title
                thumbnail
                url
                site
              }
            }
          }
        `,
        variables: { id },
      });

      const episodeNodes =
        anilistResponse.data?.data?.Media?.streamingEpisodes || [];

      if (episodeNodes.length === 0) {
        return reply.status(404).send({
          error: "Nenhum episódio encontrado para este anime na API Anilist.",
        });
      }

      // Traduzir e salvar episódios
      const translatedEpisodes = await Promise.all(
        episodeNodes.map(async (episode, index) => {
          try {
            // Traduzir e reconstruir o título do episódio
            const translatedTitle = await processEpisodeTitle(
              episode.title || `Episódio ${index + 1}`,
              index + 1,
              fastify
            );

            return {
              anime_id: id,
              episode_number: index + 1,
              title_english: episode.title || `Episódio ${index + 1}`,
              title_translated: translatedTitle,
              url: episode.url,
              site: episode.site,
              image_url:
                episode.thumbnail || "https://via.placeholder.com/300",
            };
          } catch (error) {
            fastify.log.error(
              `Erro ao processar episódio ${index + 1} para anime ${id}: ${error.message}`
            );
            return null;
          }
        })
      );

      // Filtrar episódios válidos
      const validEpisodes = translatedEpisodes.filter((ep) => ep !== null);

      // Salva os episódios no banco de dados
      await knex("episodes")
        .insert(validEpisodes)
        .onConflict(["anime_id", "episode_number"])
        .ignore();

      // Retorna os episódios traduzidos
      return reply.send(validEpisodes);
    } catch (error) {
      fastify.log.error(error);

      // Tratamento de erros
      if (error.response && error.response.data) {
        return reply.status(500).send({
          error: "Erro ao buscar episódios na API Anilist.",
          details: error.response.data,
        });
      }

      if (error.isAxiosError) {
        return reply.status(500).send({
          error: "Erro de rede ao conectar à API Anilist.",
        });
      }

      if (error.message && error.message.includes("DEEPL")) {
        return reply.status(500).send({
          error: "Erro ao traduzir com o DeepL.",
          details: error.message,
        });
      }

      return reply.status(500).send({ error: "Erro desconhecido." });
    }
  });
}

module.exports = episodesRoutes;
