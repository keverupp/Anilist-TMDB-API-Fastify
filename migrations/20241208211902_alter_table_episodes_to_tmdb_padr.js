exports.up = async function(knex) {
    await knex.schema.alterTable('episodes', (table) => {
      // Ajustes nas colunas existentes
      table.renameColumn('title_english', 'name'); // Renomeia "title_english" para "name"
      table.renameColumn('title_translated', 'overview'); // Renomeia "title_translated" para "overview"
      table.renameColumn('image_url', 'still_path'); // Renomeia "image_url" para "still_path"
      table.renameColumn('site', 'production_code'); // Renomeia "site" para "production_code"
  
      // Adiciona novas colunas
      table.date('air_date').nullable(); // Data de exibição
      table.float('vote_average').defaultTo(0).notNullable(); // Média de votos
      table.integer('vote_count').defaultTo(0).notNullable(); // Contagem de votos
      table.integer('season_number').nullable(); // Número da temporada
      table.string('episode_type', 50).nullable(); // Tipo de episódio (normal, finale, etc.)
      table.integer('runtime').nullable(); // Duração do episódio em minutos
  
      // Ajusta a relação com a tabela "animes"
      table.foreign('anime_id').references('id').inTable('animes').onDelete('CASCADE');
    });
  };
  
  exports.down = async function(knex) {
    await knex.schema.alterTable('episodes', (table) => {
      // Reverte as alterações nas colunas existentes
      table.renameColumn('name', 'title_english');
      table.renameColumn('overview', 'title_translated');
      table.renameColumn('still_path', 'image_url');
      table.renameColumn('production_code', 'site');
  
      // Remove as colunas adicionadas
      table.dropColumn('air_date');
      table.dropColumn('vote_average');
      table.dropColumn('vote_count');
      table.dropColumn('season_number');
      table.dropColumn('episode_type');
      table.dropColumn('runtime');
  
      // Remove a chave estrangeira
      table.dropForeign('anime_id');
    });
  };
  