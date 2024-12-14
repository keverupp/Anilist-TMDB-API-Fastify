const axios = require("axios");
const { insertTitles } = require("../models/titleModel");
const knex = require("knex")(require("../knexfile").development);

async function searchAnimes(req, reply) {
  const { query } = req.query;

  if (!query || typeof query !== "string") {
    return reply
      .status(400)
      .send({ error: "Query parameter is required and must be a string" });
  }

  try {
    const apiKey = process.env.TMDB_API_KEY;

    // Buscar animes na API do TMDB
    const { data: { results = [] } = {} } = await axios.get(
      "https://api.themoviedb.org/3/search/tv",
      { params: { api_key: apiKey, query } }
    );

    const titlesToInsert = [];
    const alternativeTitlesToInsert = [];

    await Promise.all(
      results.map(async (anime) => {
        // Filtra apenas se tiver gênero 16 (Anime)
        if (!anime.genre_ids || !anime.genre_ids.includes(16)) return;

        const animeId = anime.id;
        let ptTitle = "N/A";

        // Buscar título em português do Brasil e títulos alternativos em paralelo
        const ptTitlePromise = (async () => {
          try {
            const { data: ptData } = await axios.get(
              `https://api.themoviedb.org/3/tv/${animeId}`,
              {
                params: { api_key: apiKey, language: "pt-BR" },
              }
            );
            ptTitle = ptData.name || "N/A";
          } catch (error) {
            req.log.error(
              `Failed to fetch pt-BR title for anime ID ${animeId}: ${error.message}`
            );
          }
        })();

        const altTitlesPromise = (async () => {
          try {
            const { data: altData } = await axios.get(
              `https://api.themoviedb.org/3/tv/${animeId}/alternative_titles`,
              { params: { api_key: apiKey } }
            );

            const altResults = altData.results || [];
            altResults.forEach((altTitle) => {
              alternativeTitlesToInsert.push({
                anime_id: animeId,
                iso_3166_1: altTitle.iso_3166_1,
                title: altTitle.title,
                type: altTitle.type || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
            });
          } catch (error) {
            req.log.error(
              `Failed to fetch alternative titles for anime ID ${animeId}: ${error.message}`
            );
          }
        })();

        // Espera as requisições paralelas terminarem
        await Promise.all([ptTitlePromise, altTitlesPromise]);

        // Adicionar título principal
        titlesToInsert.push({
          id: animeId,
          english_title: anime.name || "N/A",
          native_title: anime.original_name || "N/A",
          pt_title: ptTitle,
        });
      })
    );

    // Salvar títulos principais no banco
    if (titlesToInsert.length > 0) {
      await insertTitles(titlesToInsert);
    }

    // Salvar títulos alternativos no banco
    if (alternativeTitlesToInsert.length > 0) {
      await knex("alternative_titles").insert(alternativeTitlesToInsert);
    }

    // Retornar os títulos principais e alternativos
    return reply.send({
      message: "Animes e títulos alternativos processados com sucesso!",
      titles: titlesToInsert,
      alternative_titles: alternativeTitlesToInsert,
    });
  } catch (error) {
    req.log.error(error);
    return reply.status(500).send({
      error: "Erro ao processar a solicitação.",
      details: error.message,
    });
  }
}

module.exports = {
  searchAnimes,
};
