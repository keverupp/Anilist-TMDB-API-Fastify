const {
    listNotifications,
    markNotificationAsRead,
  } = require("../controllers/NotificationsController");
  const { authenticate } = require("../middlewares/AuthMiddleware");
  
  async function notificationsRoutes(fastify, options) {
    // Rota para listar notificações do usuário
    fastify.get("/notifications", { preHandler: authenticate }, listNotifications);
  
    // Rota para marcar uma notificação como lida
    fastify.put("/notifications/:id/read", { preHandler: authenticate }, markNotificationAsRead);
  }
  
  module.exports = notificationsRoutes;
  