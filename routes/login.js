const { login } = require("../controllers/authControllers");

async function loginRoutes(fastify, options) {
  // Define a rota /login
  fastify.post("/login", login);
}

module.exports = loginRoutes;
