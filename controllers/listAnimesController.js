const knex = require("knex")(require("../knexfile").development);

async function getAllAnimes(request, reply) {
  const {
    page = 1,
    limit = 10,
    name,
    status,
    genres,
    keywords,
    fields,
    sort_by = "name", // Campo para ordenação (padrão: name)
    sort_order = "asc", // Direção da ordenação (padrão: ascendente)
  } = request.query;

  try {
    const offset = (page - 1) * limit;

    // Campos padrão, prefixando com a tabela `animes`
    let defaultFields = [
      "animes.id",
      "animes.name",
      "animes.overview",
      "animes.poster_path",
      "animes.backdrop_path",
      "animes.banner_path",
      "animes.first_air_date",
      "animes.is_current_season",
      "animes.episodes_count",
      "animes.adult",
      "animes.in_production",
      "animes.homepage",
      "animes.vote_average",
      "animes.vote_count",
      "animes.original_name",
      "animes.original_language",
      "animes.number_of_seasons",
      "animes.number_of_episodes",
      "animes.popularity",
      "animes.status",
      "animes.episode_run_time",
      "animes.type",
    ];

    // Validar campos personalizados
    let selectedFields = defaultFields;
    if (fields) {
      const requestedFields = fields.split(",").map((field) => field.trim());
      selectedFields = requestedFields
        .map((field) =>
          defaultFields.find((defaultField) => defaultField.endsWith(field))
        )
        .filter(Boolean);
    }

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
      "number_of_seasons",
    ];

    const sortField = validSortFields.includes(sort_by)
      ? `animes.${sort_by}`
      : "animes.name";

    // Validar direção de ordenação
    const sortDirection = ["asc", "desc"].includes(sort_order.toLowerCase())
      ? sort_order.toLowerCase()
      : "asc";

    // Base da query
    let query = knex("animes")
      .select(selectedFields)
      .limit(limit)
      .offset(offset);

    // Filtro por nome
    if (name) {
      query = query
        .leftJoin(
          "alternative_titles",
          "animes.id",
          "alternative_titles.anime_id"
        )
        .where((builder) => {
          builder
            .where("animes.name", "ilike", `%${name}%`)
            .orWhere("alternative_titles.title", "ilike", `%${name}%`);
        });
    }

    // Filtro por status
    if (status) {
      query = query.where({ "animes.status": status });
    }

    // Filtro por gêneros
    if (genres) {
      query = query
        .join("anime_genres", "animes.id", "anime_genres.anime_id")
        .whereIn("anime_genres.genre_id", genreIdArray)
        .groupBy("animes.id")
        .havingRaw("COUNT(DISTINCT anime_genres.genre_id) = ?", [
          genreIdArray.length,
        ]);
    }

    // Filtro por keywords
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

    // Aplicar ordenação
    query = query.orderBy(sortField, sortDirection);

    // Modificador para contagem total
    const applyFilters = (builder) => {
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
      if (name) {
        builder
          .leftJoin(
            "alternative_titles",
            "animes.id",
            "alternative_titles.anime_id"
          )
          .where((builder) => {
            builder
              .where("animes.name", "ilike", `%${name}%`)
              .orWhere("alternative_titles.title", "ilike", `%${name}%`);
          });
      }
      if (status) {
        builder.where({ "animes.status": status });
      }
    };

    // Obter os animes e a contagem total com os mesmos filtros
    const [animes, totalCount] = await Promise.all([
      query,
      knex("animes")
        .modify(applyFilters)
        .countDistinct("animes.id as total")
        .first(),
    ]);

    const total = parseInt(totalCount.total || 0, 10);
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
      data: animes,
    });
  } catch (error) {
    console.error("Erro ao buscar animes:", error);
    reply.status(500).send({ error: "Erro ao buscar animes." });
  }
}

module.exports = { getAllAnimes };
