/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable('episodes', function (table) {
      table.string('site', 255);
      table.text('url');
    });
  };

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable('episodes', function (table) {
      table.dropColumn('site');
      table.dropColumn('url');
    });
  };
