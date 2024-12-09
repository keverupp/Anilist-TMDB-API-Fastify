exports.up = function (knex) {
    return knex.schema.table("animes", (table) => {
      table.boolean("adult").defaultTo(false);
      table.boolean("in_production").defaultTo(false);
      table.string("homepage").nullable();
      table.float("vote_average").defaultTo(0);
      table.integer("vote_count").defaultTo(0);
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.table("animes", (table) => {
      table.dropColumn("adult");
      table.dropColumn("in_production");
      table.dropColumn("homepage");
      table.dropColumn("vote_average");
      table.dropColumn("vote_count");
    });
  };
  