const knex = require("knex")(require("../knexfile").development);

async function getAllAnimes(request, reply) {
    const { page = 1, limit = 10, name, status, fields } = request.query;
  
    try {
      const offset = (page - 1) * limit;
  
      // Definir campos padrão
      let selectedFields = [
        'id',
        'name',
        'overview',
        'poster_path',
        'backdrop_path',
        'first_air_date',
        'is_current_season',
        'episodes_count',
        'adult',
        'in_production',
        'homepage',
        'vote_average',
        'vote_count',
        'original_name',
        'original_language',
        'number_of_seasons',
        'number_of_episodes',
        'popularity',
        'status',
        'episode_run_time',
        'type'
      ];
  
      // Processar campos personalizados
      if (fields) {
        const requestedFields = fields.split(',');
        // Validar campos solicitados para evitar injeções ou campos inexistentes
        selectedFields = requestedFields.filter(field =>
          selectedFields.includes(field.trim())
        );
      }
  
      // Base da query
      let query = knex('animes')
        .select(selectedFields)
        .limit(limit)
        .offset(offset);
  
      // Filtro por nome
      if (name) {
        query = query.where('name', 'ilike', `%${name}%`);
      }
  
      // Filtro por status
      if (status) {
        query = query.where({ status });
      }
  
      // Obter os animes e contagem total
      const animes = await query;
      const [{ count }] = await knex('animes').count('id as count');
  
      // Retornar resposta
      reply.status(200).send({
        animes,
        pagination: {
          total: parseInt(count, 10),
          totalPages: Math.ceil(count / limit),
          currentPage: parseInt(page, 10),
          perPage: parseInt(limit, 10),
        },
      });
    } catch (error) {
      console.error('Erro ao buscar animes:', error);
      reply.status(500).send({ error: 'Erro ao buscar animes.' });
    }
  }

module.exports = { getAllAnimes };
