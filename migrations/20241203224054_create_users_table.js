/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("users", (table) => {
      table.increments("id").primary(); // ID único do usuário
      table.string("username").notNullable().unique(); // Nome de usuário único
      table.string("email").notNullable().unique(); // E-mail único
      table.string("password").notNullable(); // Hash da senha
      table.string("name").nullable(); // Nome completo do usuário
      table.string("avatar").nullable(); // URL para o avatar do usuário
      table.boolean("is_active").defaultTo(true); // Status ativo/inativo
      table.timestamp("created_at").defaultTo(knex.fn.now()); // Data de criação
      table.timestamp("updated_at").defaultTo(knex.fn.now()); // Data de última atualização
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.dropTable("users");
  };
  