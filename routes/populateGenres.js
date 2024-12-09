const axios = require("axios");
const knex = require("knex")(require("../knexfile").development);
require("dotenv").config();

async function genresRoutes(fastify, options) {
  fastify.post("/populate-genres", async (request, reply) => {
    try {
      const TMDB_API_KEY = process.env.TMDB_API_KEY;
      if (!TMDB_API_KEY) {
        throw new Error("Chave API do TMDB não configurada no .env.");
      }

      // Faz as requisições para obter gêneros em inglês e português
      const [enResponse, ptResponse] = await Promise.all([
        axios.get("https://api.themoviedb.org/3/genre/tv/list", {
          params: { api_key: TMDB_API_KEY, language: "en-US" },
        }),
        axios.get("https://api.themoviedb.org/3/genre/tv/list", {
          params: { api_key: TMDB_API_KEY, language: "pt-BR" },
        }),
      ]);

      const genresEn = enResponse.data.genres;
      const genresPt = ptResponse.data.genres;

      if (!genresEn || !genresPt || genresEn.length === 0 || genresPt.length === 0) {
        return reply.status(404).send({
          error: "Nenhum gênero encontrado.",
          message: "A API TMDB não retornou gêneros.",
        });
      }

      // Mapeia os gêneros com traduções
      const translatedGenres = genresEn.map((genreEn) => {
        const genrePt = genresPt.find((g) => g.id === genreEn.id);
        return {
          id: genreEn.id, // Mantém o ID original do TMDB
          name_en: genreEn.name,
          name_pt: genrePt ? genrePt.name : genreEn.name, // Usa o nome em inglês como fallback
        };
      });

      // Insere os gêneros no banco de dados
      for (const genre of translatedGenres) {
        await knex("genres")
          .insert(genre)
          .onConflict("id") // Evitar duplicatas com base no ID do TMDB
          .merge(); // Atualiza o registro se já existir
      }

      reply.send({
        message: "Tabela de gêneros populada com sucesso.",
        genres: translatedGenres,
      });
    } catch (error) {
      fastify.log.error(error);

      if (error.response && error.response.data) {
        return reply.status(500).send({
          error: "Erro ao buscar gêneros na API TMDB.",
          details: error.response.data,
        });
      }

      if (error.isAxiosError) {
        return reply.status(500).send({
          error: "Erro de rede ao conectar à API TMDB.",
        });
      }

      return reply.status(500).send({ error: "Erro desconhecido." });
    }
  });
}

module.exports = genresRoutes;
