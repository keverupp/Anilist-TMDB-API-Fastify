exports.up = function (knex) {
    return knex.schema.table('episodes', (table) => {
      table.boolean('is_pending_update').defaultTo(false).notNullable().comment('Indica se o episódio está pendente de atualização.');
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.table('episodes', (table) => {
      table.dropColumn('is_pending_update');
    });
  };
  