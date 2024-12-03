const knex = require('knex')(require('../knexfile').development);

async function searchRoutes(fastify, options) {
  fastify.get('/search', async (request, reply) => {
    const { query } = request.query;

    if (!query) {
      return reply.status(400).send({ error: 'Query parameter is required' });
    }

    try {
      const results = await knex('titles')
        .select('id', 'english_title', 'native_title', 'romanji_title')
        .where('english_title', 'ilike', `%${query}%`)
        .orWhere('native_title', 'ilike', `%${query}%`)
        .orWhere('romanji_title', 'ilike', `%${query}%`);

      return reply.send(results);
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
}

module.exports = searchRoutes;
