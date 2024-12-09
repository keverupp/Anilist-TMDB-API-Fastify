/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema.createTable('seasons', (table) => {
      table.increments('id').primary(); // Chave primária
      table.string('name', 255).notNullable(); // Nome da temporada
      table.string('season', 50).nullable(); // Nome da estação (ex.: Spring, Summer)
      table.integer('year').notNullable(); // Ano da temporada
      table.date('air_date').nullable(); // Data de estreia da temporada
      table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now()); // Timestamp de criação
      table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now()); // Timestamp de atualização
    });
  };
  
  exports.down = async function(knex) {
    await knex.schema.dropTable('seasons');
  };
  