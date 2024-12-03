/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable("genres", (table) => {
      table.unique("name_en"); // Adiciona restrição de unicidade à coluna name_en
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.alterTable("genres", (table) => {
      table.dropUnique("name_en"); // Remove a restrição de unicidade caso necessário
    });
  };
  