const knex = require("knex")(require("../knexfile").development);

async function getUserPreferences(req, reply) {
  const user_id = req.user.id;

  try {
    // Busca as preferências do usuário
    const preferences = await knex("user_preferences").where({ user_id }).first();

    if (!preferences) {
      return reply.status(404).send({
        error: "Not Found",
        message: "Preferências do usuário não encontradas.",
      });
    }

    return reply.status(200).send({
      message: "Preferências do usuário recuperadas com sucesso.",
      preferences,
    });
  } catch (error) {
    console.error("Erro ao listar preferências do usuário:", error);
    return reply.status(500).send({
      error: "Erro ao listar preferências do usuário.",
    });
  }
};

async function updateUserPreferences(req, reply) {
  const user_id = req.user.id;
  const { notify_replies, notify_reactions, notify_new_comments, notify_new_episodes } = req.body;

  try {
    // Atualiza as preferências do usuário
    const updated = await knex("user_preferences")
      .where({ user_id })
      .update({
        notify_replies: notify_replies !== undefined ? notify_replies : knex.raw("notify_replies"),
        notify_reactions: notify_reactions !== undefined ? notify_reactions : knex.raw("notify_reactions"),
        notify_new_comments: notify_new_comments !== undefined ? notify_new_comments : knex.raw("notify_new_comments"),
        notify_new_episodes: notify_new_episodes !== undefined ? notify_new_episodes : knex.raw("notify_new_episodes"),
      });

    if (!updated) {
      return reply.status(404).send({
        error: "Not Found",
        message: "Preferências do usuário não encontradas.",
      });
    }

    return reply.status(200).send({
      message: "Preferências do usuário atualizadas com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao atualizar preferências do usuário:", error);
    return reply.status(500).send({
      error: "Erro ao atualizar preferências do usuário.",
    });
  }
};

module.exports = {
    updateUserPreferences,
    getUserPreferences,
  };