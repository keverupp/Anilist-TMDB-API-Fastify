const { getAnimeSeasons } = require('../models/animeSeasonsModel');
const { findEpisode, createEpisode, getEpisodesByAnimeId, getEpisodesWithNullRuntime, updateEpisodeInfo } = require('../models/episodesModel');
const axios = require('axios');
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
  const { page = 1, limit = 10 } = request.query;

  try {
    const { episodes, total } = await getEpisodesByAnimeId(animeId, parseInt(page), parseInt(limit));

    const totalPages = Math.ceil(total / limit);

    reply.send({
      animeId,
      episodes,
      pagination: {
        total,
        totalPages,
        currentPage: parseInt(page),
        perPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ error: 'Erro ao listar episódios.' });
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
