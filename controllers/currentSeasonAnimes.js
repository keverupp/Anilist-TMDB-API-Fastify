// controllers/getCurrentSeasonAnimes.js

const knex = require("knex")(require("../knexfile").development);

async function getCurrentSeasonAnimes(request, reply) {
  const {
    page = 1,
    limit = 20,
    genres,
    keywords,
    sort_by = "popularity",
    sort_order = "desc",
  } = request.query;

  try {
    const offset = (page - 1) * limit;

    // Campos a serem retornados
    const selectedFields = [
      "animes.id",
      "animes.name",
      "animes.original_name",
      "animes.overview",
      "animes.poster_path",
      "animes.backdrop_path",
      "animes.first_air_date",
      "animes.episodes_count",
      "animes.vote_average",
      "animes.vote_count",
      "animes.popularity",
      "animes.status",
      "animes.type",
    ];

    // --- Filtragem opcional por gêneros ---
    let genreIdArray = [];
    if (genres) {
      const genreNames = genres.split(",").map((s) => s.trim());
      const genreIds = await knex("genres")
        .whereIn("name_pt", genreNames)
        .select("id");
      if (genreIds.length === 0) {
        return reply
          .status(404)
          .send({ error: "Nenhum gênero correspondente foi encontrado." });
      }
      genreIdArray = genreIds.map((g) => g.id);
    }

    // --- Filtragem opcional por keywords ---
    let keywordIdArray = [];
    if (keywords) {
      const keywordNames = keywords.split(",").map((s) => s.trim());
      const keywordIds = await knex("keywords")
        .whereIn("name", keywordNames)
        .select("id");
      if (keywordIds.length === 0) {
        return reply
          .status(404)
          .send({ error: "Nenhuma keyword correspondente foi encontrada." });
      }
      keywordIdArray = keywordIds.map((k) => k.id);
    }

    // --- Ordenação ---
    const validSortFields = [
      "name",
      "popularity",
      "vote_average",
      "first_air_date",
      "episodes_count",
    ];
    const sortField = validSortFields.includes(sort_by)
      ? `animes.${sort_by}`
      : "animes.popularity";
    const sortDirection = ["asc", "desc"].includes(sort_order.toLowerCase())
      ? sort_order.toLowerCase()
      : "desc";

    // --- Intervalo de ±2 meses em torno de hoje ---
    const hoje = new Date();
    const inicioIntervalo = new Date(hoje);
    inicioIntervalo.setMonth(hoje.getMonth() - 2);
    const fimIntervalo = new Date(hoje);
    fimIntervalo.setMonth(hoje.getMonth() + 2);
    const dataInicio = inicioIntervalo.toISOString().slice(0, 10);
    const dataFim = fimIntervalo.toISOString().slice(0, 10);

    // --- Query base: ambos filtros aplicados em AND ---
    let query = knex("animes")
      .select(selectedFields)
      .where({ is_current_season: true })
      .andWhereBetween("animes.first_air_date", [dataInicio, dataFim])
      .orderBy(sortField, sortDirection)
      .limit(limit)
      .offset(offset);

    // --- Filtro por gêneros (se houver) ---
    if (genres) {
      query = query
        .join("anime_genres", "animes.id", "anime_genres.anime_id")
        .whereIn("anime_genres.genre_id", genreIdArray)
        .groupBy("animes.id")
        .havingRaw("COUNT(DISTINCT anime_genres.genre_id) = ?", [
          genreIdArray.length,
        ]);
    }

    // --- Filtro por keywords (se houver) ---
    if (keywords) {
      query = query
        .join("anime_keywords", "animes.id", "anime_keywords.anime_id")
        .whereIn("anime_keywords.keyword_id", keywordIdArray)
        .groupBy("animes.id")
        .havingRaw("COUNT(DISTINCT anime_keywords.keyword_id) = ?", [
          keywordIdArray.length,
        ]);
    }

    // Remove duplicações de JOINs
    query = query.distinct();

    // --- Determina temporada atual para metadata ---
    const currentYear = hoje.getFullYear();
    const currentMonth = hoje.getMonth() + 1;
    let currentSeason;
    if (currentMonth === 12 || currentMonth <= 2) {
      currentSeason = "verão";
    } else if (currentMonth <= 5) {
      currentSeason = "outono";
    } else if (currentMonth <= 8) {
      currentSeason = "inverno";
    } else {
      currentSeason = "primavera";
    }

    // --- Função para aplicar os mesmos filtros na contagem total ---
    const applyFilters = (builder) => {
      builder
        .where({ is_current_season: true })
        .andWhereBetween("animes.first_air_date", [dataInicio, dataFim]);
      if (genres) {
        builder
          .join("anime_genres", "animes.id", "anime_genres.anime_id")
          .whereIn("anime_genres.genre_id", genreIdArray)
          .groupBy("animes.id")
          .havingRaw("COUNT(DISTINCT anime_genres.genre_id) = ?", [
            genreIdArray.length,
          ]);
      }
      if (keywords) {
        builder
          .join("anime_keywords", "animes.id", "anime_keywords.anime_id")
          .whereIn("anime_keywords.keyword_id", keywordIdArray)
          .groupBy("animes.id")
          .havingRaw("COUNT(DISTINCT anime_keywords.keyword_id) = ?", [
            keywordIdArray.length,
          ]);
      }
    };

    // --- Executa em paralelo: busca paginada e contagem total ---
    const [animes, totalCountRow] = await Promise.all([
      query,
      knex("animes").count("id as total").modify(applyFilters).first(),
    ]);

    // --- Monta resposta com gêneros embutidos ---
    const animesWithGenres = await Promise.all(
      animes.map(async (anime) => {
        const genres = await knex("genres")
          .select("genres.id", "genres.name_pt")
          .join("anime_genres", "genres.id", "anime_genres.genre_id")
          .where({ "anime_genres.anime_id": anime.id });
        return { ...anime, genres };
      })
    );

    const total = parseInt(totalCountRow.total || 0, 10);
    const totalPages = Math.ceil(total / limit);

    return reply.status(200).send({
      pagination: {
        total,
        totalPages,
        currentPage: parseInt(page, 10),
        perPage: parseInt(limit, 10),
      },
      sort: {
        field: sort_by,
        order: sort_order,
      },
      current_season: {
        name: currentSeason,
        year: currentYear,
      },
      data: animesWithGenres,
    });
  } catch (error) {
    console.error("Erro ao buscar animes da temporada atual:", error);
    return reply.status(500).send({
      error: "Internal Server Error",
      message: "Erro ao buscar animes da temporada atual.",
    });
  }
}

module.exports = {
  getCurrentSeasonAnimes,
};
