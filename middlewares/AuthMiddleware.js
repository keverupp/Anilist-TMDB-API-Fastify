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

    // Busca os papéis do usuário
    const roles = await knex("user_roles")
      .join("roles", "user_roles.role_id", "roles.id")
      .where("user_roles.user_id", user.id)
      .select("roles.name");

    // Busca as permissões do usuário
    const permissions = await knex("role_permissions")
      .join("permissions", "role_permissions.permission_id", "permissions.id")
      .join("user_roles", "role_permissions.role_id", "user_roles.role_id")
      .where("user_roles.user_id", user.id)
      .distinct()
      .select("permissions.name");

    // Anexa os dados do usuário, papéis e permissões na requisição
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: roles.map((role) => role.name), // Exemplo: ['admin', 'moderator']
      permissions: permissions.map((permission) => permission.name), // Exemplo: ['can_edit_comments', 'can_delete_comments']
    };

    // Fluxo segue para o handler da rota
  } catch (error) {
    console.error("Erro na autenticação:", error);
    return reply.status(401).send({ error: "Unauthorized", message: "Token inválido ou expirado" });
  }
}

/**
 * Middleware para verificar se o usuário possui uma permissão específica.
 * @param {string} permission Nome da permissão necessária.
 */
function checkPermission(permission) {
  return async (req, reply, next) => {
    if (!req.user || !req.user.permissions.includes(permission)) {
      return reply.status(403).send({ error: "Forbidden", message: "Permissão insuficiente" });
    }
    next();
  };
}

module.exports = { authenticate, checkPermission };
