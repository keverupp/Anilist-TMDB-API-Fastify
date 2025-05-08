const argon2 = require("argon2");
const knex = require("knex")(require("../knexfile").development);

// Função para gerar um ID aleatório de 6 dígitos único
async function generateUniqueUserId() {
  let uniqueId;
  let exists = true;

  while (exists) {
    uniqueId = Math.floor(100000 + Math.random() * 900000); // Gera um número aleatório de 6 dígitos
    const user = await knex("users").where({ id: uniqueId }).first();
    exists = !!user; // Se já existir, continua gerando
  }

  return uniqueId;
}

async function register(req, reply) {
  try {
    const { username, email, password } = req.body;

    // Validações
    if (!username || username.length < 3) {
      return reply
        .status(400)
        .send({ error: "O username deve ter ao menos 3 caracteres." });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return reply.status(400).send({ error: "O email fornecido é inválido." });
    }
    if (!password || password.length < 8) {
      return reply
        .status(400)
        .send({ error: "A senha deve ter no mínimo 8 caracteres." });
    }

    // Verificar se o e-mail já está em uso
    const existingUser = await knex("users").where({ email }).first();
    if (existingUser) {
      return reply.status(400).send({ error: "O email já está em uso." });
    }

    // Gerar um ID aleatório único
    const userId = await generateUniqueUserId();

    // Hash da senha
    const hashedPassword = await argon2.hash(password);

    // Iniciar uma transação para garantir consistência
    const newUser = await knex.transaction(async (trx) => {
      // Criar o usuário com ID aleatório
      await trx("users").insert({
        id: userId,
        username,
        email,
        password: hashedPassword,
        created_at: new Date(),
      });

      // Verificar se o papel padrão 'user' existe
      const role = await trx("roles").where({ name: "user" }).first();
      if (!role) {
        throw new Error(
          "Papel padrão 'user' não configurado no banco de dados."
        );
      }

      // Atribuir o papel padrão ao usuário
      await trx("user_roles").insert({
        user_id: userId,
        role_id: role.id,
      });

      // Criar preferências padrão para o usuário
      await trx("user_preferences").insert({
        user_id: userId,
        notify_replies: true,
        notify_reactions: true,
        notify_new_comments: false,
        notify_new_episodes: true,
      });

      return {
        id: userId,
        username,
        email,
      };
    });

    // Retornar sucesso
    return reply.status(201).send({
      message: "Usuário registrado com sucesso.",
      user: newUser,
    });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return reply.status(500).send({
      error: "Erro interno do servidor.",
      details: error.message,
    });
  }
}

module.exports = { register, generateUniqueUserId };
