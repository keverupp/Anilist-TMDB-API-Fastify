// routes/NotificationsRoutes.js
const {
  listNotifications,
  markNotificationAsRead,
  markAllAsRead,
  getUnreadCount,
} = require("../controllers/NotificationsController");
const { authenticate } = require("../middlewares/AuthMiddleware");

async function notificationsRoutes(fastify, options) {
  // Rota para listar notificações do usuário
  fastify.get(
    "/notifications",
    { preHandler: authenticate },
    listNotifications
  );

  // Rota para marcar uma notificação como lida
  fastify.put(
    "/notifications/:id/read",
    { preHandler: authenticate },
    markNotificationAsRead
  );

  // Rota para marcar todas as notificações como lidas
  fastify.post(
    "/notifications/mark-all-read",
    { preHandler: authenticate },
    markAllAsRead
  );

  // Rota para obter contagem de notificações não lidas
  fastify.get(
    "/notifications/unread-count",
    { preHandler: authenticate },
    getUnreadCount
  );
}

module.exports = notificationsRoutes;
