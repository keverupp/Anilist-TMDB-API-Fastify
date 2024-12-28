'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    return {
      message: "Bem-vindo à OtakuDiscuss API! 🎌✨",
      status: "online",
      description: "Sua ponte para discutir e explorar animes como nunca antes! 🚀🍣",
      repository: "Confira o repositório oficial no GitHub: https://github.com/keverupp/Anilist-TMDB-API-Fastify",
      endpoints: "Explore os endpoints disponíveis e comece sua jornada otaku agora mesmo! 🗾",
      timestamp: new Date().toISOString()
    };
  });
}
