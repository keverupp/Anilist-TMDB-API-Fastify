exports.up = async function (knex) {
    await knex.schema.createTable('anime_seasons', (table) => {
      table.increments('id').primary();
      table.integer('anime_id').unsigned().notNullable();
      table.integer('season_id').unsigned().notNullable();
      table.foreign('anime_id').references('animes.id').onDelete('CASCADE');
      table.foreign('season_id').references('seasons.id').onDelete('CASCADE');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  };
  
  exports.down = async function (knex) {
    await knex.schema.dropTable('anime_seasons');
  };
  