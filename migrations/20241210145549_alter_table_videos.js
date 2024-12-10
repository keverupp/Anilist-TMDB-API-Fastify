exports.up = function(knex) {
    return knex.schema.table('videos', function(table) {
      table.unique(['key']);
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.table('videos', function(table) {
      table.dropUnique(['key']);
    });
  };