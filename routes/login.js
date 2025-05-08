const { login, googleLogin } = require("../controllers/authControllers");

async function loginRoutes(fastify, options) {
  // Define a rota /login
  fastify.post("/login", login);

  fastify.post("/google-login", googleLogin);
}

module.exports = loginRoutes;
