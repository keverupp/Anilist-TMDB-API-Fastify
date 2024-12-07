const { register } = require("../controllers/RegisterController");

async function registerRoutes(fastify, options) {
  // Define a rota /register
  fastify.post("/register", register);
}

module.exports = registerRoutes;
