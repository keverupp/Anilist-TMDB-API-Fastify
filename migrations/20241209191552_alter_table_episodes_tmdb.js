exports.up = async function(knex) {
    return knex.schema.alterTable('episodes', (table) => {
        // Adicionar novas colunas
        table.integer('anime_season_id').unsigned().references('id').inTable('anime_seasons').onDelete('CASCADE').notNullable();
        table.integer('tmdb_id').notNullable();
        table.integer('show_id').notNullable();

        // Alterar coluna existente
        table.text('overview').alter(); // Permitir descrições mais longas

        // Atualizar restrição única
        table.dropUnique(['anime_id', 'episode_number']); // Remover restrição antiga
        table.unique(['anime_season_id', 'episode_number']); // Criar nova restrição
    }).then(() => {
        // Remover coluna antiga após garantir que anime_season_id foi adicionada
        return knex.schema.alterTable('episodes', (table) => {
            table.dropColumn('anime_id');
        });
    });
};

exports.down = async function(knex) {
    return knex.schema.alterTable('episodes', (table) => {
        // Restaurar coluna antiga
        table.integer('anime_id').unsigned().notNullable().references('id').inTable('animes').onDelete('CASCADE');

        // Reverter alterações de colunas
        table.dropColumn('anime_season_id');
        table.dropColumn('tmdb_id');
        table.dropColumn('show_id');
        table.string('overview', 255).alter(); // Reverter o tipo para o original

        // Restaurar restrição única original
        table.dropUnique(['anime_season_id', 'episode_number']);
        table.unique(['anime_id', 'episode_number']);
    });
};
