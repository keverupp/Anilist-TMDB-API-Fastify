const axios = require("axios");
const { insertTitles } = require("../models/titleModel");
const knex = require("knex")(require("../knexfile").development);

const TMDB_API_KEY = process.env.TMDB_API_KEY;

async function syncTodayTitles(req, reply) {
  try {
    const today = new Date().toISOString().split("T")[0];

    const url = `https://api.themoviedb.org/3/discover/tv?air_date.gte=${today}&air_date.lte=${today}&include_adult=false&include_null_first_air_dates=false&language=pt-BR&page=1&sort_by=name.asc&with_genres=16&with_original_language=ja&api_key=${TMDB_API_KEY}`;
    const { data } = await axios.get(url);

    const animes = data.results;

    const titlesToInsert = [];
    const alternativeTitlesToInsert = [];

    await Promise.all(
      animes.map(async (anime) => {
        const animeId = anime.id;

        titlesToInsert.push({
          id: animeId,
          pt_title: anime.name || "N/A",
          english_title: anime.name || "N/A",
          native_title: anime.original_name || "N/A",
        });

        // Buscar títulos alternativos
        try {
          const { data: altData } = await axios.get(
            `https://api.themoviedb.org/3/tv/${animeId}/alternative_titles`,
            { params: { api_key: TMDB_API_KEY } }
          );

          (altData.results || []).forEach((altTitle) => {
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
          req.log.warn(
            `Falha ao buscar títulos alternativos de ${animeId}: ${error.message}`
          );
        }
      })
    );

    if (titlesToInsert.length > 0) await insertTitles(titlesToInsert);
    if (alternativeTitlesToInsert.length > 0)
      await knex("alternative_titles").insert(alternativeTitlesToInsert);

    return reply.send({
      message: "Sincronização concluída com sucesso.",
      total_titles: titlesToInsert.length,
      total_alternative_titles: alternativeTitlesToInsert.length,
    });
  } catch (error) {
    req.log.error(error);
    return reply.status(500).send({
      error: "Erro ao sincronizar títulos.",
      details: error.message,
    });
  }
}

module.exports = {
  syncTodayTitles,
};
