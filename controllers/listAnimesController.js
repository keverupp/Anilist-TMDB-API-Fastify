const knex = require("knex")(require("../knexfile").development);

async function getAllAnimes(request, reply) {
  const { page = 1, limit = 10, name, status, genres, fields } = request.query;

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
      selectedFields = requestedFields.map((field) =>
        defaultFields.find((defaultField) => defaultField.endsWith(field))
      ).filter(Boolean);
    }

    // Buscar IDs de gêneros, se fornecido
    let genreIdArray = [];
    if (genres) {
      const genreNames = genres.split(",").map((name) => name.trim());

      // Buscar IDs dos gêneros com base nos nomes
      const genreIds = await knex("genres")
        .whereIn("name_pt", genreNames)
        .select("id");

      if (genreIds.length === 0) {
        return reply.status(404).send({ error: "Nenhum gênero correspondente foi encontrado." });
      }

      genreIdArray = genreIds.map((genre) => genre.id);
    }

    // Base da query
    let query = knex("animes")
      .select(selectedFields)
      .limit(limit)
      .offset(offset);

    // Filtro por nome (inclui títulos alternativos)
    if (name) {
      query = query
        .leftJoin("alternative_titles", "animes.id", "alternative_titles.anime_id")
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
        .havingRaw("COUNT(DISTINCT anime_genres.genre_id) = ?", [genreIdArray.length]);
    }

    // Remover duplicatas devido ao JOIN com `alternative_titles` ou `anime_genres`
    query = query.distinct();

    // Obter os animes e contagem total
    const [animes, totalCount] = await Promise.all([
      query,
      knex("animes")
        .modify((builder) => {
          if (genres) {
            builder
              .join("anime_genres", "animes.id", "anime_genres.anime_id")
              .whereIn("anime_genres.genre_id", genreIdArray)
              .groupBy("animes.id")
              .havingRaw("COUNT(DISTINCT anime_genres.genre_id) = ?", [genreIdArray.length]);
          }
          if (name) {
            builder
              .leftJoin("alternative_titles", "animes.id", "alternative_titles.anime_id")
              .where((builder) => {
                builder
                  .where("animes.name", "ilike", `%${name}%`)
                  .orWhere("alternative_titles.title", "ilike", `%${name}%`);
              });
          }
          if (status) {
            builder.where({ "animes.status": status });
          }
        })
        .countDistinct("animes.id as total")
        .first(),
    ]);

    const total = parseInt(totalCount.total || 0, 10);
    const totalPages = Math.ceil(total / limit);

    // Retornar resposta
    reply.status(200).send({
      pagination: {
        total,
        totalPages,
        currentPage: parseInt(page, 10),
        perPage: parseInt(limit, 10),
      },
      data: animes,
    });
  } catch (error) {
    console.error("Erro ao buscar animes:", error);
    reply.status(500).send({ error: "Erro ao buscar animes." });
  }
}


module.exports = { getAllAnimes};
