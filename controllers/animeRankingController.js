const knex = require("knex")(require("../knexfile").development);

// Função para obter o ranking de animes
async function getAnimeRankings(request, reply) {
  const {
    page = 1,
    limit = 10,
    season, // Temporada específica
    year, // Ano específico
    genres, // Gêneros de anime
    keywords, // Keywords de anime
    ranking_type = "stars", // Tipo de ranking: "stars" ou "best_pick"
    sort_by = "stars", // Campo para ordenação
    sort_order = "desc", // Direção da ordenação
  } = request.query;

  try {
    const offset = (page - 1) * limit;

    // Determinar temporada atual se não fornecida
    let targetSeason = season;
    let targetYear = year ? parseInt(year, 10) : null;

    if (!targetSeason || !targetYear) {
      const currentDate = new Date();
      targetYear = targetYear || currentDate.getFullYear();

      if (!targetSeason) {
        const currentMonth = currentDate.getMonth() + 1;

        if (currentMonth >= 12 || currentMonth <= 2) {
          targetSeason = "verão";
        } else if (currentMonth >= 3 && currentMonth <= 5) {
          targetSeason = "outono";
        } else if (currentMonth >= 6 && currentMonth <= 8) {
          targetSeason = "inverno";
        } else {
          targetSeason = "primavera";
        }
      }
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

    // Selecionar tipo de ranking
    let rankingTable, rankingField;
    if (ranking_type === "best_pick") {
      rankingTable = "season_best_picks";
      rankingField = "COUNT(*) as vote_count"; // Contagem de votos para best_pick
    } else {
      rankingTable = "anime_rankings";
      rankingField =
        "ROUND(AVG(stars), 1) as average_stars, COUNT(*) as vote_count"; // Média de estrelas
    }

    // Query para buscar dados agregados do ranking
    let rankingQuery = knex(rankingTable)
      .select([
        `${rankingTable}.anime_id`,
        "animes.name",
        "animes.original_name",
        "animes.poster_path",
        knex.raw(rankingField),
      ])
      .join("animes", `${rankingTable}.anime_id`, "animes.id")
      .where({
        [`${rankingTable}.season`]: targetSeason,
        [`${rankingTable}.year`]: targetYear,
      })
      .groupBy([
        `${rankingTable}.anime_id`,
        "animes.name",
        "animes.original_name",
        "animes.poster_path",
      ]);

    // Aplicar filtros de gêneros
    if (genres) {
      rankingQuery = rankingQuery
        .join("anime_genres", "animes.id", "anime_genres.anime_id")
        .whereIn("anime_genres.genre_id", genreIdArray)
        .havingRaw(`COUNT(DISTINCT anime_genres.genre_id) = ?`, [
          genreIdArray.length,
        ]);
    }

    // Aplicar filtros de keywords
    if (keywords) {
      rankingQuery = rankingQuery
        .join("anime_keywords", "animes.id", "anime_keywords.anime_id")
        .whereIn("anime_keywords.keyword_id", keywordIdArray)
        .havingRaw(`COUNT(DISTINCT anime_keywords.keyword_id) = ?`, [
          keywordIdArray.length,
        ]);
    }

    // Validar campo de ordenação e aplicar ordenação correta com base no tipo de ranking
    if (ranking_type === "best_pick") {
      // Para best_pick, só podemos ordenar por contagem de votos
      rankingQuery = rankingQuery.orderBy(
        "vote_count",
        sort_order === "asc" ? "asc" : "desc"
      );
    } else {
      // Para estrelas, podemos ordenar por média ou contagem
      const sortField =
        sort_by === "vote_count" ? "vote_count" : "average_stars";
      rankingQuery = rankingQuery.orderBy(
        sortField,
        sort_order === "asc" ? "asc" : "desc"
      );
    }

    // Aplicar paginação
    rankingQuery = rankingQuery.limit(limit).offset(offset);

    // Contar total de animes no ranking com os mesmos filtros
    const countQuery = knex(rankingTable)
      .countDistinct(`${rankingTable}.anime_id as total`)
      .join("animes", `${rankingTable}.anime_id`, "animes.id")
      .where({
        [`${rankingTable}.season`]: targetSeason,
        [`${rankingTable}.year`]: targetYear,
      });

    // Aplicar os mesmos filtros à query de contagem
    if (genres) {
      countQuery
        .join("anime_genres", "animes.id", "anime_genres.anime_id")
        .whereIn("anime_genres.genre_id", genreIdArray)
        .groupBy(`${rankingTable}.anime_id`)
        .havingRaw(`COUNT(DISTINCT anime_genres.genre_id) = ?`, [
          genreIdArray.length,
        ]);
    }

    if (keywords) {
      countQuery
        .join("anime_keywords", "animes.id", "anime_keywords.anime_id")
        .whereIn("anime_keywords.keyword_id", keywordIdArray)
        .groupBy(`${rankingTable}.anime_id`)
        .havingRaw(`COUNT(DISTINCT anime_keywords.keyword_id) = ?`, [
          keywordIdArray.length,
        ]);
    }

    // Executar as queries
    const [rankings, totalCountResult] = await Promise.all([
      rankingQuery,
      countQuery.first(),
    ]);

    const total = parseInt(totalCountResult?.total || 0, 10);
    const totalPages = Math.ceil(total / limit);

    // Formatar as classificações
    const formattedRankings = rankings.map((anime, index) => {
      const result = {
        position: offset + index + 1,
        anime_id: anime.anime_id,
        name: anime.name,
        original_name: anime.original_name,
        poster_path: anime.poster_path,
        vote_count: parseInt(anime.vote_count, 10),
      };

      // Adicionar score apenas se o ranking for baseado em estrelas
      if (ranking_type === "stars" && anime.average_stars !== undefined) {
        result.stars = parseFloat(anime.average_stars);
      }

      return result;
    });

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
      filters: {
        ranking_type,
        season: targetSeason,
        year: targetYear,
        genres: genres ? genres.split(",").map((g) => g.trim()) : [],
        keywords: keywords ? keywords.split(",").map((k) => k.trim()) : [],
      },
      data: formattedRankings,
    });
  } catch (error) {
    console.error("Erro ao buscar ranking de animes:", error);
    return reply
      .status(500)
      .send({ error: "Erro ao buscar ranking de animes." });
  }
}

