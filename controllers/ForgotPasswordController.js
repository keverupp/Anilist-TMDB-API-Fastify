const forgotPasswordService = require('../services/ForgotPasswordService');

async function handleForgotPassword(req, reply) {
  const { email } = req.body;

  if (!email) {
    return reply.status(400).send({
      error: "Bad Request",
      message: "O campo email é obrigatório.",
    });
  }

  try {
    await forgotPasswordService.processRequest(email);
    return reply.status(200).send({
      message: "Se este email estiver cadastrado, um email de redefinição será enviado."
    });
  } catch (error) {
    console.error("Erro ao processar forgotPassword:", error);
    return reply.status(500).send({ 
      error: "Erro interno", 
      message: "Erro interno ao processar o pedido de redefinição de senha." 
    });
  }
}

module.exports = {
  handleForgotPassword
};
