require("dotenv").config();
const nodemailer = require("nodemailer");

async function sendEmail(to, subject, text, html = null) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Configuração básica do email
  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to,
    subject,
    text,
  };

  // Adiciona o conteúdo HTML se fornecido
  if (html) {
    mailOptions.html = html;
  }

  // Envia o email
  await transporter.sendMail(mailOptions);
}

module.exports = {
  sendEmail,
};
