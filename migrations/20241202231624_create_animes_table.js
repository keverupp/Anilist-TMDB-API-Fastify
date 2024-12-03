/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('animes', table => {
      table.integer('id').primary(); // ID fornecido pela API Anilist como chave primária
      table.string('title').notNullable(); // Título principal
      table.text('description').notNullable(); // Descrição traduzida
      table.string('cover_image_url').notNullable(); // URL da imagem de capa
      table.string('banner_image_url'); // URL do banner (pode ser nulo, pois nem todos os animes têm banner)
      table.date('release_date'); // Data de lançamento
      table.string('genres'); // Gêneros (separados por vírgula, ou outra estratégia)
      table.timestamps(true, true); // created_at e updated_at
    });
  };

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('animes');
  };
