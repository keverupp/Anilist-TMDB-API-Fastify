const { login } = require("../controllers/AuthController");

async function loginRoutes(fastify, options) {
  // Define a rota /login
  fastify.post("/login", login);
}

module.exports = loginRoutes;
