/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('episodes', (table) => {
      table.increments('id').primary(); // Chave primária
      table.integer('anime_id').notNullable(); // ID do anime
      table.integer('episode_number').notNullable(); // Número do episódio
      table.string('title_english', 255).notNullable(); // Título em inglês ou original
      table.string('title_translated', 255).notNullable(); // Título traduzido para português
      table.string('image_url', 255).notNullable(); // URL da imagem do episódio
      table.timestamp('created_at').defaultTo(knex.fn.now()); // Data de criação
    });
  };

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('episodes');
  };
