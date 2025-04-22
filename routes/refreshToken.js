const { refreshToken } = require("../controllers/authControllers");

async function refreshTokenRoutes(fastify, options) {
  // Define a rota /refreshToken
  fastify.post("/refreshToken", refreshToken);
}

module.exports = refreshTokenRoutes;
