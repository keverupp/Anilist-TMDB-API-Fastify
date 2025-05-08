const { getAnimeCalendar } = require("../controllers/calendarController");

module.exports = async function (fastify) {
  fastify.get("/calendar", getAnimeCalendar);
};
