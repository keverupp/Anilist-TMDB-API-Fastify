const { refreshToken } = require("../controllers/authController");

async function refreshTokenRoutes(fastify, options) {
  // Define a rota /refreshToken
  fastify.post("/refreshToken", refreshToken);
}

module.exports = refreshTokenRoutes;
