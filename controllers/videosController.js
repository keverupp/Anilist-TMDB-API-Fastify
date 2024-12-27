const axios = require("axios");
const { insertVideos } = require("../models/videosModel");
const knex = require("knex")(require("../knexfile").development);

const apiKey = process.env.TMDB_API_KEY;

async function fetchAndStoreVideos(request, reply) {
  const { series_id } = request.params;

  try {
    // Consultar a API do TMDB para obter vídeos
    const response = await axios.get(
      `https://api.themoviedb.org/3/tv/${series_id}/videos`,
      { params: { api_key: apiKey, language: "pt-BR" } }
    );

    // Verificar se a API retornou resultados
    if (
      !response.data ||
      !response.data.results ||
      response.data.results.length === 0
    ) {
      reply
        .status(404)
        .send({ message: "Nenhum vídeo encontrado para esta série." });
      return;
    }

    // Processar os resultados
    const videos = response.data.results.map((video) => ({
      show_id: series_id,
      name: video.name,
      key: video.key,
      site: video.site,
      size: video.size,
      type: video.type,
      official: video.official,
      published_at: video.published_at,
    }));

    // Verificar se há vídeos para inserir
    if (videos.length === 0) {
      reply
        .status(400)
        .send({ message: "Nenhum vídeo válido encontrado para inserir." });
      return;
    }

    // Inserir vídeos no banco de dados
    await insertVideos(videos);

    reply
      .status(201)
      .send({ message: "Vídeos inseridos com sucesso!", videos });
  } catch (error) {
    console.error("Erro ao buscar ou inserir vídeos:", error);
    reply.status(500).send({ error: "Erro ao buscar e inserir vídeos." });
  }
}

async function getVideos(request, reply) {
  const { show_id, page = 1, limit = 10 } = request.query;

  // Validação dos parâmetros
  if (show_id && (!Number.isInteger(Number(show_id)) || show_id <= 0)) {
    reply.status(400).send({
      error: "Parâmetro inválido",
      message: "O ID deve ser um número válido e positivo.",
    });
    return;
  }

  try {
    const offset = (page - 1) * limit;

    let query = knex("videos")
      .select(
        "id",
        "show_id",
        "name",
        "key",
        "site",
        "size",
        "type",
        "official",
        "published_at"
      )
      .limit(limit)
      .offset(offset);

    if (show_id) {
      query = query.where({ show_id });
    }

    const videos = await query;
    const [{ count }] = await knex("videos").count("id as count");

    reply.status(200).send({
      videos,
      pagination: {
        total: parseInt(count, 10),
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page, 10),
        perPage: parseInt(limit, 10),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar vídeos:", error);
    reply.status(500).send({ error: "Erro ao buscar vídeos." });
  }
}

module.exports = { fetchAndStoreVideos, getVideos };
