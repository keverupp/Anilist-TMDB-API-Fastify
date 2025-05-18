const knex = require("knex")(require("../knexfile").development);
const ANIME_IMAGES_TABLE = "anime_images";

/**
 * Encontra todas as imagens no banco de dados associadas a um ID de anime específico.
 *
 * @param {number|string} show_id - O ID do anime (TMDB ID).
 * @returns {Promise<Array<object>>} Uma promessa que resolve para um array de objetos de imagem.
 * Retorna um array vazio se nenhuma imagem for encontrada ou se o ID for inválido.
 */
async function findImagesByShowId(show_id) {
  const numericShowId = parseInt(show_id, 10);

  if (isNaN(numericShowId)) {
    console.error(
      `[ImageModel.findImagesByShowId] ID de show fornecido é inválido: ${show_id}`
    );
    return []; // Retorna array vazio para IDs não numéricos
  }

  try {
    console.log(
      `[ImageModel.findImagesByShowId] Buscando imagens para show_id: ${numericShowId}`
    );
    const images = await knex(ANIME_IMAGES_TABLE)
      .where({ show_id: numericShowId })
      .select("*");
    console.log(
      `[ImageModel.findImagesByShowId] Encontradas ${images.length} imagens para show_id: ${numericShowId}`
    );
    return images;
  } catch (error) {
    console.error(
      `[ImageModel.findImagesByShowId] Erro ao buscar imagens para show_id ${numericShowId}:`,
      error
    );
    // Relançar o erro permite que a camada de controller o trate (ex: enviando uma resposta 500)
    throw error;
  }
}

/**
 * Insere um array de objetos de imagem no banco de dados.
 * Utiliza 'onConflict().ignore()' para evitar erros de duplicidade caso uma imagem
 * (mesmo show_id e file_path) já exista, baseado na constraint UNIQUE da tabela.
 * NOTA: A sintaxe e comportamento de .onConflict().ignore() é mais garantida para PostgreSQL e SQLite.
 * Para MySQL, pode ser necessário usar uma query raw com 'INSERT IGNORE' ou configurar .onDuplicate().
 *
 * @param {Array<object>} imagesData - Um array de objetos de imagem para inserir.
 * Cada objeto deve conter todos os campos necessários para a tabela 'anime_images'.
 * @returns {Promise<Array<object>>} Uma promessa que resolve para o array de imagens que foi processado para inserção.
 * Isso não garante que todas foram inseridas se algumas foram ignoradas devido a conflitos.
 */
async function insertManyImages(imagesData) {
  if (!imagesData || imagesData.length === 0) {
    console.log(
      "[ImageModel.insertManyImages] Nenhuma imagem fornecida para inserção."
    );
    return [];
  }

  // Garante que show_id é numérico e outros pré-processamentos se necessário
  const processedImages = imagesData.map((img) => ({
    ...img, // Mantém todos os outros campos como file_path, width, height, etc.
    show_id: parseInt(img.show_id, 10),
  }));

  try {
    console.log(
      `[ImageModel.insertManyImages] Tentando inserir/ignorar ${processedImages.length} imagens.`
    );

    // Para PostgreSQL e SQLite (e versões mais recentes do Knex para outros DBs que o suportam):
    const result = await knex(ANIME_IMAGES_TABLE)
      .insert(processedImages)
      .onConflict(["show_id", "file_path"]) // Especifica as colunas da sua constraint UNIQUE
      .ignore(); // Ignora a inserção da linha se houver conflito

    // O 'result' de uma operação 'ignore' pode variar entre bancos de dados.
    // No PostgreSQL, 'ignore' não retorna as linhas por padrão.
    // Se você precisar de um feedback detalhado sobre quais foram inseridas vs. ignoradas,
    // a lógica pode precisar ser mais complexa (ex: buscar após inserir ou inserir uma por uma).
    console.log(
      `[ImageModel.insertManyImages] Operação de inserção/ignorar completada. Resultado (pode variar por DB):`,
      result
    );

    // Retornar as imagens processadas permite ao controller saber quais dados foram manipulados.
    return processedImages;
  } catch (error) {
    console.error(
      `[ImageModel.insertManyImages] Erro durante a inserção de imagens:`,
      error
    );
    // Se for um erro de constraint e onConflict não foi tratado pelo DB/Knex da forma esperada
    if (
      error.code === "23505" ||
      (error.message &&
        (error.message.includes("UNIQUE constraint failed") ||
          error.message.includes("Duplicate entry")))
    ) {
      console.warn(
        `[ImageModel.insertManyImages] Conflito de constraint única detectado. Algumas imagens podem já existir e foram ignoradas se a query onConflict funcionou.`
      );
      // Mesmo com o erro, se a intenção era ignorar, podemos retornar os dados processados.
      return processedImages;
    }
    throw error; // Relança outros tipos de erros
  }
}

module.exports = {
  findImagesByShowId,
  insertManyImages,
};
