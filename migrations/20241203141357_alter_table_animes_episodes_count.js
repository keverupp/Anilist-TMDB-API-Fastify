/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable("animes", (table) => {
      table.integer("episodes_count").nullable(); // Número de episódios previstos
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.alterTable("animes", (table) => {
      table.dropColumn("episodes_count"); // Remove o campo se necessário
    });
  };
  