const knex = require("knex")(require("../knexfile").development);
const { notifyReaction } = require("../services/NotificationService");

// Adicionar ou alterar reação
async function reactToComment(req, reply) {
  const { comment_id, type } = req.body;
  const user_id = req.user.id; // Supõe que o middleware adiciona `user` ao request

  // Validação básica
  if (!comment_id || !["upvote", "downvote"].includes(type)) {
    return reply.status(400).send({ error: "Dados inválidos." });
  }

  try {
    // 1) Verifica reação existente
    const existing = await knex("reactions")
      .where({ comment_id, user_id })
      .first();

    if (existing) {
      if (existing.type === type) {
        // Já votou igual — erro
        return reply
          .status(400)
          .send({ error: "Você já reagiu dessa forma a este comentário." });
      }
      // Atualiza para o outro tipo
      await knex("reactions").where({ id: existing.id }).update({ type });
    } else {
      // 2) Cria nova reação
      await knex("reactions").insert({ comment_id, user_id, type });
    }

    // 3) Notifica o autor (opcional também em update)
    await notifyReaction(comment_id, user_id);

    // 4) Recalcula as contagens
    const [up] = await knex("reactions")
      .where({ comment_id, type: "upvote" })
      .count("id as count");
    const [down] = await knex("reactions")
      .where({ comment_id, type: "downvote" })
      .count("id as count");

    const upvotes = parseInt(up.count, 10);
    const downvotes = parseInt(down.count, 10);
    const score = upvotes - downvotes;

    // 5) Retorna o estado completo
    return reply.status(200).send({
      upvotes,
      downvotes,
      score,
      userReaction: type,
    });
  } catch (error) {
    console.error("Erro ao reagir:", error);
    return reply
      .status(500)
      .send({ error: "Erro interno ao processar a reação." });
  }
}

async function countReactions(req, reply) {
  const { comment_id } = req.query;
  const user_id = req.user?.id || null;

  try {
    const [up] = await knex("reactions")
      .where({ comment_id, type: "upvote" })
      .count("id as count");
    const [down] = await knex("reactions")
      .where({ comment_id, type: "downvote" })
      .count("id as count");

    // Descobre se o usuário já votou e qual foi o tipo
    let userReaction = null;
    if (user_id) {
      const existing = await knex("reactions")
        .where({ comment_id, user_id })
        .first();
      userReaction = existing ? existing.type : null;
    }

    const upvotes = parseInt(up.count, 10);
    const downvotes = parseInt(down.count, 10);
    const score = upvotes - downvotes;

    return reply.status(200).send({
      upvotes,
      downvotes,
      score,
      userReaction,
    });
  } catch (error) {
    console.error("Erro ao contar reações:", error);
    return reply
      .status(500)
      .send({ error: "Erro interno ao contar as reações." });
  }
}

module.exports = { reactToComment, countReactions };
