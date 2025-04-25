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
  const { page = 1, limit = 10, fields, season, year } = request.query;

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
      "is_pending_update", // Incluímos a coluna `is_pending_update`
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

    const [episodes, totalCount] = await Promise.all([
      knex("episodes")
        .where({ anime_season_id: animeSeason.anime_season_id })
        .select(selectedFields)
        .orderBy("episode_number", "asc")
        .limit(limit)
        .offset(offset),
      knex("episodes")
        .where({ anime_season_id: animeSeason.anime_season_id })
        .count("id as count")
        .first(),
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
    // Buscar episódios com pendência
    const pendingEpisodes = await knex("episodes")
      .where("is_pending_update", true)
      .andWhere("air_date", "<=", knex.fn.now());

    if (pendingEpisodes.length === 0) {
      return reply
        .status(200)
        .send({ message: "Nenhum episódio pendente foi lançado." });
    }

    // Atualizar cada episódio pendente
    await Promise.all(
      pendingEpisodes.map(async (episode) => {
        try {
          const { show_id, episode_number, anime_season_id } = episode;

          // Buscar o número da temporada (season)
          const seasonInfo = await knex("anime_seasons")
            .join("seasons", "anime_seasons.season_id", "seasons.id")
            .where("anime_seasons.id", anime_season_id)
            .select("seasons.season")
            .first();

          if (!seasonInfo || !seasonInfo.season) {
            return;
          }

          const season = seasonInfo.season;

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

          const isPendingUpdate = overviewText === "Descrição não disponível.";

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
          await knex("episodes").where("id", episode.id).update(updatedData);
        } catch (error) {
          // Episódio não encontrado na API → remover pendência para não repetir a busca
          if (error.response && error.response.status === 404) {
            await knex("episodes")
              .where("id", episode.id)
              .update({ is_pending_update: false });
          } else {
            console.error(
              `Erro ao atualizar episódio ID ${episode.id}:`,
              error.message
            );
          }
        }
      })
    );

    return reply
      .status(200)
      .send({ message: "Episódios pendentes atualizados com sucesso!" });
  } catch (error) {
    console.error("Erro geral na atualização:", error);
    return reply
      .status(500)
      .send({ error: "Erro ao atualizar episódios pendentes." });
  }
}
async function updatePendingEpisodes(request, reply) {
  try {
    // Buscar episódios com pendência ou com descrição não disponível e data de lançamento já passada
    const episodesNeedingUpdate = await knex("episodes")
      .where(function () {
        this.where("is_pending_update", true).orWhere(
          "overview",
          "Descrição não disponível."
        );
      })
      .andWhere("air_date", "<=", knex.fn.now());

    if (episodesNeedingUpdate.length === 0) {
      return reply
        .status(200)
        .send({ message: "Nenhum episódio para atualizar foi encontrado." });
    }

    // Atualizar cada episódio
    await Promise.all(
      episodesNeedingUpdate.map(async (episode) => {
        try {
          const { show_id, episode_number, anime_season_id } = episode;

          // Buscar o número da temporada (season)
          const seasonInfo = await knex("anime_seasons")
            .join("seasons", "anime_seasons.season_id", "seasons.id")
            .where("anime_seasons.id", anime_season_id)
            .select("seasons.season")
            .first();

          if (!seasonInfo || !seasonInfo.season) {
            return;
          }

          const season = seasonInfo.season;

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

          const isPendingUpdate = overviewText === "Descrição não disponível.";

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
          await knex("episodes").where("id", episode.id).update(updatedData);
        } catch (error) {
          // Episódio não encontrado na API → remover pendência para não repetir a busca
          if (error.response && error.response.status === 404) {
            await knex("episodes")
              .where("id", episode.id)
              .update({ is_pending_update: false });
          } else {
            console.error(
              `Erro ao atualizar episódio ID ${episode.id}:`,
              error.message
            );
          }
        }
      })
    );

    return reply
      .status(200)
      .send({ message: "Episódios atualizados com sucesso!" });
  } catch (error) {
    console.error("Erro geral na atualização:", error);
    return reply.status(500).send({ error: "Erro ao atualizar episódios." });
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

    const episode = await knex("episodes")
      .where({ id: episodeId })
      .first(selectedFields);

    if (!episode) {
      return reply.status(404).send({ error: "Episódio não encontrado." });
    }

    return reply.send(episode);
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
