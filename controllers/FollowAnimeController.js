const knex = require("knex")(require("../knexfile").development);

async function toggleFollowAnime(req, reply) {
  const { anime_id } = req.body;
  const user_id = req.user.id;

  if (!anime_id) {
    return reply.status(400).send({
      error: "Bad Request",
      message: "ID do anime é obrigatório.",
    });
  }

  try {
    const animeExists = await knex("animes").where({ id: anime_id }).first();
    if (!animeExists) {
      return reply.status(404).send({
        error: "Not Found",
        message: "Anime não encontrado.",
      });
    }

    const existingFollow = await knex("anime_follows")
      .where({ anime_id, user_id })
      .first();

    if (existingFollow) {
      await knex("anime_follows").where({ anime_id, user_id }).del();
      return reply.status(200).send({
        message: "Anime removido dos favoritos.",
      });
    }

    await knex("anime_follows").insert({
      anime_id,
      user_id,
    });

    return reply.status(201).send({
      message: "Anime adicionado aos favoritos.",
    });
  } catch (error) {
    console.error("Erro ao atualizar favoritos:", error);
    return reply.status(500).send({
      error: "Erro ao atualizar anime nos favoritos.",
    });
  }
}

async function listFollowedAnimes(req, reply) {
  const user_id = req.user.id;

  try {
    const followedAnimes = await knex("anime_follows")
      .join("animes", "anime_follows.anime_id", "animes.id")
      .where("anime_follows.user_id", user_id)
      .select("animes.id", "animes.name", "animes.poster_path");

    return reply.status(200).send({
      message: "Animes favoritados listados com sucesso.",
      animes: followedAnimes,
    });
  } catch (error) {
    console.error("Erro ao listar favoritos:", error);
    return reply.status(500).send({
      error: "Erro ao listar animes favoritados.",
    });
  }
}

module.exports = { toggleFollowAnime, listFollowedAnimes };
