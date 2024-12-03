const axios = require("axios");
const knex = require("knex")(require("../knexfile").development);

async function genresRoutes(fastify, options) {
  fastify.post("/populate-genres", async (request, reply) => {
    try {
      // Faz a requisição para a API AniList para buscar os gêneros
      const anilistResponse = await axios.post("https://graphql.anilist.co", {
        query: `
          query {
            GenreCollection
          }
        `
      });

      const genres = anilistResponse.data?.data?.GenreCollection;

      if (!genres || genres.length === 0) {
        return reply.status(404).send({
          error: "Nenhum gênero encontrado.",
          message: "A API AniList não retornou gêneros."
        });
      }

      // Traduz os gêneros e insere no banco de dados
      const translatedGenres = await Promise.all(
        genres.map(async (genre) => {
          try {
            const translation = await fastify.deeplTranslator.translateText(
              genre,
              "en", // Idioma de origem
              "pt-BR" // Traduzir para português
            );

            // Retorna o gênero traduzido com o original
            return {
              name_en: genre,
              name_pt: translation.text
            };
          } catch (error) {
            fastify.log.error(`Erro ao traduzir gênero: ${genre}`, error);
            // Retorna o gênero em inglês caso a tradução falhe
            return {
              name_en: genre,
              name_pt: genre
            };
          }
        })
      );

      // Insere os gêneros no banco de dados
      for (const genre of translatedGenres) {
        await knex("genres")
          .insert(genre)
          .onConflict("name_en") // Evitar duplicatas com base no nome em inglês
          .ignore();
      }

      reply.send({
        message: "Tabela de gêneros populada com sucesso.",
        genres: translatedGenres
      });
    } catch (error) {
      fastify.log.error(error);

      // Tratamento de erros
      if (error.response && error.response.data) {
        return reply.status(500).send({
          error: "Erro ao buscar gêneros na API AniList.",
          details: error.response.data,
        });
      }

      if (error.isAxiosError) {
        return reply.status(500).send({
          error: "Erro de rede ao conectar à API AniList.",
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

module.exports = genresRoutes;
