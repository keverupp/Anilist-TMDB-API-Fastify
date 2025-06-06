const { logout } = require("../controllers/authControllers");

async function logoutRoutes(fastify, options) {
  // Define a rota /login
  fastify.post("/logout", logout);
}

module.exports = logoutRoutes;