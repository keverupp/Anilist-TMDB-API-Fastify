/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("tokens", (table) => {
      table.increments("id").primary(); // ID único do token
      table.integer("user_id").unsigned().notNullable(); // ID do usuário associado
      table.foreign("user_id").references("users.id").onDelete("CASCADE"); // Chave estrangeira para usuários
      table.string("token").notNullable().unique(); // Token único
      table.timestamp("expires_at").notNullable(); // Data de expiração do token
      table.timestamp("created_at").defaultTo(knex.fn.now()); // Data de criação
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.dropTable("tokens");
  };
  