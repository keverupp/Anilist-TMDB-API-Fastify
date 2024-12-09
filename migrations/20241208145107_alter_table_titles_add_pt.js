exports.up = function (knex) {
    return knex.schema.table('titles', (table) => {
      table.string('pt_title').nullable();
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.table('titles', (table) => {
      table.dropColumn('pt_title');
    });
  };
  