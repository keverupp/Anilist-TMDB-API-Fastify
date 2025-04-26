exports.up = function (knex) {
  return knex.schema.createTable("tmdb_anime_logos", function (table) {
    table.increments("id").primary();
    table
      .integer("anime_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("animes")
      .onDelete("CASCADE")
      .onUpdate("CASCADE")
      .unique(); // apenas um registro por anime
    table.jsonb("data").notNullable(); // resposta completa da API
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("tmdb_anime_logos");
};
