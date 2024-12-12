const knex = require("knex")(require("../knexfile").development);

async function listNotifications(req, reply) {
  const user_id = req.user.id;

  try {
    // Buscar notificações do usuário
    const notifications = await knex("notifications")
      .where({ user_id })
      .orderBy("created_at", "desc")
      .select("notifications.*");

    // Obter IDs dos comentários relacionados
    const relatedIds = notifications.map((n) => n.related_id);

    // Buscar informações dos comentários relacionados
    const relatedComments = await knex("comments")
      .whereIn("id", relatedIds)
      .select("id", "anime_id", "episode_id");

    // Mapear informações dos comentários para fácil acesso
    const commentMap = relatedComments.reduce((acc, comment) => {
      acc[comment.id] = comment;
      return acc;
    }, {});

    // Adicionar detalhes relacionados a cada notificação
    const enrichedNotifications = notifications.map((notification) => {
      const related = commentMap[notification.related_id] || {};
      return {
        ...notification,
        anime_id: related.anime_id || null,
        episode_id: related.episode_id || null,
      };
    });

    return reply.status(200).send({
      message: "Notificações recuperadas com sucesso.",
      notifications: enrichedNotifications,
    });
  } catch (error) {
    console.error("Erro ao listar notificações:", error);
    return reply.status(500).send({
      error: "Erro ao listar notificações.",
    });
  }
}

async function markNotificationAsRead(req, reply) {
  const user_id = req.user.id; // ID do usuário autenticado
  const { id } = req.params; // ID da notificação

  try {
    // Atualizar a notificação como lida
    const updated = await knex("notifications")
      .where({ id, user_id })
      .update({ read: true });

    if (!updated) {
      return reply.status(404).send({
        error: "Not Found",
        message: "Notificação não encontrada ou você não tem permissão.",
      });
    }

    return reply.status(200).send({
      message: "Notificação marcada como lida com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error);
    return reply.status(500).send({
      error: "Erro ao marcar notificação como lida.",
    });
  }
}

module.exports = { markNotificationAsRead, listNotifications };
