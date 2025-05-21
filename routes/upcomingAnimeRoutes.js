const {
  fetchUpcomingAnimes,
  processUnprocessedAnimes,
} = require("../controllers/upcomingAnimeController");
const {
  listUpcomingAnimes,
  countUpcomingAnimes,
} = require("../repositories/upcomingAnimeRepository");

/**
 * Rotas para animes futuros
 * @param {import('fastify').FastifyInstance} fastify - Instância do Fastify
 */
async function upcomingAnimeRoutes(fastify) {
  /**
   * @route GET /upcoming-animes/fetch
   * @desc Busca animes futuros na Jikan API e salva no banco
   * @access Private (Admin)
   */
  fastify.get("/upcoming-animes/fetch", fetchUpcomingAnimes);

  /**
   * @route GET /upcoming-animes/process
   * @desc Processa animes não processados (tradução e busca de ID)
   * @access Private (Admin)
   */
  fastify.get("/upcoming-animes/process", processUnprocessedAnimes);

  /**
   * @route GET /upcoming-animes
   * @desc Lista animes futuros com paginação e filtros
   * @access Public
   */
  fastify.get("/upcoming-animes", async (request, reply) => {
    try {
      const { page = 1, limit = 20, season, year, hasOtakuId } = request.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        season,
        year: year ? parseInt(year) : undefined,
        hasOtakuId: hasOtakuId === undefined ? null : hasOtakuId === "true",
      };

      const [animes, total] = await Promise.all([
        listUpcomingAnimes(options),
        countUpcomingAnimes(options),
      ]);

      return reply.send({
        success: true,
        data: animes,
        pagination: {
          total,
          page: options.page,
          limit: options.limit,
          pages: Math.ceil(total / options.limit),
        },
      });
    } catch (error) {
      request.log.error(`Erro ao listar animes futuros: ${error.message}`);
      return reply.status(500).send({
        success: false,
        error: "Erro ao listar animes futuros",
        details: error.message,
      });
    }
  });
}

module.exports = upcomingAnimeRoutes;
