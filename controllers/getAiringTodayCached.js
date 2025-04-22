const axios = require("axios");
const knex = require("knex")(require("../knexfile").development);

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_IMAGE_BASE_POSTER = "https://image.tmdb.org/t/p/w500";
const TMDB_IMAGE_BASE_BACKDROP = "https://image.tmdb.org/t/p/w1280";

async function getAiringTodayCached(req, reply) {
  const today = new Date().toISOString().split("T")[0];
  const endpoint = "airing-today";

  try {
    const existing = await knex("tmdb_cached_responses")
      .where({ endpoint, cache_date: today })
      .first();

    if (existing) {
      return reply.send(existing.data);
    }

    const url = `https://api.themoviedb.org/3/discover/tv?air_date.gte=${today}&air_date.lte=${today}&include_adult=false&include_null_first_air_dates=false&language=pt-BR&page=1&sort_by=name.asc&with_genres=16&with_original_language=ja&api_key=${TMDB_API_KEY}`;
    const { data } = await axios.get(url);

    // Processa poster_path e backdrop_path
    const processed = {
      ...data,
      results: data.results.map((anime) => ({
        ...anime,
        poster_path: anime.poster_path
          ? `${TMDB_IMAGE_BASE_POSTER}${anime.poster_path}`
          : null,
        backdrop_path: anime.backdrop_path
          ? `${TMDB_IMAGE_BASE_BACKDROP}${anime.backdrop_path}`
          : null,
      })),
    };

    // Armazena a resposta modificada
    await knex("tmdb_cached_responses").insert({
      endpoint,
      cache_date: today,
      data: JSON.stringify(processed),
    });

    return reply.send(processed);
  } catch (error) {
    req.log.error(error);
    return reply.status(500).send({
      error: "Erro ao buscar ou processar dados da TMDB.",
      details: error.message,
    });
  }
}

module.exports = {
  getAiringTodayCached,
};
