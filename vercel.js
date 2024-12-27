const fastify = require('fastify')();
const app = require('./app');

(async () => {
  try {
    await app(fastify, {});
    module.exports = async (req, res) => {
      await fastify.ready(); // Prepara o servidor Fastify para processar requisições
      fastify.server.emit('request', req, res); // Encaminha a requisição para o Fastify
    };
    console.log('Fastify app is ready for requests');
  } catch (err) {
    console.error('Error starting Fastify app:', err);
    process.exit(1);
  }
})();
