// services/NotificationService.js
const knex = require("knex")(require("../knexfile").development);
const EventEmitter = require("events");

// Criar emissor de eventos para notificações
const notificationEmitter = new EventEmitter();

/**
 * Função para inscrever um cliente no websocket de notificações
 * @param {number} userId - ID do usuário que receberá as notificações
 * @param {function} callback - Função a ser chamada quando uma notificação for recebida
 * @returns {function} - Função para cancelar a inscrição
 */
function subscribeToNotifications(userId, callback) {
  const listener = (notification) => {
    // Verificar se a notificação é destinada a este usuário
    if (notification.user_id.toString() === userId.toString()) {
      callback(notification);
    }
  };

  // Registrar o listener
  notificationEmitter.on("notification", listener);

  // Retornar função para cancelar a inscrição
  return () => notificationEmitter.off("notification", listener);
}

/**
 * Função para emitir notificação via WebSocket
 * @param {Object} notification - Objeto da notificação
 */
function emitNotification(notification) {
  notificationEmitter.emit("notification", notification);
}

async function createNotification(user_id, type, related_id) {
  try {
    // 1) Verifica se já existe
    let notification = await knex("notifications")
      .where({ user_id, type, related_id })
      .first();

    if (notification) {
      // 2) Se existir, só marca como não lida e atualiza timestamp
      await knex("notifications").where({ id: notification.id }).update({
        read: false,
        created_at: new Date(), // opcional
      });

      // Recarrega o registro atualizado
      notification = await knex("notifications")
        .where({ id: notification.id })
        .first();

      emitNotification({
        action: "update_notification",
        ...notification,
      });

      return notification;
    }

    // 3) Se não existir, insere normalmente
    const [inserted] = await knex("notifications")
      .insert({
        user_id,
        type,
        related_id,
        read: false,
        created_at: new Date(),
      })
      .returning("*");

    emitNotification({
      action: "new_notification",
      ...inserted,
    });

    return inserted;
  } catch (error) {
    console.error("Erro ao criar notificação:", error);
  }
}

// Notificar o autor do comentário pai
async function notifyReply(parent_id, user_id, commentId) {
  try {
    const parentComment = await knex("comments")
      .where({ id: parent_id })
      .first();

    // Evitar notificar o próprio autor
    if (parentComment && parentComment.user_id !== user_id) {
      const relatedId = commentId?.id || commentId; // Extrai o ID corretamente

      await createNotification(parentComment.user_id, "reply", relatedId);

      console.log(
        `Notificação criada para o usuário ${parentComment.user_id} sobre a resposta ao comentário ${parent_id}`
      );
    }
  } catch (error) {
    console.error("Erro ao criar notificação de resposta:", error);
  }
}

// Notificar sobre uma reação a um comentário
async function notifyReaction(commentId, reactionUserId) {
  try {
    const comment = await knex("comments").where({ id: commentId }).first();
    if (comment && comment.user_id !== reactionUserId) {
      const preferences = await knex("user_preferences")
        .where({ user_id: comment.user_id })
        .first();
      if (preferences && preferences.notify_reactions) {
        await createNotification(comment.user_id, "reaction", commentId);
      }
    }
  } catch (error) {
    console.error("Erro ao notificar reação:", error);
  }
}

// Notificar seguidores sobre novos comentários em um anime
async function notifyNewComment(commentId) {
  try {
    // Primeiro, obtemos o animeId a partir do comentário
    const comment = await knex("comments")
      .where("id", commentId)
      .first("anime_id", "user_id");

    if (!comment) {
      // Caso não exista o comentário, não há o que notificar
      return;
    }

    const animeId = comment.anime_id;
    const commentUserId = comment.user_id;

    // Agora buscamos os seguidores do anime
    const followers = await knex("anime_follows")
      .join(
        "user_preferences",
        "anime_follows.user_id",
        "=",
        "user_preferences.user_id"
      )
      .where("anime_follows.anime_id", animeId)
      .andWhere("user_preferences.notify_new_comments", true)
      .select("anime_follows.user_id");

    // Enviamos a notificação a cada seguidor usando o commentId
    for (const follower of followers) {
      // Não notificar o próprio autor do comentário
      if (follower.user_id !== commentUserId) {
        await createNotification(follower.user_id, "new_comment", commentId);
      }
    }
  } catch (error) {
    console.error("Erro ao notificar novo comentário:", error);
  }
}

// Notificar seguidores sobre novos episódios de um anime
async function notifyNewEpisode(animeId, episodeId) {
  try {
    const followers = await knex("anime_follows")
      .join(
        "user_preferences",
        "anime_follows.user_id",
        "=",
        "user_preferences.user_id"
      )
      .where("anime_follows.anime_id", animeId)
      .andWhere("user_preferences.notify_new_episodes", true)
      .select("anime_follows.user_id");

    if (followers.length === 0) {
      console.log(
        `Nenhum seguidor com notificações habilitadas para o anime ${animeId}.`
      );
      return;
    }

    for (const follower of followers) {
      await createNotification(follower.user_id, "new_episode", episodeId);
    }
  } catch (error) {
    console.error("Erro ao notificar novos episódios:", error);
  }
}

/**
 * Marca todas as notificações do usuário como lidas
 * @param {number} userId - ID do usuário
 * @returns {boolean} - Sucesso da operação
 */
async function markAllNotificationsAsRead(userId) {
  try {
    await knex("notifications")
      .where({ user_id: userId, read: false })
      .update({ read: true });

    // Emitir via websocket que todas notificações foram lidas
    emitNotification({
      action: "all_read",
      user_id: userId,
    });

    return true;
  } catch (error) {
    console.error("Erro ao marcar todas notificações como lidas:", error);
    return false;
  }
}

/**
 * Conta notificações não lidas do usuário
 * @param {number} userId - ID do usuário
 * @returns {number} - Número de notificações não lidas
 */
async function countUnreadNotifications(userId) {
  try {
    const result = await knex("notifications")
      .where({ user_id: userId, read: false })
      .count("id as count")
      .first();

    return parseInt(result.count) || 0;
  } catch (error) {
    console.error("Erro ao contar notificações não lidas:", error);
    return 0;
  }
}

module.exports = {
  // Funções originais
  notifyReply,
  notifyReaction,
  notifyNewComment,
  notifyNewEpisode,
  createNotification,

  // Novas funções
  subscribeToNotifications,
  emitNotification,
  markAllNotificationsAsRead,
  countUnreadNotifications,
};
