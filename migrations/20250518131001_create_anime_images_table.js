/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("anime_images", function (table) {
    table.increments("id").primary(); // Chave primária auto-incremental para a tabela de imagens

    // 'show_id' armazena o ID do TMDB do anime, que é a PK da tabela 'animes'.
    // Certifique-se de que o tipo (integer) e o atributo (unsigned) correspondem
    // à coluna 'id' da sua tabela 'animes'.
    table.integer("show_id").unsigned().notNullable();
    table
      .foreign("show_id")
      .references("id")
      .inTable("animes")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.string("file_path").notNullable(); // Caminho do arquivo da imagem no TMDB
    table.integer("width").notNullable(); // Largura da imagem em pixels
    table.integer("height").notNullable(); // Altura da imagem em pixels
    table.float("aspect_ratio").notNullable(); // Proporção da imagem
    table.string("iso_639_1"); // Código de idioma ISO 639-1 (pode ser nulo)
    table.float("vote_average").notNullable().defaultTo(0); // Média de votos
    table.integer("vote_count").notNullable().defaultTo(0); // Número de votos
    table.string("image_type").notNullable(); // Tipo: 'backdrop', 'poster', 'logo'

    // Timestamps automáticos (created_at, updated_at)
    table.timestamps(true, true);

    // Índices para otimizar consultas
    table.index("show_id"); // Para buscar rapidamente todas as imagens de um anime
    table.index(["show_id", "image_type"]); // Para buscar imagens de um tipo específico para um anime

    // Garante que cada imagem (file_path) seja única por anime (show_id)
    // Isso previne duplicatas se o mesmo processo tentar inserir a mesma imagem novamente.
    table.unique(["show_id", "file_path"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("anime_images");
};
