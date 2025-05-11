const {
  reactToComment,
  countReactions,
} = require("../controllers/ReactionsController");
const { authenticate } = require("../middlewares/AuthMiddleware");

async function reactionRoutes(fastify, options) {
  fastify.post("/reactions", { preHandler: authenticate }, reactToComment);
  fastify.get("/reactions", { preHandler: authenticate }, countReactions);
}

module.exports = reactionRoutes;
