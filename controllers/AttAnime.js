// controllers/AttAnime.js

const axios = require("axios");
const knex = require("knex")(require("../knexfile").development);
const TMDB_API_KEY = process.env.TMDB_API_KEY;

/**
 * Mapeia apenas os campos que você quer atualizar,
 * agora usando next_episode_to_air do TMDB para is_current_season.
 */
function mapUpdateFields(tmdbData) {
  return {
    name: tmdbData.name || "N/A",
    original_name: tmdbData.original_name || null,
    overview: tmdbData.overview || "Descrição não disponível.",
    poster_path: tmdbData.poster_path
      ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`
      : null,
    backdrop_path: tmdbData.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${tmdbData.backdrop_path}`
      : null,
    first_air_date: tmdbData.first_air_date || null,
    episodes_count: tmdbData.number_of_episodes || null,
    vote_average: tmdbData.vote_average || 0,
    vote_count: tmdbData.vote_count || 0,
    popularity: tmdbData.popularity || 0,
    status: tmdbData.status || null,
    type: tmdbData.type || null,
    // Aqui a mudança principal:
    is_current_season: !!tmdbData.next_episode_to_air,
    in_production: tmdbData.in_production || false,
  };
}

/**
 * Controller que faz o batch de atualização
 */
async function updateCurrentAndInProductionAnimes(req, reply) {
  try {
    const rows = await knex("animes")
      .select("id")
      .where("is_current_season", true)
      .orWhere("in_production", true);

    let updatedCount = 0;

    for (const { id: animeId } of rows) {
      try {
        // Busca no TMDB
        const { data: tmdbData } = await axios.get(
          `https://api.themoviedb.org/3/tv/${animeId}`,
          { params: { api_key: TMDB_API_KEY, language: "pt-BR" } }
        );

        // Mapeia e atualiza só os campos desejados
        const updateFields = mapUpdateFields(tmdbData);
        await knex("animes").where({ id: animeId }).update(updateFields);

        updatedCount++;
      } catch (innerErr) {
        req.log.error(
          `Falha ao atualizar anime ${animeId}: ${innerErr.message}`
        );
      }
    }

    return reply.code(200).send({
      message: `Concluído: ${updatedCount} animes atualizados.`,
    });
  } catch (err) {
    req.log.error("Erro no batch de atualização:", err.message);
    return reply.code(500).send({
      error: "Erro interno ao atualizar animes.",
      details: err.message,
    });
  }
}

module.exports = {
  updateCurrentAndInProductionAnimes,
};