// Função para votar com estrelas (0-5)
async function rateAnime(req, reply) {
  const { anime_id, stars } = req.body;
  const user_id = req.user.id;

  // Validações básicas
  if (!anime_id) {
    return reply.status(400).send({
      error: "Bad Request",
      message: "ID do anime é obrigatório.",
    });
  }

  if (stars === undefined || stars === null) {
    return reply.status(400).send({
      error: "Bad Request",
      message: "Avaliação em estrelas é obrigatória.",
    });
  }

  // Validar se o stars está no intervalo correto (0 a 5, permitindo meias estrelas)
  const starsValue = parseFloat(stars);
  if (
    isNaN(starsValue) ||
    starsValue < 0 ||
    starsValue > 5 ||
    (starsValue * 2) % 1 !== 0
  ) {
    return reply.status(400).send({
      error: "Bad Request",
      message:
        "A avaliação deve ser um número entre 0 e 5, com incrementos de 0.5 (ex: 0, 0.5, 1, 1.5, ... 5).",
    });
  }

  try {
    // Verificar se o anime existe
    const animeExists = await knex("animes").where({ id: anime_id }).first();
    if (!animeExists) {
      return reply.status(404).send({
        error: "Not Found",
        message: "Anime não encontrado.",
      });
    }

    // Determinar a temporada e ano com base no status do anime
    let seasonYear, seasonName;

    if (animeExists.is_current_season) {
      // Se o anime está em lançamento, usar data atual
      const currentDate = new Date();
      seasonYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      // Determinar temporada com base no mês atual
      if (currentMonth >= 12 || currentMonth <= 2) {
        seasonName = "verão";
      } else if (currentMonth >= 3 && currentMonth <= 5) {
        seasonName = "outono";
      } else if (currentMonth >= 6 && currentMonth <= 8) {
        seasonName = "inverno";
      } else {
        seasonName = "primavera";
      }
    } else {
      // Se o anime não está em lançamento, usar first_air_date
      if (!animeExists.first_air_date) {
        // Se não tiver data de lançamento, usar temporada/ano padrão
        seasonName = "desconhecida";
        seasonYear = 0;
      } else {
        // Converter string de data para objeto Date
        const airDate = new Date(animeExists.first_air_date);
        seasonYear = airDate.getFullYear();
        const airMonth = airDate.getMonth() + 1;

        // Determinar temporada com base no mês de lançamento
        if (airMonth >= 12 || airMonth <= 2) {
          seasonName = "verão";
        } else if (airMonth >= 3 && airMonth <= 5) {
          seasonName = "outono";
        } else if (airMonth >= 6 && airMonth <= 8) {
          seasonName = "inverno";
        } else {
          seasonName = "primavera";
        }
      }
    }

    // Verificar se o usuário já votou neste anime para esta temporada/ano
    const existingRating = await knex("anime_rankings")
      .where({
        anime_id,
        user_id,
        season: seasonName,
        year: seasonYear,
      })
      .first();

    if (existingRating) {
      // Atualizar avaliação existente
      await knex("anime_rankings").where({ id: existingRating.id }).update({
        stars: starsValue,
        updated_at: knex.fn.now(),
      });

      return reply.status(200).send({
        message: `Avaliação para "${animeExists.name}" atualizada com sucesso.`,
        data: {
          anime_id,
          stars: starsValue,
          season: seasonName,
          year: seasonYear,
        },
      });
    } else {
      // Inserir nova avaliação
      await knex("anime_rankings").insert({
        anime_id,
        user_id,
        season: seasonName,
        year: seasonYear,
        stars: starsValue,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now(),
      });

      return reply.status(201).send({
        message: `Avaliação para "${animeExists.name}" registrada com sucesso.`,
        data: {
          anime_id,
          stars: starsValue,
          season: seasonName,
          year: seasonYear,
        },
      });
    }
  } catch (error) {
    console.error("Erro ao registrar avaliação:", error);
    return reply.status(500).send({
      error: "Internal Server Error",
      message: "Erro ao registrar ou atualizar avaliação.",
    });
  }
}

