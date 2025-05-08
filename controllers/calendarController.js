const knex = require("knex")(require("../knexfile").development);
const dayjs = require("dayjs");

async function getAnimeCalendar(request, reply) {
  const { date, start_date, end_date } = request.query;

  if (!date && (!start_date || !end_date)) {
    return reply
      .status(400)
      .send({ error: "Forneça 'date' ou 'start_date' e 'end_date'." });
  }

  try {
    // Busca cache e ordena por data
    const query = knex("tmdb_cached_responses")
      .select("cache_date", "data")
      .orderBy("cache_date", "asc");

    if (date) {
      query.where("cache_date", dayjs(date).format("YYYY-MM-DD"));
    } else {
      const start = dayjs(start_date);
      const end = dayjs(end_date);
      const diff = end.diff(start, "day");

      if (diff > 6) {
        return reply
          .status(400)
          .send({ error: "O intervalo máximo permitido é de 7 dias." });
      }

      query.whereBetween("cache_date", [
        start.format("YYYY-MM-DD"),
        end.format("YYYY-MM-DD"),
      ]);
    }

    const [results, genres] = await Promise.all([
      query,
      knex("genres").select("id", "name_pt"),
    ]);

    const genreMap = Object.fromEntries(genres.map((g) => [g.id, g.name_pt]));

    const parsed = results.map((row) => {
      // filtra animes que tenham overview não vazio
      const animes = (row.data.results || [])
        .filter(
          (anime) =>
            typeof anime.overview === "string" && anime.overview.trim() !== ""
        )
        .map((anime) => ({
          ...anime,
          genres: (anime.genre_ids || [])
            .map((id) => genreMap[id])
            .filter(Boolean),
        }));

      return {
        date: row.cache_date,
        animes,
      };
    });

    return reply.send(parsed);
  } catch (err) {
    console.error(err);
    return reply
      .status(500)
      .send({ error: "Erro ao buscar dados do calendário." });
  }
}

module.exports = { getAnimeCalendar };
