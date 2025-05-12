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

    // Criar o registro de atividade - modificado para lidar com diferentes retornos do knex
    const result = await knex("activity_logs").insert({
      user_id,
      action,
      ip_address,
      created_at: new Date(),
    });

    // Obter ID de forma segura (funciona com diferentes configurações do knex)
    const logId = Array.isArray(result) ? result[0] : result;

    return reply.status(200).send({
      message: "Atividade registrada com sucesso.",
      log_id: logId,
    });
  } catch (error) {
    console.error("Erro ao registrar atividade:", error);
    return reply.status(500).send({
      error: "Erro ao registrar atividade.",
    });
  }
}

module.exports = {
  logActivity,
};
