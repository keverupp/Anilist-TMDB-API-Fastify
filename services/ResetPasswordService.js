const knex = require("knex")(require("../knexfile").development);
const argon2 = require("argon2"); // caso use argon2 para hash da senha

async function processReset(token, newPassword) {
  // Busca o registro na tabela password_resets
  const resetRecord = await knex("password_resets").where({ token }).first();

  // Verifica se o token existe e não expirou
  if (!resetRecord || new Date(resetRecord.expires_at) < new Date()) {
    throw new Error("Token inválido ou expirado");
  }

  const hashedPassword = await argon2.hash(newPassword);

  // Atualiza a senha do usuário
  await knex("users")
    .where({ id: resetRecord.user_id })
    .update({ password: hashedPassword });

  // Remove o registro de password_resets para evitar reutilização do token
  await knex("password_resets").where({ id: resetRecord.id }).del();
}

module.exports = {
  processReset
};
