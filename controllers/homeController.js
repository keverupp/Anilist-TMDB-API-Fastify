const knex = require("knex")(require("../knexfile").development);

async function listReturningSeries(request, reply) {
  try {
    // Buscar animes com status "Returning Series"
    const returningSeries = await knex('animes')
      .where('status', 'Returning Series')
      .select('id', 'name', 'overview', 'banner_path');

    // Retornar a lista de animes
    return reply.status(200).send({ data: returningSeries });
  } catch (error) {
    console.error('Erro ao listar animes:', error);
    return reply.status(500).send({ error: 'Erro ao listar animes.' });
  }
}

module.exports = { listReturningSeries };
