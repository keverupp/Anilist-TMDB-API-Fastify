// migration
exports.up = function (knex) {
  return knex.schema.createTable("tmdb_cached_responses", function (table) {
    table.increments("id").primary();
    table.string("endpoint").notNullable(); // ex: airing-today
    table.date("cache_date").notNullable(); // data da resposta
    table.jsonb("data").notNullable(); // resposta da TMDB
    table.timestamps(true, true); // created_at, updated_at
    table.unique(["endpoint", "cache_date"]); // 1 resposta por endpoint por dia
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("tmdb_cached_responses");
};
