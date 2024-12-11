exports.seed = async function (knex) {
  // Limpa os dados antes de inserir
  await knex('role_permissions').del();

  // Associa permissões aos papéis
  await knex('role_permissions').insert([
    // Permissões do admin (todas as permissões)
    { role_id: 1, permission_id: 1, created_at: knex.fn.now(), updated_at: knex.fn.now() }, // can_create_comments
    { role_id: 1, permission_id: 2, created_at: knex.fn.now(), updated_at: knex.fn.now() }, // can_edit_comments
    { role_id: 1, permission_id: 3, created_at: knex.fn.now(), updated_at: knex.fn.now() }, // can_delete_comments
    { role_id: 1, permission_id: 4, created_at: knex.fn.now(), updated_at: knex.fn.now() }, // can_reply_comments

    // Permissões do moderator
    { role_id: 2, permission_id: 1, created_at: knex.fn.now(), updated_at: knex.fn.now() }, // can_create_comments
    { role_id: 2, permission_id: 2, created_at: knex.fn.now(), updated_at: knex.fn.now() }, // can_edit_comments
    { role_id: 2, permission_id: 3, created_at: knex.fn.now(), updated_at: knex.fn.now() }, // can_delete_comments
    { role_id: 2, permission_id: 4, created_at: knex.fn.now(), updated_at: knex.fn.now() }, // can_reply_comments

    // Permissões do user
    { role_id: 3, permission_id: 1, created_at: knex.fn.now(), updated_at: knex.fn.now() }, // can_create_comments
    { role_id: 3, permission_id: 4, created_at: knex.fn.now(), updated_at: knex.fn.now() }, // can_reply_comments
  ]);
};
