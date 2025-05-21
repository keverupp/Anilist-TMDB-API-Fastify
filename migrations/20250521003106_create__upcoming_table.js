/**
 * Migration para criar a tabela de animes futuros
 * @param {import('knex')} knex - Instância do Knex
 * @returns {Promise} Promise do Knex
 */
exports.up = function (knex) {
  return knex.schema.createTable("upcoming_animes", (table) => {
    table.increments("id").primary();
    table
      .integer("mal_id")
      .notNullable()
      .unique()
      .comment("ID do anime no MyAnimeList");
    table
      .integer("otaku_discuss_id")
      .nullable()
      .comment("ID do anime na API OtakuDiscuss");

    // Títulos
    table.string("title").notNullable().comment("Título original do anime");
    table.string("title_english").nullable().comment("Título em inglês");
    table.string("title_japanese").nullable().comment("Título em japonês");

    // Títulos traduzidos
    table
      .string("title_pt")
      .nullable()
      .comment("Título traduzido para português");

    // Imagens
    table.text("image_url").nullable().comment("URL da imagem grande (JPG)");

    // Trailer
    table
      .string("trailer_youtube_id")
      .nullable()
      .comment("ID do YouTube para o trailer");
    table.text("trailer_url").nullable().comment("URL do trailer");

    // Informações de temporada
    table
      .string("season")
      .nullable()
      .comment("Temporada de lançamento (spring, summer, fall, winter)");
    table.integer("year").nullable().comment("Ano de lançamento");
    table.date("release_date").nullable().comment("Data de lançamento");

    // Metadados
    table.text("synopsis").nullable().comment("Sinopse do anime");
    table
      .text("synopsis_pt")
      .nullable()
      .comment("Sinopse traduzida para português");

    // Controle
    table
      .boolean("processed")
      .defaultTo(false)
      .comment("Indica se o anime já foi processado");
    table.timestamps(true, true);
  });
};

/**
 * Reverte a migration
 * @param {import('knex')} knex - Instância do Knex
 * @returns {Promise} Promise do Knex
 */
exports.down = function (knex) {
  return knex.schema.dropTable("upcoming_animes");
};
