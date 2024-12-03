const axios = require('axios');
const knex = require('knex')(require('../knexfile').development);

async function searchApiRoutes(fastify, options) {
  fastify.post('/search-api', async (request, reply) => {
    const { query } = request.body;

    if (!query) {
      return reply.status(400).send({ error: 'Query parameter is required' });
    }

    try {
      // Consultando a API do Anilist
      const response = await axios.post('https://graphql.anilist.co', {
        query: `
          query ($search: String) {
            Page(perPage: 10) {
              media(search: $search, type: ANIME) {
                id
                title {
                  english
                  native
                  romaji
                }
              }
            }
          }
        `,
        variables: { search: query },
      });

      const results = response.data.data.Page.media;

      // Mapeando os resultados para salvar no banco
      const titlesToInsert = results.map((anime) => ({
        id: anime.id, // ID recebido do Anilist
        english_title: anime.title.english || 'N/A',
        native_title: anime.title.native || 'N/A',
        romanji_title: anime.title.romaji || 'N/A',
      }));

      // Salvando no banco de dados (ignorar duplicatas pelo ID)
      for (const title of titlesToInsert) {
        await knex('titles')
          .insert(title)
          .onConflict('id') // Garante que não duplicará entradas com o mesmo ID
          .ignore();
      }

      // Retornando os novos resultados
      return reply.send(titlesToInsert);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch data from Anilist' });
    }
  });
}

module.exports = searchApiRoutes;
