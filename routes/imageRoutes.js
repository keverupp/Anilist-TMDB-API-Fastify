// routes/imageRoutes.js

// Ajuste o caminho para o seu controller conforme a estrutura do seu projeto
const ImageController = require("../controllers/ImageController");

/**
 * Define as rotas relacionadas às imagens de animes.
 * Esta função é um plugin Fastify e será carregada automaticamente pelo fastify-autoload.
 * @param {import('fastify').FastifyInstance} fastify - A instância do Fastify.
 * @param {object} options - Opções passadas durante o registro do plugin (pelo autoload).
 */
async function imageRoutes(fastify, options) {
  fastify.get(
    "/animes/:series_id/images", // A rota específica dentro deste "plugin" de rotas
    ImageController.fetchAndStoreImages
  );

  // Outras rotas relacionadas a imagens podem ser adicionadas aqui.
}

module.exports = imageRoutes;
