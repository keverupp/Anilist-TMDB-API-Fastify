const knex = require("knex")(require("../knexfile").development);

/**
 * Registra uma atividade no sistema
 */
async function logActivity(req, reply) {
  try {
    // Extrair dados do request
    const { action } = req.body;
    const user_id = req.user?.id || null; // Opcional, se o usuário estiver autenticado

    // Obter o IP do cliente
    const ip_address =
      req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // Criar o registro de atividade
    await knex("activity_logs").insert({
      user_id,
      action,
      ip_address,
      created_at: new Date(),
    });

    // Retornar apenas uma mensagem de sucesso sem o ID
    return reply.status(200).send({
      success: true,
      message: "Atividade registrada com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao registrar atividade:", error);
    return reply.status(500).send({
      success: false,
      error: "Erro ao registrar atividade.",
    });
  }
}

module.exports = {
  logActivity,
};
