exports.seed = async function (knex) {
  // Limpa as tabelas antes de inserir
  await knex('roles').del();

  // Insere papéis padrão
  await knex('roles').insert([
    { id: 1, name: 'admin', created_at: knex.fn.now(), updated_at: knex.fn.now() },
    { id: 2, name: 'moderator', created_at: knex.fn.now(), updated_at: knex.fn.now() },
    { id: 3, name: 'user', created_at: knex.fn.now(), updated_at: knex.fn.now() },
  ]);
};
