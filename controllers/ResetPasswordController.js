const resetPasswordService = require('../services/ResetPasswordService');

async function handleResetPassword(req, reply) {
  const { token, new_password } = req.body;

  if (!token || !new_password) {
    return reply.status(400).send({
      error: "Bad Request",
      message: "Token e nova senha são obrigatórios."
    });
  }

  try {
    await resetPasswordService.processReset(token, new_password);
    return reply.status(200).send({ message: "Senha redefinida com sucesso." });
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    return reply.status(500).send({ 
      error: "Erro interno",
      message: "Não foi possível redefinir a senha."
    });
  }
}

module.exports = {
  handleResetPassword
};
