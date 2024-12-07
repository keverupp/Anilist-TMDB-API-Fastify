const knex = require("knex")(require("../knexfile").development);
const { notifyReaction } = require("../services/NotificationService");

// Adicionar ou alterar reação
async function reactToComment(req, reply) {
  const { comment_id, type } = req.body;
  const user_id = req.user.id; // Supõe que o middleware adiciona `user` ao request

  if (!comment_id || !["like", "dislike"].includes(type)) {
    return reply.status(400).send({ error: "Dados inválidos." });
  }

  try {
    // Verificar se o usuário já reagiu
    const existingReaction = await knex("reactions").where({ comment_id, user_id }).first();

    if (existingReaction) {
      // Atualizar reação existente
      if (existingReaction.type === type) {
        // Se for a mesma reação, remova
        await knex("reactions").where({ id: existingReaction.id }).del();
        return reply.status(200).send({ message: "Reação removida." });
      } else {
        // Atualizar tipo de reação
        await knex("reactions").where({ id: existingReaction.id }).update({ type });
        return reply.status(200).send({ message: "Reação atualizada." });
      }
    } else {
      // Criar nova reação
      await knex("reactions").insert({ comment_id, user_id, type });
    }

     // Notificar o autor do comentário
    await notifyReaction(comment_id, user_id);
    
    return reply.status(201).send({ message: "Reação adicionada." });

  } catch (error) {
    console.error("Erro ao reagir:", error);
    return reply.status(500).send({ error: "Erro interno ao reagir ao comentário." });
  }
}

// Contar reações
async function countReactions(req, reply) {
  const { comment_id } = req.query;

  try {
    const counts = await knex("reactions")
      .where({ comment_id })
      .groupBy("type")
      .select("type")
      .count("id as count");

    return reply.status(200).send(counts);
  } catch (error) {
    console.error("Erro ao contar reações:", error);
    return reply.status(500).send({ error: "Erro interno ao contar reações." });
  }
}

module.exports = { reactToComment, countReactions };
