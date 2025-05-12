const ActivityController = require("../controllers/activityController");

async function activityRoutes(fastify, options) {
  fastify.post("/activity", ActivityController.logActivity);
}

module.exports = activityRoutes;