// Função para escolher o melhor anime da temporada
async function pickSeasonBest(req, reply) {
  const { anime_id } = req.body;
  const user_id = req.user.id;

  // Validações básicas
  if (!anime_id) {
    return reply.status(400).send({
      error: "Bad Request",
      message: "ID do anime é obrigatório.",
    });
  }

  try {
    // Verificar se o anime existe
    const animeExists = await knex("animes").where({ id: anime_id }).first();
    if (!animeExists) {
      return reply.status(404).send({
        error: "Not Found",
        message: "Anime não encontrado.",
      });
    }

    // Determinar a temporada e ano com base no status do anime
    let seasonYear, seasonName;

    if (animeExists.is_current_season) {
      // Se o anime está em lançamento, usar data atual
      const currentDate = new Date();
      seasonYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      // Determinar temporada com base no mês atual
      if (currentMonth >= 12 || currentMonth <= 2) {
        seasonName = "verão";
      } else if (currentMonth >= 3 && currentMonth <= 5) {
        seasonName = "outono";
      } else if (currentMonth >= 6 && currentMonth <= 8) {
        seasonName = "inverno";
      } else {
        seasonName = "primavera";
      }
    } else {
      // Se o anime não está em lançamento, usar first_air_date
      if (!animeExists.first_air_date) {
        // Se não tiver data de lançamento, usar temporada/ano padrão
        seasonName = "desconhecida";
        seasonYear = 0;
      } else {
        // Converter string de data para objeto Date
        const airDate = new Date(animeExists.first_air_date);
        seasonYear = airDate.getFullYear();
        const airMonth = airDate.getMonth() + 1;

        // Determinar temporada com base no mês de lançamento
        if (airMonth >= 12 || airMonth <= 2) {
          seasonName = "verão";
        } else if (airMonth >= 3 && airMonth <= 5) {
          seasonName = "outono";
        } else if (airMonth >= 6 && airMonth <= 8) {
          seasonName = "inverno";
        } else {
          seasonName = "primavera";
        }
      }
    }

    // Verificar se o usuário já escolheu o melhor anime para esta temporada/ano
    const existingPick = await knex("season_best_picks")
      .where({
        user_id,
        season: seasonName,
        year: seasonYear,
      })
      .first();

    if (existingPick) {
      // Já escolheu, atualizar a escolha
      const previousAnime = await knex("animes")
        .where({ id: existingPick.anime_id })
        .first();

      await knex("season_best_picks").where({ id: existingPick.id }).update({
        anime_id,
        updated_at: knex.fn.now(),
      });

      return reply.status(200).send({
        message: `Sua escolha para o melhor anime da temporada foi alterada de "${previousAnime.name}" para "${animeExists.name}".`,
        data: {
          anime_id,
          previous_anime_id: existingPick.anime_id,
          season: seasonName,
          year: seasonYear,
        },
      });
    } else {
      // Primeira escolha, inserir novo registro
      await knex("season_best_picks").insert({
        anime_id,
        user_id,
        season: seasonName,
        year: seasonYear,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now(),
      });

      return reply.status(201).send({
        message: `"${animeExists.name}" foi escolhido como seu anime favorito da temporada.`,
        data: {
          anime_id,
          season: seasonName,
          year: seasonYear,
        },
      });
    }
  } catch (error) {
    console.error("Erro ao registrar melhor anime da temporada:", error);
    return reply.status(500).send({
      error: "Internal Server Error",
      message: "Erro ao registrar ou atualizar escolha de melhor anime.",
    });
  }
}

async function UserRanking(req, reply) {
  // Criamos uma query para buscar os animes avaliados pelo usuário
  try {
    const user_id = req.user.id;

    // Determinar temporada atual
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

    // Buscar avaliações do usuário
    const ratings = await knex("anime_rankings")
      .select([
        "anime_rankings.anime_id",
        "anime_rankings.stars",
        "anime_rankings.updated_at",
        "animes.name",
        "animes.poster_path",
      ])
      .join("animes", "anime_rankings.anime_id", "animes.id")
      .where({
        user_id,
        season: currentSeason,
        year: currentYear,
      })
      .orderBy("anime_rankings.updated_at", "desc");

    // Buscar escolha do melhor anime
    const bestPick = await knex("season_best_picks")
      .select([
        "season_best_picks.anime_id",
        "animes.name",
        "animes.poster_path",
      ])
      .join("animes", "season_best_picks.anime_id", "animes.id")
      .where({
        user_id,
        season: currentSeason,
        year: currentYear,
      })
      .first();

    return reply.status(200).send({
      season: currentSeason,
      year: currentYear,
      ratings: ratings,
      best_pick: bestPick || null,
    });
  } catch (error) {
    console.error("Erro ao buscar avaliações do usuário:", error);
    return reply
      .status(500)
      .send({ error: "Erro ao buscar avaliações do usuário." });
  }
}

// Exportar as funções do controller
module.exports = {
  getAnimeRankings,
  rateAnime,
  pickSeasonBest,
  UserRanking,
};
