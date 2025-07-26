// routes/attAnimeRoutes.js

const {
  updateCurrentAndInProductionAnimes,
} = require("../controllers/AttAnime");

async function attAnimeRoutes(fastify, options) {
  fastify.post(
    "/animes/update-current-production",
    {
      schema: {
        description:
          "Atualiza todos os animes em temporada atual ou em produção",
        tags: ["Animes"],
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    updateCurrentAndInProductionAnimes
  );
}

module.exports = attAnimeRoutes;
