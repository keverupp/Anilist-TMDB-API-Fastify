const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const knex = require("knex")(require("../knexfile").development);

const JWT_SECRET = process.env.JWT_SECRET;

async function login(req, reply) {
  try {
    const { email, password, rememberMe } = req.body;

    const user = await knex("users").where({ email }).first();
    if (!user) {
      return reply
        .status(401)
        .send({
          error: "Invalid credentials",
          message: "Usuário ou senha inválidos.",
        });
    }

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return reply
        .status(401)
        .send({
          error: "Invalid credentials",
          message: "Usuário ou senha inválidos.",
        });
    }

    // Define validade do token baseado em rememberMe
    const daysValid = rememberMe ? 30 : 3;
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: `${daysValid}d`,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + daysValid);

    await knex("tokens").insert({
      user_id: user.id,
      token: token,
      expires_at: expiresAt,
      created_at: new Date(),
    });

    return reply.status(200).send({
      message: "Login realizado com sucesso.",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({
      error: "Erro ao realizar login.",
      details: error.message,
    });
  }
}

async function logout(req, reply) {
  try {
    const { token } = req.body;

    if (!token) {
      return reply.status(400).send({ error: "Token ausente" });
    }

    // Remover o token da tabela
    await knex("tokens").where({ token }).del();

    return reply.status(200).send({ message: "Logout efetuado com sucesso." });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({
      error: "Erro ao realizar logout.",
      details: error.message,
    });
  }
}

async function refreshToken(req, reply) {
  try {
    const { token } = req.body;

    if (!token) {
      return reply.status(400).send({ error: "Token ausente" });
    }

    // Verificar se o token existe no banco e não expirou
    const tokenEntry = await knex("tokens")
      .where({ token })
      .andWhere("expires_at", ">", new Date())
      .first();

    if (!tokenEntry) {
      return reply.status(401).send({ error: "Token inválido ou expirado." });
    }

    // Gerar um novo token
    const decoded = jwt.verify(token, JWT_SECRET);
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Atualizar o token no banco
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    await knex("tokens").where({ token }).update({
      token: newToken,
      expires_at: newExpiresAt,
      created_at: new Date(),
    });

    return reply.status(200).send({
      message: "Token renovado com sucesso.",
      token: newToken,
    });
  } catch (error) {
    console.error(error);
    return reply.status(401).send({
      error: "Token inválido ou expirado.",
      details: error.message,
    });
  }
}

module.exports = { login, logout, refreshToken };
