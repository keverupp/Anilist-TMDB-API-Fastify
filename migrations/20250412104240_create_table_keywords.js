exports.up = function (knex) {
  return knex.schema
    .createTable("keywords", (table) => {
      table.integer("id").primary();
      table
        .string("name")
        .unique()
        .notNullable()
        .comment("Palavra-chave associada ao anime.");
    })
    .createTable("anime_keywords", (table) => {
      table
        .integer("anime_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("animes")
        .onDelete("CASCADE");
      table
        .integer("keyword_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("keywords")
        .onDelete("CASCADE");
      table.primary(["anime_id", "keyword_id"]);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("anime_keywords")
    .dropTableIfExists("keywords");
};
