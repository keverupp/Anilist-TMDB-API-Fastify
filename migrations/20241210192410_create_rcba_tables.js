exports.up = function (knex) {
    return knex.schema
      .createTable('roles', function (table) {
        table.increments('id').primary();
        table.string('name').notNullable().unique(); // Nome do papel (ex.: admin, user)
        table.timestamps(true, true); // created_at, updated_at
      })
      .createTable('permissions', function (table) {
        table.increments('id').primary();
        table.string('name').notNullable().unique(); // Nome da permissão (ex.: can_edit, can_delete)
        table.timestamps(true, true); // created_at, updated_at
      })
      .createTable('user_roles', function (table) {
        table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.integer('role_id').unsigned().notNullable().references('id').inTable('roles').onDelete('CASCADE');
        table.primary(['user_id', 'role_id']); // Chave composta
        table.timestamps(true, true); // created_at, updated_at
      })
      .createTable('role_permissions', function (table) {
        table.integer('role_id').unsigned().notNullable().references('id').inTable('roles').onDelete('CASCADE');
        table.integer('permission_id').unsigned().notNullable().references('id').inTable('permissions').onDelete('CASCADE');
        table.primary(['role_id', 'permission_id']); // Chave composta
        table.timestamps(true, true); // created_at, updated_at
      });
  };
  
  exports.down = function (knex) {
    return knex.schema
      .dropTableIfExists('role_permissions')
      .dropTableIfExists('user_roles')
      .dropTableIfExists('permissions')
      .dropTableIfExists('roles');
  };