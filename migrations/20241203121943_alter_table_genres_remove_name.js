/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable("genres", (table) => {
      table.dropColumn("name"); // Remove a coluna antiga "name"
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.alterTable("genres", (table) => {
      table.string("name").notNullable(); // Recria a coluna caso precise reverter
    });
  };
  