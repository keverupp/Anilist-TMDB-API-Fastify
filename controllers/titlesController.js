const { findAnimeIdByAlternativeTitle} = require('../models/titleModel');
const knex = require('knex')(require('../knexfile').development);

const searchTitles = async (request, reply) => {
    try {
        const { query, fields } = request.query;

        if (!query) {
            return reply.status(400).send({ error: 'Query parameter is required' });
        }

        // Processar os campos solicitados
        let selectedFields = ['id', 'english_title', 'pt_title', 'native_title']; // Campos padrão
        if (fields) {
            selectedFields = fields.split(',').map((field) => field.trim());
        }

        // Busca anime_id na tabela "alternative_titles"
        const alternativeTitleResult = await findAnimeIdByAlternativeTitle(query);

        if (alternativeTitleResult.length === 0) {
            return reply.status(404).send({ message: 'No titles found' });
        }

        // Pega os anime_ids encontrados
        const animeIds = alternativeTitleResult.map((row) => row.anime_id);

        // Busca os títulos principais na tabela "titles" para os anime_ids encontrados
        const titles = await knex('titles')
            .whereIn('id', animeIds)
            .select(selectedFields);

        if (titles.length === 0) {
            return reply.status(404).send({ message: 'No titles found' });
        }

        return reply.send(titles);
    } catch (error) {
        console.error('Error fetching titles:', error);
        return reply.status(500).send({ error: 'An error occurred while fetching titles' });
    }
};



module.exports = {
    searchTitles,
};
