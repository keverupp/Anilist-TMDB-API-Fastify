const axios = require("axios");
const knex = require("knex")(require("../knexfile").development);

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
      
      const episodeNodes = anilistResponse.data?.data?.Media?.streamingEpisodes || [];
      
      if (episodeNodes.length === 0) {
        return reply.status(404).send({
          error: "Nenhum episódio encontrado para este anime na API Anilist.",
        });
      }
      
      // Traduz os títulos dos episódios
      const translatedEpisodes = await Promise.all(
        episodeNodes.map(async (episode, index) => {
          const translatedTitle = await fastify.deeplTranslator.translateText(
            episode.title || `Episódio ${index + 1}`,
            "en", // Detectar automaticamente o idioma de origem
            "pt-BR" // Traduzir para português
          );
      
          return {
            anime_id: id,
            episode_number: index + 1,
            title_english: episode.title || `Episódio ${index + 1}`,
            title_translated: translatedTitle.text,
            url: episode.url,
            site: episode.site,
            image_url: episode.thumbnail || "https://via.placeholder.com/300",
          };
        })
      );
      
      // Salva os episódios no banco de dados
      await knex("episodes").insert(translatedEpisodes);
      
      // Retorna os episódios traduzidos
      return reply.send(translatedEpisodes);      
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
