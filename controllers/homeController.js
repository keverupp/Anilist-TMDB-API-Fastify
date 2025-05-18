// src/controllers/homeController.js
const knex = require("knex")(require("../knexfile").development);
const { fetchLogosOnlyForMultipleAnimes } = require("../services/LogoService");

async function listReturningSeries(request, reply) {
  try {
    // ... (lógica de limit, page, fields, etc., como na versão anterior que usa anime.id como TMDB ID) ...
    const { limit = 10, page = 1, fields } = request.query;
    const defaultFields = [
      "id",
      "name",
      "original_name",
      "overview",
      "poster_path",
      "banner_path",
      "backdrop_path",
    ];
    let selectedFields = fields
      ? fields
          .split(",")
          .map((f) => f.trim())
          .filter((f) => f)
      : defaultFields;
    if (!selectedFields.includes("id")) {
      selectedFields.push("id");
    }
    selectedFields = [...new Set(selectedFields)];

    const parsedLimit = Math.max(Number(limit) || 10, 1);
    const parsedPage = Math.max(Number(page) || 1, 1);
    const offset = (parsedPage - 1) * parsedLimit;

    const animesQuery = knex("animes")
      .where("status", "Returning Series")
      .select(selectedFields)
      .limit(parsedLimit)
      .offset(offset)
      .orderBy("id", "asc");

    const totalCountQuery = knex("animes")
      .where("status", "Returning Series")
      .count({ total: "*" })
      .first();

    const [returningSeriesAnimes, countResult] = await Promise.all([
      animesQuery,
      totalCountQuery,
    ]);

    const totalAnimes = parseInt(countResult.total, 10);
    let animesData = returningSeriesAnimes;

    if (animesData.length > 0) {
      const animeTmdbIds = animesData
        .map((anime) => anime.id)
        .filter((id) => id != null);

      if (animeTmdbIds.length > 0) {
        // allLogosData será um array de: [{ anime_id, logo: {url, width, height, language} ou undefined }, ...]
        const allLogosData = await fetchLogosOnlyForMultipleAnimes(
          animeTmdbIds,
          request.log
        );

        animesData = animesData.map((anime) => {
          const logoEntry = allLogosData.find(
            (entry) => entry.anime_id === anime.id
          );
          return {
            ...anime,
            // Em vez de um array 'logos', agora temos um objeto 'logo' (ou undefined)
            logo: logoEntry ? logoEntry.logo : undefined,
          };
        });
      } else {
        animesData = animesData.map((anime) => ({ ...anime, logo: undefined }));
      }
    }

    return reply.status(200).send({
      data: animesData,
      meta: {
        /* ... metadados como antes ... */
      },
    });
  } catch (error) {
    // ... (tratamento de erro como antes) ...
    if (request.log && typeof request.log.error === "function") {
      request.log.error(
        { err: error, query: request.query },
        "Erro ao listar returning series com logos"
      );
    } else {
    }
    return reply.status(500).send({ error: "Erro ao listar animes." });
  }
}

module.exports = { listReturningSeries };
