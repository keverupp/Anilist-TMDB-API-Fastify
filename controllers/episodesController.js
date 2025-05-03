const {
  getAnimeSeasons,
  getAnimeSeasonId,
} = require("../models/animeSeasonsModel");
const { findEpisode, createEpisode } = require("../models/episodesModel");
const axios = require("axios");
const knex = require("knex")(require("../knexfile").development);
const apiKey = process.env.TMDB_API_KEY;

async function fetchEpisodes(request, reply) {
  const { animeId } = request.params;

  try {
    const animeSeasons = await getAnimeSeasons(animeId);

    if (!animeSeasons || animeSeasons.length === 0) {
      return reply
        .status(404)
        .send({ error: "Nenhuma temporada encontrada para o anime." });
    }

    await Promise.all(
      animeSeasons.map(async (season) => {
        const { data } = await axios.get(
          `https://api.themoviedb.org/3/tv/${animeId}/season/${season.season}`,
          { params: { api_key: apiKey, language: "pt-BR" } }
        );

        const episodes = data.episodes || [];
        for (const episode of episodes) {
          const existingEpisode = await findEpisode({
            anime_season_id: season.anime_season_id,
            episode_number: episode.episode_number,
          });

          if (!existingEpisode) {
            await createEpisode({
              anime_season_id: season.anime_season_id,
              episode_number: episode.episode_number,
              name: episode.name,
              overview: episode.overview || "Descrição não disponível.",
              still_path: episode.still_path
                ? `https://image.tmdb.org/t/p/w500${episode.still_path}`
                : "Imagem não disponível",
              air_date: episode.air_date || null,
              vote_average: episode.vote_average || 0,
              vote_count: episode.vote_count || 0,
              runtime: episode.runtime || null,
              tmdb_id: episode.id,
              show_id: animeId,
              is_pending_update: episode.air_date > new Date().toISOString(), // Marca como pendente se o episódio ainda não foi lançado
            });
          }
        }
      })
    );

    return reply
      .status(201)
      .send({ message: "Episódios importados com sucesso!" });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "Erro ao importar episódios." });
  }
}

async function listEpisodes(request, reply) {
  const { animeId } = request.params;
  const {
    page = 1,
    limit = 10,
    fields,
    season,
    year,
    order = "asc",
    includeFuture = false, // Novo parâmetro para incluir ou não episódios futuros
  } = request.query;

  try {
    const animeSeason = await getAnimeSeasonId(animeId, season, year);
    if (!animeSeason) {
      return reply.status(404).send({ error: "Temporada não encontrada." });
    }

    const anime = await knex("animes")
      .where({ id: animeId })
      .first("anilist_id");
    if (!anime) {
      return reply.status(404).send({ error: "Anime não encontrado." });
    }

    const anilistId = anime.anilist_id;
    const allowedFields = [
      "id",
      "episode_number",
      "name",
      "overview",
      "still_path",
      "created_at",
      "air_date",
      "vote_average",
      "vote_count",
      "runtime",
      "anime_season_id",
      "tmdb_id",
      "show_id",
      "updated_at",
      "is_pending_update",
    ];

    const selectedFields = fields
      ? fields.split(",").map((f) => f.trim())
      : allowedFields;

    const invalidFields = selectedFields.filter(
      (field) => !allowedFields.includes(field)
    );
    if (invalidFields.length > 0) {
      return reply.status(400).send({
        error: "Campos inválidos selecionados.",
        invalidFields,
      });
    }

    const offset = (page - 1) * limit;
    const sortOrder = order.toLowerCase() === "desc" ? "desc" : "asc";

    // Construir a consulta base
    let episodesQuery = knex("episodes").where({
      anime_season_id: animeSeason.anime_season_id,
    });

    // Adicionar filtro para episódios futuros se includeFuture for false
    if (includeFuture !== "true" && includeFuture !== true) {
      episodesQuery = episodesQuery.where({ is_pending_update: false });
    }

    // Executar as consultas para obter os episódios e o total
    const [episodes, totalCount] = await Promise.all([
      episodesQuery
        .clone()
        .select(selectedFields)
        .orderBy("episode_number", sortOrder)
        .limit(limit)
        .offset(offset),
      episodesQuery.clone().count("id as count").first(),
    ]);

    const total = parseInt(totalCount.count, 10);
    const totalPages = Math.ceil(total / limit);

    const episodesWithUrl = episodes.map((ep) => ({
      ...ep,
      episode_url: `https://www.miruro.online/watch?id=${anilistId}&ep=${ep.episode_number}`,
    }));

    return reply.send({
      animeId,
      season,
      year,
      episodes: episodesWithUrl,
      pagination: {
        total,
        totalPages,
        currentPage: parseInt(page, 10),
        perPage: parseInt(limit, 10),
      },
    });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "Erro ao listar episódios." });
  }
}

