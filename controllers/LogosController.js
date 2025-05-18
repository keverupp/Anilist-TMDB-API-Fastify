const {
  fetchAndProcessTmdbImagesWithCache,
} = require("../services/LogoService");

async function getAnimeLogos(req, reply) {
  const { id } = req.params; // Este 'id' é o TMDB ID do anime

  try {
    const imageData = await fetchAndProcessTmdbImagesWithCache(id, req.log); // Passando req.log para logging
    return reply.send(imageData); // Envia a resposta completa como antes
  } catch (error) {
    // Erros da API já são logados no serviço. Erros inesperados são logados aqui.
    if (req.log && typeof req.log.error === "function") {
      req.log.error(
        { err: error, animeId: id },
        "Erro no controller getAnimeLogos"
      );
    } else {
      
    }

    const statusCode =
      error.response && error.response.status ? error.response.status : 500;

    return reply.status(statusCode).send({
      error: "Erro ao buscar ou processar dados da TMDB.",
      details: error.message, // Em produção, tenha cuidado ao expor error.message
    });
  }
}

module.exports = {
  getAnimeLogos,
};
