/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('titles', (table) => {
      table.integer('id').primary();
      table.string('english_title').notNullable();
      table.string('native_title').notNullable();
      table.string('romanji_title').notNullable();
      table.timestamps(true, true);
    });
  };

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('titles');
  };
