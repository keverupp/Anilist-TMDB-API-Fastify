const UserModel = require("../models/userModel");
const knex = require("knex")(require("../knexfile").development);
const argon2 = require("argon2"); // caso use argon2 para hash da senha

const getUser = async (id, fields) => {
  const defaultFields = ["id", "username", "avatar"];
  const selectedFields = fields ? fields.split(",") : defaultFields;

  // Chama o modelo para buscar no banco de dados
  const user = await UserModel.findUserById(id, selectedFields);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

const getSensitiveUserInfo = async (id, currentUserId) => {
  // Converta ambos os valores para inteiros
  const requestedId = parseInt(id, 10);
  const authenticatedId = parseInt(currentUserId, 10);

  if (requestedId !== authenticatedId) {
    throw new Error("Você não tem permissão para acessar estas informações.");
  }

  const user = await UserModel.findUserById(requestedId, ["email", "password"]);
  if (!user) {
    throw new Error("Usuário não encontrado.");
  }

  return user;
};

const updateUser = async (userId, updates) => {
  // Valida se há algo para atualizar
  if (!updates.username) {
    throw new Error("Nenhuma informação válida fornecida para atualização.");
  }

  // Atualiza no banco de dados
  const updatedUser = await UserModel.updateUser(userId, updates);

  if (!updatedUser) {
    throw new Error("Usuário não encontrado ou atualização falhou.");
  }

  return updatedUser;
};

const getUserById = async (userId) => {
  return knex("users").where({ id: userId }).first();
};

const changePassword = async (userId, currentPassword, newPassword) => {
  // Validação de entrada
  if (!currentPassword || !newPassword) {
    throw new Error("Ambos os campos 'currentPassword' e 'newPassword' são obrigatórios.");
  }
  if (newPassword.length < 6) {
    throw new Error("A nova senha deve ter pelo menos 6 caracteres.");
  }

  // Busca o usuário no banco de dados
  const user = await UserModel.getUserById(userId);
  if (!user) {
    throw new Error("Usuário não encontrado.");
  }

  // Verifica se a senha atual está correta
  const isPasswordValid = await argon2.verify(user.password, currentPassword);
  if (!isPasswordValid) {
    throw new Error("Senha atual está incorreta.");
  }

  // Gera o hash para a nova senha
  const hashedPassword = await argon2.hash(newPassword);

  // Atualiza a senha no banco de dados
  const updated = await UserModel.updatePassword(userId, hashedPassword);
  if (!updated) {
    throw new Error("Erro ao atualizar a senha.");
  }

  return true;
};

async function getUserPreferences(req, reply) {
  const user_id = req.user.id;

  try {
    // Busca as preferências do usuário
    const preferences = await knex("user_preferences").where({ user_id }).first();

    if (!preferences) {
      return reply.status(404).send({
        error: "Not Found",
        message: "Preferências do usuário não encontradas.",
      });
    }

    return reply.status(200).send({
      message: "Preferências do usuário recuperadas com sucesso.",
      preferences,
    });
  } catch (error) {
    console.error("Erro ao listar preferências do usuário:", error);
    return reply.status(500).send({
      error: "Erro ao listar preferências do usuário.",
    });
  }
};

async function updateUserPreferences(req, reply) {
  const user_id = req.user.id;
  const { notify_replies, notify_reactions, notify_new_comments, notify_new_episodes } = req.body;

  try {
    // Atualiza as preferências do usuário
    const updated = await knex("user_preferences")
      .where({ user_id })
      .update({
        notify_replies: notify_replies !== undefined ? notify_replies : knex.raw("notify_replies"),
        notify_reactions: notify_reactions !== undefined ? notify_reactions : knex.raw("notify_reactions"),
        notify_new_comments: notify_new_comments !== undefined ? notify_new_comments : knex.raw("notify_new_comments"),
        notify_new_episodes: notify_new_episodes !== undefined ? notify_new_episodes : knex.raw("notify_new_episodes"),
      });

    if (!updated) {
      return reply.status(404).send({
        error: "Not Found",
        message: "Preferências do usuário não encontradas.",
      });
    }

    return reply.status(200).send({
      message: "Preferências do usuário atualizadas com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao atualizar preferências do usuário:", error);
    return reply.status(500).send({
      error: "Erro ao atualizar preferências do usuário.",
    });
  }
};


module.exports = {
  getUser,
  getSensitiveUserInfo,
  updateUser,
  getUserById,
  changePassword,
};
