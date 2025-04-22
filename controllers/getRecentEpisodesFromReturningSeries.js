const knex = require("knex")(require("../knexfile").development);

async function getRecentEpisodesFromReturningSeries(request, reply) {
  try {
    const { limit = 10, page = 1 } = request.query;
    const parsedLimit = Math.max(Number(limit), 1);
    const parsedPage = Math.max(Number(page), 1);
    const offset = (parsedPage - 1) * parsedLimit;

    // Buscar os animes "Returning Series"
    const returningSeries = await knex("animes")
      .where("status", "Returning Series")
      .select("id", "name", "poster_path")
      .limit(parsedLimit)
      .offset(offset);

    const episodes = await Promise.all(
      returningSeries.map(async (anime) => {
        // Buscar a temporada mais recente do anime
        const latestSeason = await knex("anime_seasons")
          .join("seasons", "anime_seasons.season_id", "seasons.id")
          .where("anime_seasons.anime_id", anime.id)
          .orderBy([
            { column: "seasons.year", order: "desc" },
            { column: "seasons.season", order: "desc" },
          ])
          .select("anime_seasons.id as anime_season_id")
          .first();

        if (!latestSeason) return null;

        // Buscar episódio mais recentemente atualizado dessa temporada
        const episode = await knex("episodes")
          .where("anime_season_id", latestSeason.anime_season_id)
          .andWhere("is_pending_update", false)
          .andWhere("air_date", "<=", knex.fn.now())
          .orderBy("updated_at", "desc")
          .first();

        if (episode) {
          return {
            anime_id: anime.id,
            anime_name: anime.name,
            anime_poster: anime.poster_path,
            ...episode,
          };
        }

        return null;
      })
    );

    const filteredEpisodes = episodes.filter((e) => e !== null);

    return reply.status(200).send({
      data: filteredEpisodes,
      meta: {
        limit: parsedLimit,
        page: parsedPage,
        count: filteredEpisodes.length,
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
