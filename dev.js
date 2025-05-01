// dev.js
"use strict";

const Fastify = require("fastify");
const appPlugin = require("./app"); // seu app.js como plugin

// Cria instância com logger
const fastify = Fastify({ logger: true });

// 1️⃣ Registra TODO o app (CORS, Swagger, WS e Autoload de routes/plugins)
fastify.register(appPlugin);

(async () => {
  try {
    // 2️⃣ Aguarda tudo carregar e imprime as rotas ativas
    await fastify.ready();
    fastify.printRoutes();

    // 3️⃣ Inicia o servidor
    const port = process.env.PORT || 3000;
    await fastify.listen({ port, host: "0.0.0.0" });
    console.log(`🚀 Server running at http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
})();
