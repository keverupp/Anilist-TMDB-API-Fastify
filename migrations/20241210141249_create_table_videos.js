exports.up = function(knex) {
    return knex.schema.createTable('videos', function(table) {
      table.increments('id').primary();
      table.integer('show_id').notNullable(); // ID da série
      table.string('name').notNullable(); // Nome do vídeo
      table.string('key').notNullable(); // Chave do vídeo
      table.string('site').notNullable(); // Site do vídeo (ex.: YouTube)
      table.integer('size').notNullable(); // Resolução (ex.: 1080)
      table.string('type').notNullable(); // Tipo do vídeo (ex.: Trailer, Clip)
      table.boolean('official').notNullable(); // Indica se é oficial
      table.timestamp('published_at').notNullable(); // Data de publicação
      table.timestamps(true, true); // created_at e updated_at
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('videos');
  };
  