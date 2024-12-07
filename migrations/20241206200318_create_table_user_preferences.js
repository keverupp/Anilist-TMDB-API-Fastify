exports.up = function (knex) {
    return knex.schema.createTable("user_preferences", (table) => {
      table.increments("id").primary();
      table.integer("user_id").unsigned().notNullable().references("id").inTable("users").onDelete("CASCADE");
      table.boolean("notify_replies").defaultTo(true); // Notificar sobre respostas aos seus comentários
      table.boolean("notify_reactions").defaultTo(true); // Notificar sobre reações aos seus comentários
      table.boolean("notify_new_comments").defaultTo(false); // Notificar sobre novos comentários no anime seguido
      table.boolean("notify_new_episodes").defaultTo(false); // Notificar sobre novos episódios no anime seguido
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable("user_preferences");
  };
  