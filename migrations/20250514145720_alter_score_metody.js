exports.up = function (knex) {
  return knex.schema.alterTable("anime_rankings", (table) => {
    // Alterar o tipo da coluna stars de INTEGER para DECIMAL
    table.decimal("stars", 2, 1).alter();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("anime_rankings", (table) => {
    // Reverter para INTEGER se necessário
    table.integer("stars").alter();
  });
};
