const knex = require("knex")(require("../knexfile").development);
const {
  countUnreadNotifications,
  markAllNotificationsAsRead,
} = require("../services/NotificationService");

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

    // Adicionar anime_id e episode_id às notificações
    const enrichedNotifications = notifications.map((notification) => {
      const related = commentMap[notification.related_id] || {};
      return {
        ...notification,
        anime_id: related.anime_id || null,
        episode_id: related.episode_id || null,
      };
    });

    // Coletar todos os IDs de animes e episódios únicos
    const animeIds = [
      ...new Set(
        enrichedNotifications
          .filter((n) => n.anime_id !== null)
          .map((n) => n.anime_id)
      ),
    ];

    const episodeIds = [
      ...new Set(
        enrichedNotifications
          .filter((n) => n.episode_id !== null)
          .map((n) => n.episode_id)
      ),
    ];

    // Buscar informações dos animes
    const animes = await knex("animes")
      .whereIn("id", animeIds)
      .select("id", "name", "poster_path", "backdrop_path", "banner_path");

    // Mapear informações dos animes para fácil acesso
    const animeMap = animes.reduce((acc, anime) => {
      acc[anime.id] = anime;
      return acc;
    }, {});

    // Buscar informações dos episódios
    const episodes = await knex("episodes")
      .whereIn("id", episodeIds)
      .select("id", "name", "still_path", "episode_number");

    // Mapear informações dos episódios para fácil acesso
    const episodeMap = episodes.reduce((acc, episode) => {
      acc[episode.id] = episode;
      return acc;
    }, {});

    // Adicionar as informações de anime e episódio a cada notificação
    const finalNotifications = enrichedNotifications.map((notification) => {
      const result = { ...notification };

      // Adicionar informações do anime se existir
      if (notification.anime_id && animeMap[notification.anime_id]) {
        const anime = animeMap[notification.anime_id];
        result.anime = {
          id: anime.id,
          name: anime.name,
          poster_path: anime.poster_path,
          backdrop_path: anime.backdrop_path,
          banner_path: anime.banner_path,
        };
      }

      // Adicionar informações do episódio se existir
      if (notification.episode_id && episodeMap[notification.episode_id]) {
        const episode = episodeMap[notification.episode_id];
        result.episode = {
          id: episode.id,
          name: episode.name,
          still_path: episode.still_path,
          episode_number: episode.episode_number,
        };
      }

      return result;
    });

    // Obter contagem de notificações não lidas
    const unreadCount = await countUnreadNotifications(user_id);

    return reply.status(200).send({
      message: "Notificações recuperadas com sucesso.",
      notifications: finalNotifications,
      unreadCount: unreadCount,
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

    // Obter contagem atualizada de notificações não lidas
    const unreadCount = await countUnreadNotifications(user_id);

    return reply.status(200).send({
      message: "Notificação marcada como lida com sucesso.",
      unreadCount: unreadCount,
    });
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error);
    return reply.status(500).send({
      error: "Erro ao marcar notificação como lida.",
    });
  }
}

/**
 * Marca todas as notificações do usuário como lidas
 */
async function markAllAsRead(req, reply) {
  const user_id = req.user.id;

  try {
    await markAllNotificationsAsRead(user_id);

    return reply.status(200).send({
      message: "Todas as notificações foram marcadas como lidas.",
      unreadCount: 0,
    });
  } catch (error) {
    console.error("Erro ao marcar todas notificações como lidas:", error);
    return reply.status(500).send({
      error: "Erro ao marcar todas notificações como lidas.",
    });
  }
}

/**
 * Retorna apenas a contagem de notificações não lidas
 */
async function getUnreadCount(req, reply) {
  const user_id = req.user.id;

  try {
    const count = await countUnreadNotifications(user_id);

    return reply.status(200).send({
      unreadCount: count,
    });
  } catch (error) {
    console.error("Erro ao obter contagem de notificações não lidas:", error);
    return reply.status(500).send({
      error: "Erro ao obter contagem de notificações não lidas.",
    });
  }
}

module.exports = {
  markNotificationAsRead,
  listNotifications,
  markAllAsRead,
  getUnreadCount,
};
