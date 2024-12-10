const { fetchAndStoreVideos, getVideos } = require('../controllers/videosController');

async function videoRoutes(fastify, options) {
  // Rota para buscar e armazenar vídeos
  fastify.post('/anime/:series_id/videos', fetchAndStoreVideos);

  // Rota para consultar vídeos
  fastify.get('/videos', getVideos);
}

module.exports = videoRoutes;
