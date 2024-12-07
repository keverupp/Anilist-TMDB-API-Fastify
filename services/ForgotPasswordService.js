const knex = require("knex")(require("../knexfile").development);
const crypto = require("crypto");
const { sendEmail } = require("../utils/SendEmail");
require('dotenv').config();

async function processRequest(email) {
  const user = await knex("users").where({ email }).first();

  // Se não encontrar o usuário, apenas retorne (não revelar se existe ou não)
  if (!user) {
    return;
  }

  // Gera o token de redefinição
  const resetToken = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 3600000); // 1 hora a partir de agora

  // Opcional: remover tokens anteriores do mesmo usuário
  await knex("password_resets").where({ user_id: user.id }).del();

  // Insere um novo registro na tabela password_resets
  await knex("password_resets").insert({
    user_id: user.id,
    token: resetToken,
    expires_at: expires,
    created_at: new Date()
  });

  // Monta o link para redefinição de senha
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  // Enviar o email
  const subject = "Redefinição de senha";
  const text = `Você solicitou a redefinição de sua senha.\n\nClique no link para redefinir:\n${resetUrl}\n\nSe não foi você, ignore este email.`;

  await sendEmail(user.email, subject, text);
}

module.exports = {
  processRequest
};
