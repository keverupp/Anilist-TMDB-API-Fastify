"use strict";

const path = require("node:path");
const AutoLoad = require("@fastify/autoload");
require("dotenv").config();

module.exports = async function (fastify, opts) {

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
