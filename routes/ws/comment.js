// routes/ws/comments.js
const { subscribeToComments } = require("../../controllers/CommentsController");

module.exports = async function (fastify) {
  fastify.get(
    "/comments/:animeId",
    { websocket: true },
    (ws /* WebSocket */, req) => {
      const { animeId } = req.params;
      const episodeId = req.query.episode_id || null;

      // subscribeToComments retorna uma função para remover o listener
      const unsubscribe = subscribeToComments(
        animeId,
        episodeId,
        (newComment) => {
          // envia via WebSocket
          ws.send(JSON.stringify(newComment));
        }
      );

      // trate o fechamento da conexão
      ws.on("close", unsubscribe);

      // opcional: trate erros na conexão
      ws.on("error", (err) => {
        console.error("WebSocket error:", err);
        unsubscribe();
      });
    }
  );
};
