const knex = require("knex")(require("../knexfile").development);

const findUserById = async (id, fields) => {
  const allowedFields = ['id', 'username', 'avatar', 'photo']; // Campos permitidos
  const safeFields = fields.filter(field => allowedFields.includes(field));

  return knex('users')
    .select(safeFields)
    .where({ id })
    .first();
};

const findUserByIdSense = async (id, fields) => {
  console.log("Consultando banco com ID:", id, "e campos:", fields);

  const user = await knex('users')
    .select(fields)
    .where({ id })
    .first();

  console.log("Usuário encontrado:", user);
  return user;
};


const updateAvatar = async (userId, avatarUrl) => {
  if (!avatarUrl || typeof avatarUrl !== 'string') {
    throw new Error('URL do avatar é inválido ou está vazio.');
  }

  return knex('users')
    .where({ id: userId })
    .update({ avatar: avatarUrl });
};

const updateUser = async (userId, updates) => {
  const fieldsToUpdate = {};

  // Monta os campos para atualizar
  if (updates.username) fieldsToUpdate.username = updates.username;

  // Garante que há algo para atualizar
  if (Object.keys(fieldsToUpdate).length === 0) {
    throw new Error("Nenhum campo para atualizar.");
  }

  // Atualiza o banco de dados
  const [updatedUser] = await knex("users")
    .where({ id: userId })
    .update(fieldsToUpdate)
    .returning(["id", "username", "avatar"]);

  return updatedUser;
};

const getUserById = async (userId) => {
  return knex("users").where({ id: userId }).first();
};

const updatePassword = async (userId, hashedPassword) => {
  const updatedRows = await knex("users")
    .where({ id: userId })
    .update({ password: hashedPassword });
  return updatedRows > 0; // Retorna true se a atualização foi bem-sucedida
};


module.exports = {
  findUserById,
  findUserByIdSense,
  updateAvatar,
  updateUser,
  updatePassword,
  getUserById,
};
