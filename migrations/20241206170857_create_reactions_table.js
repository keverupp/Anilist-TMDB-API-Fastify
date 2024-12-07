exports.up = function (knex) {
    return knex.schema.createTable("reactions", (table) => {
      table.increments("id").primary(); // ID da reação
      table.integer("comment_id").unsigned().notNullable().references("id").inTable("comments").onDelete("CASCADE"); // Comentário relacionado
      table.integer("user_id").unsigned().notNullable(); // ID do usuário que reagiu
      table.enu("type", ["like", "dislike"]).notNullable(); // Tipo de reação
      table.timestamp("created_at").defaultTo(knex.fn.now()); // Data da reação
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable("reactions");
  };
  