const { verifyToken, findUserById } = require("../services/AuthService");
const knex = require("knex")(require("../knexfile").development);

async function authenticate(req, reply) {
  try {
    const authHeader = req.headers.authorization;

    // Verifica se o cabeçalho Authorization existe
    if (!authHeader) {
      return reply.status(401).send({ error: "Unauthorized", message: "Token ausente" });
    }

    // Extrai o token do cabeçalho
    const token = authHeader.split(" ")[1];
    if (!token) {
      return reply.status(401).send({ error: "Unauthorized", message: "Token inválido" });
    }

    // Verifica o token no banco de dados
    const tokenEntry = await knex("tokens")
      .where({ token })
      .andWhere("expires_at", ">", new Date())
      .first();

    if (!tokenEntry) {
      return reply.status(401).send({ error: "Unauthorized", message: "Token inválido ou expirado" });
    }

    // Decodifica o token JWT
    const decoded = await verifyToken(token);

    // Busca o usuário no banco
    const user = await findUserById(decoded.id);

    if (!user) {
      return reply.status(401).send({ error: "Unauthorized", message: "Usuário não encontrado" });
    }

    // Anexa os dados do usuário na requisição
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    // Se chegou até aqui, está autenticado. A função async acaba aqui,
    // e o fluxo segue para o handler da rota.
  } catch (error) {
    console.error("Erro na autenticação:", error);
    return reply.status(401).send({ error: "Unauthorized", message: "Token inválido ou expirado" });
  }
}

module.exports = { authenticate };
