const fastify = require("fastify")({ logger: true });
const app = require("./app"); // Substitua pelo caminho correto para o módulo do seu servidor

(async () => {
  try {
    // Registre os plugins e rotas
    await app(fastify, {});

    // Inicie o servidor em todas as interfaces, na porta 3000
    const port = process.env.PORT || 3001;
    await fastify.listen({ port, host: "0.0.0.0" });

    console.log(`Server is running on: http://${fastify.server.address().address}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
})();
