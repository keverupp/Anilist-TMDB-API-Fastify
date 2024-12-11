const { createComment, getComments, deleteComment } = require("../controllers/CommentsController");
const { authenticate } = require("../middlewares/AuthMiddleware");

async function commentRoutes(fastify, options) {
    // Rota para criar um comentário (protegida pelo AuthMiddleware)
    fastify.post("/comments", { preHandler: authenticate }, createComment);

    // Rota para criar uma resposta a um comentário específico (protegida pelo AuthMiddleware)
    fastify.post("/comments/:id", { preHandler: authenticate }, createComment);
  
    // Rota para listar comentários
    fastify.get("/comments", getComments);
    
    // Rota para excluir comentários (protegida pelo AuthMiddleware)
    fastify.delete("/comments/:id", { preHandler: authenticate }, deleteComment);
  }

module.exports = commentRoutes;
