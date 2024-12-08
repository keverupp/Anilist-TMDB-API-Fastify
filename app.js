"use strict";

const path = require("node:path");
const AutoLoad = require("@fastify/autoload");
require("dotenv").config();
const { Translator } = require("deepl-node");

module.exports = async function (fastify, opts) {
  // Configura o cliente DeepL
  const deeplTranslator = new Translator(process.env.DEEPL_API_KEY);

  // Adiciona o cliente do DeepL ao contexto global do Fastify
  fastify.decorate("deeplTranslator", deeplTranslator);

  // Registra o plugin @fastify/multipart para suporte a uploads de arquivos
  fastify.register(require("@fastify/multipart"), {
    limits: {
      fileSize: 5 * 1024 * 1024, // Limite de tamanho do arquivo (5 MB)
    },
  });

  // Carrega todos os plugins definidos na pasta `plugins`
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "plugins"),
  });

  // Carrega todas as rotas definidas na pasta `routes`
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "routes"),
  });
};
