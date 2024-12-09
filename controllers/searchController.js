const axios = require("axios");
const { insertTitles } = require("../models/titleModel");
const knex = require("knex")(require("../knexfile").development);

async function searchAnimes(req, reply) {
  const query = req.query.query;

  if (!query || typeof query !== "string") {
    return reply
      .status(400)
      .send({ error: "Query parameter is required and must be a string" });
  }

  try {
    const apiKey = process.env.TMDB_API_KEY;

    // Buscar animes na API do TMDB
    const response = await axios.get("https://api.themoviedb.org/3/search/tv", {
      params: {
        api_key: apiKey,
        query,
      },
    });

    const results = response.data.results;

    // Mapeando os resultados principais e buscando títulos alternativos
    const titlesToInsert = [];
    const alternativeTitlesToInsert = [];

    for (const anime of results) {
      // Filtrar apenas títulos com gênero 16
      if (!anime.genre_ids || !anime.genre_ids.includes(16)) {
        continue;
      }

      let ptTitle = "N/A";

      // Buscar título em português do Brasil
      try {
        const ptTitleResponse = await axios.get(
          `https://api.themoviedb.org/3/tv/${anime.id}`,
          {
            params: { api_key: apiKey, language: "pt-BR" },
          }
        );

        ptTitle = ptTitleResponse.data.name || "N/A";
      } catch (ptError) {
        req.log.error(
          `Failed to fetch pt-BR title for anime ID ${anime.id}: ${ptError.message}`
        );
      }

      // Adicionar título principal
      titlesToInsert.push({
        id: anime.id,
        english_title: anime.name || "N/A",
        native_title: anime.original_name || "N/A",
        pt_title: ptTitle,
      });

      // Buscar títulos alternativos para o anime atual
      try {
        const altTitlesResponse = await axios.get(
          `https://api.themoviedb.org/3/tv/${anime.id}/alternative_titles`,
          { params: { api_key: apiKey } }
        );

        const altTitles = altTitlesResponse.data.results || [];
        altTitles.forEach((altTitle) => {
          alternativeTitlesToInsert.push({
            anime_id: anime.id,
            iso_3166_1: altTitle.iso_3166_1,
            title: altTitle.title,
            type: altTitle.type || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        });
      } catch (altError) {
        // Log de erro para títulos alternativos
        req.log.error(
          `Failed to fetch alternative titles for anime ID ${anime.id}: ${altError.message}`
        );
      }
    }

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
    return reply
      .status(500)
      .send({
        error: "Erro ao processar a solicitação.",
        details: error.message,
      });
  }
}

module.exports = {
  searchAnimes,
};
