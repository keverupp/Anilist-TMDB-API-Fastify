const knex = require("knex")(require("../knexfile").development);
const dayjs = require("dayjs");

// carrega o plugin de parsing estrito
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

async function getAnimeCalendar(request, reply) {
  const { date, start_date, end_date } = request.query;

  if (!date && (!start_date || !end_date)) {
    return reply
      .status(400)
      .send({ error: "Forneça 'date' ou 'start_date' e 'end_date'." });
  }

  // função auxiliar para validar e retornar um objeto Day.js
  function parseDate(input) {
    let parsed;
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
      // formato ISO
      parsed = dayjs(input, "YYYY-MM-DD", true);
    } else if (/^\d{2}-\d{2}-\d{4}$/.test(input)) {
      // formato DD-MM-YYYY
      parsed = dayjs(input, "DD-MM-YYYY", true);
    } else {
      return null;
    }
    return parsed.isValid() ? parsed : null;
  }

  try {
    const query = knex("tmdb_cached_responses")
      .select("cache_date", "data")
      .orderBy("cache_date", "asc");

    if (date) {
      const d = parseDate(date);
      if (!d) {
        return reply
          .status(400)
          .send({ error: `Formato de 'date' inválido: ${date}` });
      }
      query.where("cache_date", d.format("YYYY-MM-DD"));
    } else {
      const start = parseDate(start_date);
      const end = parseDate(end_date);

      if (!start || !end) {
        return reply
          .status(400)
          .send({
            error: `Formato de intervalo inválido: ${start_date} a ${end_date}`,
          });
      }

      const diffDays = end.diff(start, "day");
      if (diffDays < 0) {
        return reply
          .status(400)
          .send({ error: "'end_date' não pode ser antes de 'start_date'." });
      }
      if (diffDays > 7) {
        return reply
          .status(400)
          .send({ error: "O intervalo máximo permitido é de 7 dias." });
      }

      query.whereBetween("cache_date", [
        start.format("YYYY-MM-DD"),
        end.format("YYYY-MM-DD"),
      ]);
    }

    // carrega também os gêneros
    const [results, genres] = await Promise.all([
      query,
      knex("genres").select("id", "name_pt"),
    ]);

    const genreMap = Object.fromEntries(genres.map((g) => [g.id, g.name_pt]));

    const parsed = results.map(({ cache_date, data }) => ({
      date: cache_date,
      animes: (data.results || [])
        .filter((a) => typeof a.overview === "string" && a.overview.trim())
        .map((a) => ({
          ...a,
          genres: (a.genre_ids || []).map((id) => genreMap[id]).filter(Boolean),
        })),
    }));

    return reply.send(parsed);
  } catch (err) {
    console.error(err);
    return reply
      .status(500)
      .send({ error: "Erro ao buscar dados do calendário." });
  }
}

module.exports = { getAnimeCalendar };
