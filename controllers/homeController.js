const knex = require("knex")(require("../knexfile").development);

async function listReturningSeries(request, reply) {
  try {
    // Extrair limit, fields e page dos parâmetros da requisição
    const { limit = 10, page = 1, fields } = request.query;

    // Definir as colunas padrão caso fields não seja fornecido
    const defaultFields = ['id', 'name', 'original_name', 'overview', 'poster_path', 'banner_path', 'backdrop_path'];
    const selectedFields = fields ? fields.split(',') : defaultFields;

    // Calcular offset para a paginação
    const parsedLimit = Math.max(Number(limit), 1); // Garantir que o limite seja pelo menos 1
    const parsedPage = Math.max(Number(page), 1); // Garantir que a página seja pelo menos 1
    const offset = (parsedPage - 1) * parsedLimit;

    // Construir a query com limit, offset e fields
    const returningSeriesQuery = knex('animes')
      .where('status', 'Returning Series')
      .select(selectedFields)
      .limit(parsedLimit)
      .offset(offset);

    // Executar a query
    const returningSeries = await returningSeriesQuery;

    // Retornar a lista de animes
    return reply.status(200).send({ 
      data: returningSeries,
      meta: {
        limit: parsedLimit,
        page: parsedPage,
        count: returningSeries.length // Número de itens retornados
      }
    });
  } catch (error) {
    console.error('Erro ao listar animes:', error);
    return reply.status(500).send({ error: 'Erro ao listar animes.' });
  }
}

module.exports = { listReturningSeries };
