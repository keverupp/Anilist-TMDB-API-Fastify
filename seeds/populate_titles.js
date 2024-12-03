/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('titles').del();
  // Inserts seed entries
  await knex('titles').insert([
    {
      english_title: 'Attack on Titan',
      native_title: '進撃の巨人',
      romanji_title: 'Shingeki no Kyojin',
    },
    {
      english_title: 'Naruto',
      native_title: 'ナルト',
      romanji_title: 'Naruto',
    },
    {
      english_title: 'My Hero Academia',
      native_title: '僕のヒーローアカデミア',
      romanji_title: 'Boku no Hero Academia',
    },
    {
      english_title: 'My Friend',
      native_title: 'ア',
      romanji_title: 'Boku no Tomodachi',
    },
  ]);
};

