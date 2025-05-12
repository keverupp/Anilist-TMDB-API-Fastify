const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const knex = require("knex")(require("../knexfile").development);
const { jwtDecode } = require("jwt-decode");

const JWT_SECRET = process.env.JWT_SECRET;

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

async function login(req, reply) {
  try {
    const { email, password, rememberMe } = req.body;

    // Traga também a coluna password (sem retorná-la ao cliente!)
    const user = await knex("users")
      .select("id", "username", "email", "avatar", "password")
      .where({ email })
      .first();

    if (!user) {
      return reply.status(401).send({
        error: "Invalid credentials",
        message: "Usuário ou senha inválidos.",
      });
    }

    // Agora 'user.password' existe, e argon2.verify() funciona
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return reply.status(401).send({
        error: "Invalid credentials",
        message: "Usuário ou senha inválidos.",
      });
    }

    // resto do código inalterado...
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
        avatar: user.avatar,
        role: "user",
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

async function googleLogin(req, reply) {
  try {
    const { credential } = req.body;

    if (!credential) {
      return reply.status(400).send({
        error: "Credencial do Google ausente",
        message: "A credencial do Google não foi fornecida.",
      });
    }

    // Verificar se JWT_SECRET está definido
    if (!JWT_SECRET) {
      process.env.JWT_SECRET = "chave_temporaria_apenas_para_desenvolvimento";
      const JWT_SECRET = process.env.JWT_SECRET;
    }

    // Decodificar o token JWT
    const decodedToken = jwt.decode(credential);

    // Extrair informações do usuário
    const {
      email,
      name,
      given_name: firstName,
      family_name: lastName,
      picture: avatar,
      email_verified,
    } = decodedToken;

    // Verificar se o email está verificado
    if (!email_verified) {
      return reply.status(401).send({
        error: "Email não verificado",
        message: "O email associado à conta Google não está verificado.",
      });
    }

    // Verificar se o usuário já existe - usar ILIKE para pesquisa case insensitive
    let user = await knex("users")
      .select("id", "username", "email", "avatar")
      .whereRaw("LOWER(email) = LOWER(?)", [email])
      .first();

    if (user) {
      // Atualizar o avatar se necessário
      if (avatar && (!user.avatar || user.avatar !== avatar)) {
        await knex("users").where({ id: user.id }).update({ avatar: avatar });

        // Atualizar o objeto user para o restante da função
        user.avatar = avatar;
      }
    } else {
      // Gerar um ID aleatório único
      const userId = await generateUniqueUserId();

      // Criar nome de usuário baseado no email
      const username = email.split("@")[0];

      // Gerar uma senha aleatória forte (o usuário nunca precisará dela)
      const randomPassword =
        Math.random().toString(36).slice(-10) +
        Math.random().toString(36).slice(-10) +
        Math.random().toString(36).slice(-10);
      const hashedPassword = await argon2.hash(randomPassword);

      // Iniciar uma transação para garantir consistência
      await knex.transaction(async (trx) => {
        // Criar o usuário com ID aleatório e senha aleatória
        await trx("users").insert({
          id: userId,
          username,
          email,
          password: hashedPassword,
          avatar: avatar || null,
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
      });

      // Armazenar os dados do usuário recém-criado
      user = {
        id: userId,
        username,
        email,
        avatar: avatar || null,
      };
    }

    // Garantir que JWT_SECRET está definido
    const secretKey =
      JWT_SECRET || "chave_temporaria_apenas_para_desenvolvimento";

    // Criar token JWT (para usuário existente ou recém-criado)
    const daysValid = 30;
    const token = jwt.sign({ id: user.id, email: user.email }, secretKey, {
      expiresIn: `${daysValid}d`,
    });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + daysValid);

    // Salvar token no banco
    await knex("tokens").insert({
      user_id: user.id,
      token: token,
      expires_at: expiresAt,
      created_at: new Date(),
    });

    return reply.status(200).send({
      message: "Login com Google realizado com sucesso.",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    return reply.status(500).send({
      error: "Erro ao realizar login com Google.",
      details: error.message,
    });
  }
}

module.exports = {
  login,
  logout,
  refreshToken,
  googleLogin,
  generateUniqueUserId,
};
