/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('anime_genres', table => {
        table.integer('anime_id').unsigned().notNullable();
        table.integer('genre_id').unsigned().notNullable();

        table.foreign('anime_id').references('id').inTable('animes').onDelete('CASCADE');
        table.foreign('genre_id').references('id').inTable('genres').onDelete('CASCADE');

        table.primary(['anime_id', 'genre_id']); // Chave composta para evitar duplicidade
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('anime_genres');
};
