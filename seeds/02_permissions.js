exports.seed = async function (knex) {
  await knex('permissions').del();

  await knex('permissions').insert([
    { id: 1, name: 'can_create_comments', created_at: knex.fn.now(), updated_at: knex.fn.now() },
    { id: 2, name: 'can_edit_comments', created_at: knex.fn.now(), updated_at: knex.fn.now() },
    { id: 3, name: 'can_delete_comments', created_at: knex.fn.now(), updated_at: knex.fn.now() },
    { id: 4, name: 'can_reply_comments', created_at: knex.fn.now(), updated_at: knex.fn.now() },
  ]);
};
