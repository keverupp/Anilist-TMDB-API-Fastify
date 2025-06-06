const {
  createComment,
  getComments,
  deleteComment,
  editComment,
} = require("../controllers/CommentsController");
const {
  authenticate,
  authenticateOptional,
} = require("../middlewares/AuthMiddleware");

async function commentRoutes(fastify, options) {
  // Rota para criar um comentário (protegida pelo AuthMiddleware)
  fastify.post("/comments", { preHandler: authenticate }, createComment);

  // Rota para criar uma resposta a um comentário específico (protegida pelo AuthMiddleware)
  fastify.post("/comments/:id", { preHandler: authenticate }, createComment);

  // Rota para listar comentários
  fastify.get("/comments", { preHandler: authenticateOptional }, getComments);

  // Rota para excluir comentários (protegida pelo AuthMiddleware)
  fastify.delete("/comments/:id", { preHandler: authenticate }, deleteComment);

  // Rota para editar um comentário (protegida pelo AuthMiddleware)
  fastify.put("/comments/:id", { preHandler: authenticate }, editComment);
}

module.exports = commentRoutes;
