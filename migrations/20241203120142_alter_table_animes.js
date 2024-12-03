/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('animes', table => {
        table.boolean('is_current_season').defaultTo(false); // Indica se é da temporada atual
        table.string('season'); // Estação (FALL, WINTER, etc.)
        table.integer('season_year'); // Ano da temporada
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('animes', table => {
        table.dropColumn('is_current_season');
        table.dropColumn('season');
        table.dropColumn('season_year');
    });
};