async function updatePendingEpisodes(request, reply) {
  try {
    // Primeiro, atualizar automaticamente o is_pending_update para false
    // para episódios com data de exibição mais antiga que 7 dias
    const autoUpdateResult = await knex("episodes")
      .where("overview", "Descrição não disponível.")
      .andWhere("is_pending_update", true)
      .andWhere("air_date", "<", knex.raw("CURRENT_DATE - INTERVAL '1 days'"))
      .update({
        is_pending_update: false,
        updated_at: new Date().toISOString(),
      })
      .returning(["id", "name", "air_date"]);

    // Agora buscar apenas episódios que realmente precisam de atualização
    // Modificação no primeiro where para verificar apenas episódios pendentes
    // ou com descrição não disponível mas com air_date até 7 dias atrás
    const episodesNeedingUpdate = await knex("episodes")
      .where(function () {
        this.where(function () {
          this.where("is_pending_update", true).orWhere(
            "overview",
            "Descrição não disponível."
          );
        }).andWhere(
          "air_date",
          ">=",
          knex.raw("CURRENT_DATE - INTERVAL '7 days'")
        );
      })
      .andWhere("air_date", "<=", knex.raw("CURRENT_DATE + INTERVAL '7 days'"));

    if (episodesNeedingUpdate.length === 0 && autoUpdateResult.length === 0) {
      return reply
        .status(200)
        .send({ message: "Nenhum episódio para atualizar foi encontrado." });
    }

    // Criação de arrays para rastrear resultados
    const updateResults = {
      success: [],
      failed: [],
      notFound: [],
      seasonMissing: [],
      autoMarkedNotPending: autoUpdateResult || [], // Adicionar os resultados da atualização automática
    };

    // Vamos buscar todos os season_ids de uma vez para melhorar o desempenho
    const seasonMapping = await knex("seasons")
      .select("id", "season")
      .then((seasons) => {
        // Criar um mapa para busca rápida
        const map = {};
        seasons.forEach((s) => {
          map[s.id] = s.season;
        });
        return map;
      });

    // Buscar o mapeamento de anime_season_id para season_id
    const animeSeasonMapping = await knex("anime_seasons")
      .select("id", "season_id")
      .then((animeSeasons) => {
        const map = {};
        animeSeasons.forEach((as) => {
          map[as.id] = as.season_id;
        });
        return map;
      });

    // Processar os episódios em lotes para evitar sobrecarga na API
    const batchSize = 10;

    for (let i = 0; i < episodesNeedingUpdate.length; i += batchSize) {
      const batch = episodesNeedingUpdate.slice(i, i + batchSize);

      const results = await Promise.allSettled(
        batch.map(async (episode) => {
          try {
            const { id, show_id, episode_number, anime_season_id, name } =
              episode;

            // Buscar o season_id usando o mapeamento
            const season_id = animeSeasonMapping[anime_season_id];

            if (!season_id) {
              console.log(
                `Não foi encontrado season_id para anime_season_id=${anime_season_id}`
              );
              await knex("episodes")
                .where("id", id)
                .update({ is_pending_update: false });
              return {
                id,
                name,
                anime_season_id,
                status: "season_missing",
                message: `Não foi encontrado season_id para anime_season_id=${anime_season_id}`,
              };
            }

            // Buscar o número da temporada usando o season_id
            const season = seasonMapping[season_id];

            if (!season) {
              console.log(
                `Não foi encontrado número de temporada para season_id=${season_id}`
              );
              await knex("episodes")
                .where("id", id)
                .update({ is_pending_update: false });
              return {
                id,
                name,
                anime_season_id,
                season_id,
                status: "season_missing",
                message: `Não foi encontrado número de temporada para season_id=${season_id}`,
              };
            }

            // Montar a URL correta para a API
            const apiUrl = `https://api.themoviedb.org/3/tv/${show_id}/season/${season}/episode/${episode_number}`;

            // Buscar informações atualizadas na API
            const { data } = await axios.get(apiUrl, {
              params: { api_key: apiKey, language: "pt-BR" },
            });

            // Tratar overview e verificar pendência
            const overviewText =
              data.overview && data.overview.trim() !== ""
                ? data.overview
                : "Descrição não disponível.";

            // Verificar se o episódio ainda deve ser considerado pendente:
            // - Se tem descrição disponível, não é pendente
            // - Se a data de exibição já passou há mais de 7 dias, não é mais pendente
            const airDate = new Date(data.air_date || episode.air_date);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const isPendingUpdate =
              overviewText === "Descrição não disponível." &&
              (!airDate || airDate > sevenDaysAgo);

            // Preparar os dados atualizados
            const updatedData = {
              name: data.name || episode.name || null,
              overview: overviewText,
              still_path: data.still_path
                ? `https://image.tmdb.org/t/p/w500${data.still_path}`
                : "Imagem não disponível",
              air_date: data.air_date || episode.air_date || null,
              vote_average: data.vote_average || 0,
              vote_count: data.vote_count || 0,
              runtime: data.runtime || episode.runtime || null,
              production_code: data.production_code || null,
              episode_type: data.episode_type || null,
              is_pending_update: isPendingUpdate,
              updated_at: new Date().toISOString(),
            };

            // Atualizar episódio no banco
            await knex("episodes").where("id", id).update(updatedData);

            // Retornar sucesso
            return {
              id,
              name: data.name || name,
              status: "success",
              isPendingUpdate: isPendingUpdate,
            };
          } catch (error) {
            if (error.response && error.response.status === 404) {
              // Episódio não encontrado na API → marcar como não pendente
              await knex("episodes")
                .where("id", episode.id)
                .update({ is_pending_update: false });

              return {
                id: episode.id,
                name: episode.name,
                status: "not_found",
                message: "Episódio não encontrado na API externa",
              };
            } else {
              console.error(
                `Erro ao atualizar episódio ID ${episode.id}:`,
                error.message
              );

              return {
                id: episode.id,
                name: episode.name,
                status: "error",
                message: error.message,
              };
            }
          }
        })
      );

      // Processamento dos resultados
      results.forEach((result) => {
        if (result.status === "fulfilled") {
          const episode = result.value;
          if (episode.status === "success") {
            updateResults.success.push(episode);
          } else if (episode.status === "not_found") {
            updateResults.notFound.push(episode);
          } else if (episode.status === "season_missing") {
            updateResults.seasonMissing.push(episode);
          } else {
            updateResults.failed.push(episode);
          }
        } else {
          updateResults.failed.push({
            status: "error",
            message: result.reason.message || "Erro desconhecido",
          });
        }
      });

      // Pequena pausa entre os lotes
      if (i + batchSize < episodesNeedingUpdate.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Se temos temporadas ausentes, vamos fazer uma verificação adicional
    if (updateResults.seasonMissing.length > 0) {
      // Extrair os IDs das temporadas com problemas
      const problematicSeasonIds = updateResults.seasonMissing
        .filter((item) => item.season_id)
        .map((item) => item.season_id);

      // Buscar as temporadas problemáticas
      if (problematicSeasonIds.length > 0) {
        const seasonInfo = await knex("seasons")
          .whereIn("id", problematicSeasonIds)
          .select("*");

        updateResults.seasonDiagnostics = {
          expectedSeasons: problematicSeasonIds,
          foundSeasons: seasonInfo,
        };
      }
    }

    return reply.status(200).send({
      message: "Processo de atualização concluído",
      summary: {
        total:
          episodesNeedingUpdate.length +
          updateResults.autoMarkedNotPending.length,
        successful: updateResults.success.length,
        failed: updateResults.failed.length,
        notFound: updateResults.notFound.length,
        seasonMissing: updateResults.seasonMissing.length,
        autoMarkedNotPending: updateResults.autoMarkedNotPending.length,
      },
      details: updateResults,
    });
  } catch (error) {
    console.error("Erro geral na atualização:", error);
    return reply.status(500).send({
      error: "Erro ao atualizar episódios.",
      message: error.message,
    });
  }
}

async function getRecentEpisodes(request, reply) {
  const { page = 1, perPage = 10 } = request.query;

  try {
    const episodes = await knex("episodes")
      .where("is_pending_update", false)
      .andWhere("air_date", "<=", knex.fn.now())
      .orderBy("updated_at", "desc")
      .limit(perPage)
      .offset((page - 1) * perPage);

    const [{ count }] = await knex("episodes")
      .where("is_pending_update", false)
      .andWhere("air_date", "<=", knex.fn.now())
      .count("id as count");

    return reply.send({
      episodes,
      pagination: {
        total: parseInt(count),
        totalPages: Math.ceil(count / perPage),
        currentPage: Number(page),
        perPage: Number(perPage),
      },
    });
  } catch (error) {
    console.error(error);
    return reply
      .status(500)
      .send({ error: "Erro ao buscar episódios recentes." });
  }
}

async function getEpisodeById(request, reply) {
  const { episodeId } = request.params;
  const { fields } = request.query;

  try {
    const allowedFields = [
      "id",
      "episode_number",
      "name",
      "overview",
      "still_path",
      "created_at",
      "air_date",
      "vote_average",
      "vote_count",
      "runtime",
      "anime_season_id",
      "tmdb_id",
      "show_id",
      "updated_at",
      "is_pending_update",
    ];

    const selectedFields = fields
      ? fields.split(",").map((f) => f.trim())
      : allowedFields;

    const invalidFields = selectedFields.filter(
      (field) => !allowedFields.includes(field)
    );
    if (invalidFields.length > 0) {
      return reply.status(400).send({
        error: "Campos inválidos selecionados.",
        invalidFields,
      });
    }

    // Get the episode data
    const episode = await knex("episodes")
      .where({ id: episodeId })
      .first(selectedFields);

    if (!episode) {
      return reply.status(404).send({ error: "Episódio não encontrado." });
    }

    // Get the anime information using the show_id from the episode
    const anime = await knex("animes")
      .where({ id: episode.show_id })
      .first([
        "id",
        "name",
        "poster_path",
        "banner_path",
        "backdrop_path",
        "anilist_id",
      ]);

    if (!anime) {
      return reply.status(404).send({ error: "Anime não encontrado." });
    }

    // Get the season information
    const season = await knex("anime_seasons")
      .join("seasons", "anime_seasons.season_id", "=", "seasons.id")
      .where({ "anime_seasons.id": episode.anime_season_id })
      .first(["seasons.season", "seasons.year"]);

    // Get the next and previous episodes
    const [previousEpisode, nextEpisode] = await Promise.all([
      knex("episodes")
        .where({
          anime_season_id: episode.anime_season_id,
          episode_number: episode.episode_number - 1,
        })
        .first(["id", "episode_number", "name"]),
      knex("episodes")
        .where({
          anime_season_id: episode.anime_season_id,
          episode_number: episode.episode_number + 1,
        })
        .first(["id", "episode_number", "name"]),
    ]);

    // Construct episode URL
    const episodeUrl = anime.anilist_id
      ? `https://www.miruro.online/watch?id=${anime.anilist_id}&ep=${episode.episode_number}`
      : null;

    // Combine the data
    const response = {
      episode: {
        ...episode,
        episode_url: episodeUrl,
      },
      anime,
      season,
      navigation: {
        previous: previousEpisode || null,
        next: nextEpisode || null,
      },
    };

    return reply.send(response);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "Erro ao buscar episódio." });
  }
}

module.exports = {
  fetchEpisodes,
  listEpisodes,
  updatePendingEpisodes,
  getRecentEpisodes,
  getEpisodeById,
};
