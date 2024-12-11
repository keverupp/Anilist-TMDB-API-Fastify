exports.seed = async function (knex) {
  // Limpa a tabela antes de inserir (opcional)
  await knex('genres').del();

  // Insere os dados
  await knex('genres').insert([
    { id: 10759, name_en: 'Action & Adventure', name_pt: 'Ação e Aventura' },
    { id: 16, name_en: 'Animation', name_pt: 'Animação' },
    { id: 35, name_en: 'Comedy', name_pt: 'Comédia' },
    { id: 80, name_en: 'Crime', name_pt: 'Crime' },
    { id: 99, name_en: 'Documentary', name_pt: 'Documentário' },
    { id: 18, name_en: 'Drama', name_pt: 'Drama' },
    { id: 10751, name_en: 'Family', name_pt: 'Família' },
    { id: 10762, name_en: 'Kids', name_pt: 'Infantil' },
    { id: 9648, name_en: 'Mystery', name_pt: 'Mistério' },
    { id: 10763, name_en: 'News', name_pt: 'Notícias' },
    { id: 10764, name_en: 'Reality', name_pt: 'Reality' },
    { id: 10765, name_en: 'Sci-Fi & Fantasy', name_pt: 'Ficção Científica e Fantasia' },
    { id: 10766, name_en: 'Soap', name_pt: 'Novela' },
    { id: 10767, name_en: 'Talk', name_pt: 'Talk Show' },
    { id: 10768, name_en: 'War & Politics', name_pt: 'Guerra e Política' },
    { id: 37, name_en: 'Western', name_pt: 'Faroeste' }
  ]);
};
