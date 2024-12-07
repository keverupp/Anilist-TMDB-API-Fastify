exports.up = function (knex) {
    return knex.schema.createTable("comments", (table) => {
      table.increments("id").primary(); // ID do comentário
      table.integer("parent_id").unsigned().nullable(); // Referência para o comentário pai (resposta)
      table.integer("anime_id").unsigned().notNullable(); // ID do anime
      table.integer("episode_id").unsigned().nullable(); // ID do episódio (se aplicável)
      table.integer("user_id").unsigned().notNullable(); // ID do autor do comentário
      table.text("content").notNullable(); // Conteúdo do comentário
      table.timestamp("created_at").defaultTo(knex.fn.now()); // Data de criação
      table.timestamp("updated_at").defaultTo(knex.fn.now()); // Data de atualização
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable("comments");
  };
  