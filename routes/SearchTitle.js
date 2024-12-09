const { searchTitles } = require('../controllers/titlesController');

module.exports = async (fastify) => {
    fastify.get('/search', searchTitles);
};
