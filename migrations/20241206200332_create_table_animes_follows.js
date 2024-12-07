exports.up = function (knex) {
    return knex.schema.createTable("anime_follows", (table) => {
      table.increments("id").primary();
      table.integer("user_id").unsigned().notNullable().references("id").inTable("users").onDelete("CASCADE");
      table.integer("anime_id").unsigned().notNullable().references("id").inTable("animes").onDelete("CASCADE");
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable("anime_follows");
  };
  