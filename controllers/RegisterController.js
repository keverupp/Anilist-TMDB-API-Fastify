const argon2 = require("argon2");
const knex = require("knex")(require("../knexfile").development);

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

    // Hash da senha
    const hashedPassword = await argon2.hash(password);

    // Criar o usuário
    const [newUserId] = await knex("users")
      .insert({
        username,
        email,
        password: hashedPassword,
        created_at: new Date(),
      })
      .returning("id");
      const userId = newUserId.id || newUserId;

    // Criar preferências padrão para o usuário
    await knex("user_preferences").insert({
      user_id: userId,
      notify_replies: true,
      notify_reactions: true,
      notify_new_comments: false,
      notify_new_episodes: true,
    });

    // Retornar sucesso
    return reply.status(201).send({
      message: "Usuário registrado com sucesso.",
      user: {
        id: newUserId,
        username,
        email,
      },
    });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return reply.status(500).send({
      error: "Erro interno do servidor.",
      details: error.message,
    });
  }
}

module.exports = { register };
