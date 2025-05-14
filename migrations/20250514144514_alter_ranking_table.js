exports.up = function (knex) {
  return Promise.all([
    // 1. Modificar a tabela anime_rankings existente
    knex.schema.alterTable("anime_rankings", (table) => {
      // Remover a restrição de unicidade anterior (se existir)
      table.dropUnique(["user_id", "season", "year"]);

      // Renomear para melhor refletir o propósito da tabela
      // Note: Em alguns SGBDs, renomear pode exigir passos adicionais
      // knex.schema.renameTable("anime_rankings", "anime_ratings");

      // Alterar o campo score para estrelas
      table.renameColumn("score", "stars");

      // Modificar o tipo de dados para permitir meias estrelas (se necessário)
      // Em alguns bancos, é preciso dropar a coluna e recriá-la
      // table.dropColumn("stars");
      // table.decimal("stars", 2, 1).notNullable(); // Precisão 2,1 para valores como 4.5

      // Adicionar nova restrição de unicidade para permitir apenas um voto por anime/usuário/temporada
      table.unique(["anime_id", "user_id", "season", "year"]);
    }),

    // 2. Criar a nova tabela para escolhas do melhor anime
    knex.schema.createTable("season_best_picks", (table) => {
      table.increments("id").primary();
      table.integer("anime_id").unsigned().notNullable();
      table.integer("user_id").unsigned().notNullable();
      table.string("season").notNullable();
      table.integer("year").notNullable();
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table.timestamp("created_at").defaultTo(knex.fn.now());

      // Garantir que um usuário só possa escolher um "melhor anime" por temporada
      table.unique(["user_id", "season", "year"]);
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    // Reverter alterações na tabela anime_rankings
    knex.schema.alterTable("anime_rankings", (table) => {
      // Remover a nova restrição de unicidade
      table.dropUnique(["anime_id", "user_id", "season", "year"]);

      // Renomear de volta a coluna
      table.renameColumn("stars", "score");

      // Se você recriou a coluna, reverta-a aqui
      // table.dropColumn("stars");
      // table.integer("score").unsigned().notNullable();

      // Restaurar a restrição original
      table.unique(["user_id", "season", "year"]);

      // Reverter o nome da tabela (se foi alterado)
      // knex.schema.renameTable("anime_ratings", "anime_rankings");
    }),

    // Dropar a nova tabela
    knex.schema.dropTable("season_best_picks"),
  ]);
};
