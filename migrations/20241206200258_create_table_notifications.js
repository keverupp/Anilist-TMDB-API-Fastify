exports.up = function (knex) {
    return knex.schema.createTable("notifications", (table) => {
      table.increments("id").primary();
      table.integer("user_id").unsigned().notNullable().references("id").inTable("users").onDelete("CASCADE");
      table.string("type").notNullable(); // Tipo: 'reaction', 'reply', 'new_comment', 'new_episode'
      table.integer("related_id").unsigned().notNullable(); // ID do comentário, reação ou episódio relacionado
      table.boolean("read").defaultTo(false); // Se a notificação foi lida
      table.timestamp("created_at").defaultTo(knex.fn.now());
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable("notifications");
  };
  