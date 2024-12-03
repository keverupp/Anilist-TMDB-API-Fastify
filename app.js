'use strict';

const path = require('node:path');
const AutoLoad = require('@fastify/autoload');
require('dotenv').config(); // Carregar variáveis de ambiente
const { Translator } = require('deepl-node');
const fastify = require('fastify')({ logger: true });

// Configurando o cliente DeepL
const deeplTranslator = new Translator(process.env.DEEPL_API_KEY); // Usando a chave do .env

// Passando o cliente do DeepL para o contexto global do Fastify
fastify.decorate('deeplTranslator', deeplTranslator);

// Carregar todos os plugins definidos na pasta `plugins`
fastify.register(AutoLoad, {
  dir: path.join(__dirname, 'plugins'),
});

// Carregar todas as rotas definidas na pasta `routes`
fastify.register(AutoLoad, {
  dir: path.join(__dirname, 'routes'),
});

// Inicia o servidor
fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Servidor rodando`);

});
