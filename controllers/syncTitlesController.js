const axios = require("axios");
const { insertTitles } = require("../models/titleModel");
const knex = require("knex")(require("../knexfile").development);

const TMDB_API_KEY = process.env.TMDB_API_KEY;

async function syncTodayTitles(req, reply) {
  try {
    const today = new Date().toISOString().split("T")[0];
    const baseUrl = "https://api.themoviedb.org/3/discover/tv";
    const commonParams = {
      api_key: TMDB_API_KEY,
      language: "pt-BR",
      include_adult: false,
      include_null_first_air_dates: false,
      "air_date.gte": today,
      "air_date.lte": today,
      sort_by: "name.asc",
      with_genres: 16,
      with_original_language: "ja",
    };

    // 1) busca 1ª página para pegar total_pages
    const { data: firstPage } = await axios.get(baseUrl, {
      params: { ...commonParams, page: 1 },
    });
    let allAnimes = firstPage.results || [];
    const totalPages = firstPage.total_pages || 1;

    // 2) itera das páginas 2 até totalPages
    for (let page = 2; page <= totalPages; page++) {
      const { data } = await axios.get(baseUrl, {
        params: { ...commonParams, page },
      });
      allAnimes = allAnimes.concat(data.results || []);
    }

    // 3) prepara arrays de inserção
    const titlesToInsert = [];
    const alternativeTitlesToInsert = [];

    // 4) preenche titlesToInsert e busca alt titles
    await Promise.all(
      allAnimes.map(async (anime) => {
        const animeId = anime.id;

        titlesToInsert.push({
          id: animeId,
          pt_title: anime.name || "N/A",
          english_title: anime.name || "N/A",
          native_title: anime.original_name || "N/A",
        });

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

    // 5) insere no banco
    if (titlesToInsert.length) {
      await insertTitles(titlesToInsert);
    }
    if (alternativeTitlesToInsert.length) {
      await knex("alternative_titles").insert(alternativeTitlesToInsert);
    }

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

module.exports = { syncTodayTitles };
