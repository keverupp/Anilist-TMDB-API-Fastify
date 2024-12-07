/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("activity_logs", (table) => {
      table.increments("id").primary(); // ID único do log
      table.integer("user_id").unsigned().nullable(); // ID do usuário associado (pode ser nulo em caso de login falho)
      table.foreign("user_id").references("users.id").onDelete("CASCADE"); // Chave estrangeira para usuários
      table.string("action").notNullable(); // Ação realizada (ex.: login, logout, falha de login)
      table.string("ip_address").nullable(); // Endereço IP do usuário
      table.timestamp("created_at").defaultTo(knex.fn.now()); // Data da atividade
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.dropTable("activity_logs");
  };
  