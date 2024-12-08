const userController = require("../controllers/userController");
const { authenticate } = require("../middlewares/AuthMiddleware");
const argon2 = require("argon2"); // caso use argon2 para hash da senha

module.exports = async (fastify) => {
  // Rota pública para buscar informações gerais do usuário
  fastify.get("/user/:id", async (request, reply) => {
    const { id } = request.params;
    const { fields } = request.query;

    try {
      const user = await userController.getUser(id, fields);
      return reply.send(user);
    } catch (error) {
      return reply.status(404).send({ error: error.message });
    }
  });

  // Rota autenticada para informações sensíveis (e-mail e senha)
  fastify.get(
    "/user/:id/sensitive",
    { preHandler: authenticate },
    async (request, reply) => {
      const { id } = request.params; // ID do usuário solicitado
      const currentUserId = request.user.id; // ID do usuário autenticado (do token)

      try {
        // Chama o controlador e passa os IDs
        const user = await userController.getSensitiveUserInfo(
          id,
          currentUserId
        );
        return reply.send(user);
      } catch (error) {
        return reply.status(403).send({ error: error.message });
      }
    }
  );

  fastify.put(
    "/user",
    { preHandler: authenticate },
    async (request, reply) => {
      const userId = request.user.id; // ID do usuário autenticado
      const { username } = request.body; // Dados enviados pelo cliente
  
      try {
        // Atualiza as informações no banco
        const updatedUser = await userController.updateUser(userId, {
          username,
        });
  
        return reply.send({ message: "Informações atualizadas com sucesso!", updatedUser });
      } catch (error) {
        console.error("Erro ao atualizar informações do usuário:", error);
        return reply.status(500).send({ error: error.message });
      }
    }
  );

  fastify.put(
    "/user/password",
    { preHandler: authenticate },
    async (request, reply) => {
      const userId = request.user.id; // ID do usuário autenticado
      const { currentPassword, newPassword } = request.body;
  
      try {
        // Chama o controlador para alterar a senha
        await userController.changePassword(userId, currentPassword, newPassword);
        return reply.send({ message: "Senha alterada com sucesso!" });
      } catch (error) {
        console.error("Erro ao alterar senha:", error.message || error);
        return reply.status(400).send({ error: error.message });
      }
    }
  );
 
};


