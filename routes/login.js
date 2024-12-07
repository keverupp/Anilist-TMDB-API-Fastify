const { login } = require("../controllers/authController");

async function loginRoutes(fastify, options) {
  // Define a rota /login
  fastify.post("/login", login);
}

module.exports = loginRoutes;
