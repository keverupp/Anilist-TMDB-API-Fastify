const knex = require("knex")(require("../knexfile").development);

async function getCurrentSeasonAnimes(request, reply) {
  const {
    page = 1,
    limit = 20,
    genres,
    keywords,
    sort_by = "popularity", // Campo para ordenação
    sort_order = "desc", // Direção da ordenação
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

    // Buscar IDs de gêneros, se fornecido
    let genreIdArray = [];
    if (genres) {
      const genreNames = genres.split(",").map((name) => name.trim());
      const genreIds = await knex("genres")
        .whereIn("name_pt", genreNames)
        .select("id");

      if (genreIds.length === 0) {
        return reply
          .status(404)
          .send({ error: "Nenhum gênero correspondente foi encontrado." });
      }

      genreIdArray = genreIds.map((genre) => genre.id);
    }

    // Buscar IDs de keywords, se fornecido
    let keywordIdArray = [];
    if (keywords) {
      const keywordNames = keywords.split(",").map((k) => k.trim());
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

    // Validar campo de ordenação
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

    // Validar direção de ordenação
    const sortDirection = ["asc", "desc"].includes(sort_order.toLowerCase())
      ? sort_order.toLowerCase()
      : "desc";

    // Query base - filtrando apenas animes da temporada atual
    let query = knex("animes")
      .select(selectedFields)
      .where({ is_current_season: true })
      .orderBy(sortField, sortDirection)
      .limit(limit)
      .offset(offset);

    // Aplicar filtro por gêneros
    if (genres) {
      query = query
        .join("anime_genres", "animes.id", "anime_genres.anime_id")
        .whereIn("anime_genres.genre_id", genreIdArray)
        .groupBy("animes.id")
        .havingRaw("COUNT(DISTINCT anime_genres.genre_id) = ?", [
          genreIdArray.length,
        ]);
    }

    // Aplicar filtro por keywords
    if (keywords) {
      query = query
        .join("anime_keywords", "animes.id", "anime_keywords.anime_id")
        .whereIn("anime_keywords.keyword_id", keywordIdArray)
        .groupBy("animes.id")
        .havingRaw("COUNT(DISTINCT anime_keywords.keyword_id) = ?", [
          keywordIdArray.length,
        ]);
    }

    // Remover duplicatas caso haja JOINs
    query = query.distinct();

    // Determinar temporada atual para informação adicional
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    let currentSeason;

    if (currentMonth >= 12 || currentMonth <= 2) {
      currentSeason = "verão";
    } else if (currentMonth >= 3 && currentMonth <= 5) {
      currentSeason = "outono";
    } else if (currentMonth >= 6 && currentMonth <= 8) {
      currentSeason = "inverno";
    } else {
      currentSeason = "primavera";
    }

    // Modificador para contagem total com os mesmos filtros
    const applyFilters = (builder) => {
      builder.where({ is_current_season: true });

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

    // Obter os animes e a contagem total com os mesmos filtros
    const [animes, totalCount] = await Promise.all([
      query,
      knex("animes")
        .count("id as total")
        .where({ is_current_season: true })
        .modify(applyFilters)
        .first(),
    ]);

    // Para cada anime, buscar seus gêneros
    const animesWithGenres = await Promise.all(
      animes.map(async (anime) => {
        const genres = await knex("genres")
          .select("genres.id", "genres.name_pt")
          .join("anime_genres", "genres.id", "anime_genres.genre_id")
          .where({ "anime_genres.anime_id": anime.id });

        return {
          ...anime,
          genres,
        };
      })
    );

    const total = parseInt(totalCount?.total || 0, 10);
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
