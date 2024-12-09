exports.up = async function(knex) {
    await knex.schema.alterTable('animes', (table) => {
      // Ajustes nas colunas existentes
      table.renameColumn('title', 'name'); // Renomeia a coluna "title" para "name"
      table.renameColumn('cover_image_url', 'poster_path'); // Renomeia "cover_image_url" para "poster_path"
      table.renameColumn('banner_image_url', 'backdrop_path'); // Renomeia "banner_image_url" para "backdrop_path"
      table.renameColumn('release_date', 'first_air_date'); // Renomeia "release_date" para "first_air_date"
      table.renameColumn('description', 'overview'); // Renomeia "description" para "overview"
  
      // Adiciona novas colunas
      table.string('original_name', 255).nullable(); // Nome original (em japonês)
      table.string('original_language', 10).nullable(); // Idioma original
      table.integer('number_of_seasons').nullable(); // Número de temporadas
      table.integer('number_of_episodes').nullable(); // Número de episódios
      table.float('popularity').defaultTo(0).notNullable(); // Popularidade
      table.string('status', 50).nullable(); // Status (Returning Series, Ended, etc.)
      table.integer('episode_run_time').nullable(); // Tempo médio dos episódios
      table.string('type', 50).nullable(); // Tipo do programa (Scripted, etc.)
    });
  
    // Remoção de colunas redundantes ou transferidas para tabelas relacionadas
    await knex.schema.alterTable('animes', (table) => {
      table.dropColumn('genres'); // Gêneros serão geridos por uma tabela intermediária
      table.dropColumn('season'); // Temporadas serão geridas por uma tabela separada
      table.dropColumn('season_year'); // Ano será gerido nas temporadas
    });
  };
  
  exports.down = async function(knex) {
    await knex.schema.alterTable('animes', (table) => {
      // Reverte as alterações nas colunas
      table.renameColumn('name', 'title');
      table.renameColumn('poster_path', 'cover_image_url');
      table.renameColumn('backdrop_path', 'banner_image_url');
      table.renameColumn('first_air_date', 'release_date');
      table.renameColumn('overview', 'description');
  
      // Remove as colunas adicionadas
      table.dropColumn('original_name');
      table.dropColumn('original_language');
      table.dropColumn('number_of_seasons');
      table.dropColumn('number_of_episodes');
      table.dropColumn('popularity');
      table.dropColumn('status');
      table.dropColumn('episode_run_time');
      table.dropColumn('type');
  
      // Re-adiciona as colunas removidas
      table.string('genres', 255).nullable();
      table.string('season', 255).nullable();
      table.integer('season_year').nullable();
    });
  };
  