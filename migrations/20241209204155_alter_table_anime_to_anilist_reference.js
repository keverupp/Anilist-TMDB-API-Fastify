exports.up = function(knex) {
    return knex.schema.alterTable('animes', (table) => {
        // Adicionar colunas novas
        table.integer('anilist_id').nullable(); // ID relacionado ao AniList
        table.string('banner_path', 255).nullable(); // Caminho para a capa do anime
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('animes', (table) => {
        // Remover colunas adicionadas
        table.dropColumn('anilist_id');
        table.dropColumn('banner_path');
    });
};
