/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('genres', table => {
        table.increments('id').primary(); // ID autoincrementado
        table.string('name').notNullable().unique(); // Nome do gênero (único)
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('genres');
};
