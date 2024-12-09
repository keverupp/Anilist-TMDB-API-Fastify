exports.up = function (knex) {
    return knex.schema.createTable('alternative_titles', (table) => {
      table.increments('id').primary(); // ID único
      table.integer('anime_id').notNullable(); // ID do anime associado
      table.string('iso_3166_1').notNullable(); // Código do país
      table.string('title').notNullable(); // Título alternativo
      table.string('type').nullable(); // Tipo de título
      table.timestamps(true, true); // created_at, updated_at
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable('alternative_titles');
  };
  