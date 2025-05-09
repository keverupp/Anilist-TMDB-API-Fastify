// routes/ws/notifications.js
const {
  subscribeToNotifications,
} = require("../../services/NotificationService");

module.exports = async function (fastify) {
  fastify.get(
    "/notifications/:userId",
    { websocket: true },
    (ws /* WebSocket */, req) => {
      const { userId } = req.params;

      console.log(`Usuário ${userId} conectado ao websocket de notificações`);

      // Subscrever o usuário às notificações
      const unsubscribe = subscribeToNotifications(userId, (notification) => {
        // envia via WebSocket
        ws.send(JSON.stringify(notification));
      });

      // trate o fechamento da conexão
      ws.on("close", () => {
        console.log(
          `Usuário ${userId} desconectado do websocket de notificações`
        );
        unsubscribe();
      });

      // opcional: trate erros na conexão
      ws.on("error", (err) => {
        console.error(`Erro no WebSocket de notificações: ${err}`);
        unsubscribe();
      });

      // Enviar confirmação de conexão bem-sucedida
      ws.send(
        JSON.stringify({
          status: "connected",
          message: "Conectado ao serviço de notificações",
        })
      );
    }
  );
};
