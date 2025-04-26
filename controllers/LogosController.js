const axios = require("axios");
const knex = require("knex")(require("../knexfile").development);

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

async function getAnimeLogos(req, reply) {
  const { id } = req.params;

  try {
    const existing = await knex("tmdb_anime_logos")
      .where({ anime_id: id })
      .first();

    if (existing) {
      return reply.send(existing.data);
    }

    const url = `https://api.themoviedb.org/3/tv/${id}/images?include_image_language=en,pt,ja&api_key=${TMDB_API_KEY}`;
    const { data } = await axios.get(url);

    const processFilePath = (items, size) => {
      if (!items || !Array.isArray(items)) return [];
      return items.map((item) => ({
        ...item,
        file_path: item.file_path
          ? `${TMDB_IMAGE_BASE_URL}/w${size}${item.file_path}`
          : null,
      }));
    };

    const processed = {
      ...data,
      logos: processFilePath(data.logos, 500),
      backdrops: processFilePath(data.backdrops, 1280),
      posters: processFilePath(data.posters, 500),
    };

    await knex("tmdb_anime_logos").insert({
      anime_id: id,
      data: JSON.stringify(processed),
    });

    return reply.send(processed);
  } catch (error) {
    req.log.error(error);
    return reply.status(500).send({
      error: "Erro ao buscar ou processar dados da TMDB.",
      details: error.message,
    });
  }
}

module.exports = {
  getAnimeLogos,
};
