// routes/keywordRoutes.js
const keywordController = require("../controllers/keywordController");

async function keywordRoutes(fastify, options) {
  fastify.get("/keywords", keywordController.getAllKeywords);
}

module.exports = keywordRoutes;
