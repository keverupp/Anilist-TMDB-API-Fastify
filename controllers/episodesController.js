const { getAnimeSeasons, getAnimeSeasonId } = require('../models/animeSeasonsModel');
const { findEpisode, createEpisode, getEpisodesWithNullRuntime, updateEpisodeInfo } = require('../models/episodesModel');
const axios = require('axios');
const knex = require("knex")(require("../knexfile").development);
const apiKey = process.env.TMDB_API_KEY;

async function fetchEpisodes(request, reply) {
  const { animeId } = request.params;

  try {
    // Buscar temporadas associadas ao anime
    const animeSeasons = await getAnimeSeasons(animeId);

    for (const season of animeSeasons) {
      const episodesResponse = await axios.get(
        `https://api.themoviedb.org/3/tv/${animeId}/season/${season.season}`,
        { params: { api_key: apiKey, language: "pt-BR" } }
      );

      const episodes = episodesResponse.data.episodes;

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
            overview: episode.overview || 'Descrição não disponível.',
            still_path: episode.still_path ? `https://image.tmdb.org/t/p/w500${episode.still_path}` : 'Imagem não disponível',
            air_date: episode.air_date,
            vote_average: episode.vote_average || 0,
            vote_count: episode.vote_count || 0,
            runtime: episode.runtime || null,
            tmdb_id: episode.id,
            show_id: animeId,
          });
        }
      }
    }

    reply.status(201).send({ message: 'Episódios importados com sucesso!' });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ error: 'Erro ao importar episódios.' });
  }
}

async function listEpisodes(request, reply) {
  const { animeId } = request.params;
  const { page = 1, limit = 10, fields, season, year } = request.query;

  try {
    // Obter o anime_season_id com base nos parâmetros fornecidos
    const animeSeason = await getAnimeSeasonId(animeId, season, year);

    if (!animeSeason) {
      return reply.status(404).send({ error: 'Temporada não encontrada.' });
    }

    const animeSeasonId = animeSeason.anime_season_id;

    // Buscar o anilist_id na tabela anime
    const anime = await knex("animes").where({ id: animeId }).first("anilist_id");

    if (!anime) {
      return reply.status(404).send({ error: "Anime não encontrado." });
    }

    const anilistId = anime.anilist_id;

    // Lista de campos permitidos
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
    ];

    // Processar os campos selecionados ou usar os padrões
    const selectedFields = fields
      ? fields.split(",").map((field) => field.trim())
      : allowedFields;

    // Validar campos
    const invalidFields = selectedFields.filter((field) => !allowedFields.includes(field));
    if (invalidFields.length > 0) {
      return reply.status(400).send({
        error: "Campos inválidos selecionados.",
        invalidFields,
      });
    }

    // Paginação
    const offset = (page - 1) * limit;

    // Buscar episódios com os campos selecionados
    const episodes = await knex("episodes")
      .where({ anime_season_id: animeSeasonId })
      .select(selectedFields)
      .orderBy("episode_number", "asc")
      .limit(limit)
      .offset(offset);

    // Adicionar o campo `episode_url` a cada episódio
    const episodesWithUrl = episodes.map((episode) => ({
      ...episode,
      episode_url: `https://www.miruro.online/watch?id=${anilistId}&ep=${episode.episode_number}`,
    }));

    // Contar o total de episódios
    const [{ count: total }] = await knex("episodes")
      .where({ anime_season_id: animeSeasonId })
      .count("id as count");

    const totalPages = Math.ceil(total / limit);

    // Responder com os dados paginados
    reply.send({
      animeId,
      season,
      year,
      episodes: episodesWithUrl,
      pagination: {
        total: parseInt(total, 10),
        totalPages,
        currentPage: parseInt(page, 10),
        perPage: parseInt(limit, 10),
      },
    });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ error: "Erro ao listar episódios." });
  }
}


async function updateEpisodesRuntime(request, reply) {
  try {
    // Buscar episódios com runtime nulo
    const episodes = await getEpisodesWithNullRuntime();

    for (const episode of episodes) {
      const { show_id, season_number, episode_number } = episode;

      // Buscar informações do episódio na API do TMDB
      const response = await axios.get(
        `https://api.themoviedb.org/3/tv/${show_id}/season/${season_number}/episode/${episode_number}`,
        { params: { api_key: apiKey, language: "pt-BR" } }
      );

      const data = response.data;

      // Criar objeto de atualização
      const updatedData = {
        name: data.name || null,
        overview: episode.overview || 'Descrição não disponível.',
        still_path: episode.still_path ? `https://image.tmdb.org/t/p/w500${episode.still_path}` : 'Imagem não disponível',
        air_date: episode.air_date,
        air_date: data.air_date || null,
        vote_average: data.vote_average || 0,
        vote_count: data.vote_count || 0,
        runtime: data.runtime || null,
        production_code: data.production_code || null,
        episode_type: data.episode_type || null,
      };

      // Atualizar episódio no banco de dados
      await updateEpisodeInfo(episode.id, updatedData);
    }

    reply.status(200).send({ message: 'Episódios atualizados com sucesso!' });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ error: 'Erro ao atualizar episódios.' });
  }
}


module.exports = { fetchEpisodes, listEpisodes, updateEpisodesRuntime };
