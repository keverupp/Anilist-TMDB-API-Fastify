exports.up = function(knex) {
    return knex.schema.table('titles', function(table) {
      table.dropColumn('romanji_title');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.table('titles', function(table) {
      table.integer('romanji_title'); // Adicione novamente a coluna no rollback
    });
  };
  