const knex = require("knex")(require("../knexfile").development);

async function getRecentEpisodesFromReturningSeries(request, reply) {
  try {
    const { limit = 10, page = 1 } = request.query;
    const parsedLimit = Math.max(Number(limit), 1);
    const parsedPage = Math.max(Number(page), 1);
    const offset = (parsedPage - 1) * parsedLimit;

    const maxDate = knex.raw("CURRENT_DATE");
    const minDate = knex.raw("CURRENT_DATE - INTERVAL '3 days'");

    const episodes = await knex("episodes")
      .join("anime_seasons", "episodes.anime_season_id", "anime_seasons.id")
      .join("animes", "anime_seasons.anime_id", "animes.id")
      .where("episodes.is_pending_update", false)
      .andWhereBetween("episodes.air_date", [minDate, maxDate])
      .orderBy("episodes.air_date", "desc")
      .limit(parsedLimit)
      .offset(offset)
      .select(
        "animes.id as anime_id",
        "animes.name as anime_name",
        "animes.poster_path as anime_poster",
        "episodes.*"
      );

    return reply.status(200).send({
      data: episodes,
      meta: {
        limit: parsedLimit,
        page: parsedPage,
        count: episodes.length,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar episódios recentes:", error);
    return reply
      .status(500)
      .send({ error: "Erro ao buscar episódios recentes." });
  }
}

module.exports = { getRecentEpisodesFromReturningSeries };
