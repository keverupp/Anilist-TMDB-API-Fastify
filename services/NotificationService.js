const knex = require("knex")(require("../knexfile").development);

async function createNotification(user_id, type, related_id) {
  try {
    await knex("notifications").insert({
      user_id,
      type,
      related_id,
    });
  } catch (error) {
  }
}

// Notificar o autor do comentário pai
async function notifyReply(parent_id, user_id, commentId) {
  try {
    const parentComment = await knex("comments").where({ id: parent_id }).first();

    // Evitar notificar o próprio autor
    if (parentComment && parentComment.user_id !== user_id) {
      const relatedId = commentId?.id || commentId; // Extrai o ID corretamente

      await knex("notifications").insert({
        user_id: parentComment.user_id,
        type: "reply",
        related_id: relatedId, // Certifica-se de que é um inteiro
        read: false,
        created_at: new Date(),
      });

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
  const comment = await knex("comments").where({ id: commentId }).first();
  if (comment && comment.user_id !== reactionUserId) {
    const preferences = await knex("user_preferences").where({ user_id: comment.user_id }).first();
    if (preferences && preferences.notify_reactions) {
      await createNotification(comment.user_id, "reaction", commentId);
    }
  }
}

// Notificar seguidores sobre novos comentários em um anime
async function notifyNewComment(commentId) {
  // Primeiro, obtemos o animeId a partir do comentário
  const comment = await knex("comments")
    .where("id", commentId)
    .first("anime_id");

  if (!comment) {
    // Caso não exista o comentário, não há o que notificar
    return;
  }

  const animeId = comment.anime_id;

  // Agora buscamos os seguidores do anime
  const followers = await knex("anime_follows")
    .join("user_preferences", "anime_follows.user_id", "=", "user_preferences.user_id")
    .where("anime_follows.anime_id", animeId)
    .andWhere("user_preferences.notify_new_comments", true)
    .select("anime_follows.user_id");

  // Enviamos a notificação a cada seguidor usando o commentId
  for (const follower of followers) {
    await createNotification(follower.user_id, "new_comment", commentId);
  }
}


// Notificar seguidores sobre novos episódios de um anime
async function notifyNewEpisode(animeId, episodeId) {
  try {
    const followers = await knex("anime_follows")
      .join("user_preferences", "anime_follows.user_id", "=", "user_preferences.user_id")
      .where("anime_follows.anime_id", animeId)
      .andWhere("user_preferences.notify_new_episodes", true)
      .select("anime_follows.user_id");

    if (followers.length === 0) {
      console.log(`Nenhum seguidor com notificações habilitadas para o anime ${animeId}.`);
      return;
    }

    for (const follower of followers) {
      await knex("notifications").insert({
        user_id: follower.user_id,
        type: "new_episode",
        related_id: episodeId,
        read: false,
        created_at: new Date(),
      });
    }
  } catch (error) {
    console.error("Erro ao notificar novos episódios:", error);
  }
}

module.exports = {
  notifyReply,
  notifyReaction,
  notifyNewComment,
  notifyNewEpisode,
};
