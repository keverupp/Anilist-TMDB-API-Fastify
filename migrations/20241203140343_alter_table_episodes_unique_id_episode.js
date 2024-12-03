/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable("episodes", (table) => {
      table.unique(["anime_id", "episode_number"]); // Adiciona restrição de unicidade
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.alterTable("episodes", (table) => {
      table.dropUnique(["anime_id", "episode_number"]); // Remove a restrição de unicidade
    });
  };
  