/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable("genres", (table) => {
      table.string("name_en").notNullable().defaultTo(""); // Nome do gênero em inglês
      table.string("name_pt").notNullable().defaultTo(""); // Nome do gênero em português
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.alterTable("genres", (table) => {
      table.dropColumn("name_en");
      table.dropColumn("name_pt");
    });
  };
  