exports.up = function (knex) {
  return knex.schema.createTable("anime_rankings", (table) => {
    table.increments("id").primary(); // ID do ranking
    table.integer("anime_id").unsigned().notNullable(); // ID do anime atual votado
    table.integer("user_id").unsigned().notNullable(); // ID do usuário que votou
    table.string("season").notNullable(); // Temporada (outono, inverno, primavera, verão)
    table.integer("year").notNullable(); // Ano da temporada
    table.integer("score").unsigned().notNullable(); // Pontuação dada pelo usuário
    table.integer("last_vote").unsigned().nullable(); // ID do anime votado anteriormente (se houver)
    table.timestamp("updated_at").defaultTo(knex.fn.now()); // Data de atualização
    table.timestamp("created_at").defaultTo(knex.fn.now()); // Data de criação

    // Garante que cada usuário só possa ter um voto por temporada específica
    table.unique(["user_id", "season", "year"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("anime_rankings");
};
