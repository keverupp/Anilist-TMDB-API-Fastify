const knex = require("knex")(require("../knexfile").development);

async function toggleFollowAnime(req, reply) {
  const { anime_id } = req.body;
  const user_id = req.user.id; // Obtém o ID do usuário autenticado

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
        message: "Ops. O anime não foi encontrado.",
      });
    }

    // Verificar se o anime já está sendo seguido
    const existingFollow = await knex("anime_follows")
      .where({ anime_id, user_id })
      .first();

    if (existingFollow) {
      // Remover o "seguir"
      await knex("anime_follows").where({ anime_id, user_id }).del();

      return reply.status(200).send({
        message: "Você desfavoritou o anime.",
      });
    }

    // Registrar o "seguir"
    await knex("anime_follows").insert({
      anime_id,
      user_id,
    });

    return reply.status(201).send({
      message: "Anime favoritado.",
    });
  } catch (error) {
    console.error("Erro ao favoritar/desfavoritar anime:", error);
    return reply.status(500).send({
      error: "Erro ao alternar o estado de favoritar anime.",
    });
  }
}

async function listFollowedAnimes(req, reply) {
  const user_id = req.user.id;

  try {
    // Consultar os animes seguidos pelo usuário
    const followedAnimes = await knex("anime_follows")
      .join("animes", "anime_follows.anime_id", "animes.id")
      .where("anime_follows.user_id", user_id)
      .select("animes.id", "animes.name", "animes.poster_path");

    return reply.status(200).send({
      message: "Lista de animes favoritados.",
      animes: followedAnimes,
    });
  } catch (error) {
    console.error("Erro ao listar animes favoritados:", error);
    return reply.status(500).send({
      error: "Erro ao listar animes favoritados.",
    });
  }
}

module.exports = { toggleFollowAnime, listFollowedAnimes };
