const knex = require("knex")(require("../knexfile").development);
const crypto = require("crypto");
const { sendEmail } = require("../utils/SendEmail");
require("dotenv").config();

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
    created_at: new Date(),
  });

  // Monta o link para redefinição de senha
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  // Conteúdo em texto simples (manter para compatibilidade)
  const text = `Você solicitou a redefinição de sua senha.\n\nClique no link para redefinir:\n${resetUrl}\n\nSe não foi você, ignore este email.\n\n${process.env.FROM_NAME}`;

  // Conteúdo HTML com logo e estilos
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redefinição de Senha</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f5f5f5;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto;">
      <!-- Cabeçalho com logo -->
      <tr>
        <td style="padding: 20px 0; text-align: center; background-color: white;">
          <img src="${
            process.env.COMPANY_LOGO ||
            "https://www.otakudiscuss.online/logo.png"
          }" alt="${
    process.env.FROM_NAME
  }" width="180" style="max-width: 180px; height: auto;">
        </td>
      </tr>
      
      <!-- Conteúdo principal -->
      <tr>
        <td style="background-color: white; padding: 30px; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <h2 style="color: #444; margin-top: 0;">Redefinição de Senha</h2>
          <p>Olá ${user.username || "nosso querido usuario"},</p>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha:</p>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: ${
    process.env.PRIMARY_COLOR || "#F97316"
  }; color: white; text-decoration: none; padding: 12px 25px; border-radius: 4px; font-weight: bold; display: inline-block;">Redefinir Minha Senha</a>
          </p>
          
          <p>Se o botão acima não funcionar, você também pode copiar e colar o link abaixo no seu navegador:</p>
          <p style="background-color: #f8f8f8; padding: 10px; border-radius: 3px; word-break: break-all;"><a href="${resetUrl}" style="color: #4A90E2; text-decoration: none;">${resetUrl}</a></p>
          
          <p>Se você não solicitou esta redefinição, por favor ignore este e-mail ou entre em contato com nosso suporte se tiver dúvidas.</p>
          <p>Este link expira em 1 hora por motivos de segurança.</p>
        </td>
      </tr>
      
      <!-- Rodapé -->
      <tr>
        <td style="padding: 20px; text-align: center; font-size: 12px; color: #888888;">
          <p>&copy; ${new Date().getFullYear()} ${
    process.env.FROM_NAME
  }. Todos os direitos reservados.</p>
          <p>Este é um e-mail automático, por favor não responda.</p>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  // Enviar o email com versão HTML e texto simples
  const subject = "Redefinição de senha";
  await sendEmail(user.email, subject, text, html);
}

module.exports = {
  processRequest,
};
