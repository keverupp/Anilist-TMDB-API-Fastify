"use strict";

const path = require("node:path");
const AutoLoad = require("@fastify/autoload");
const swagger = require("@fastify/swagger");
const swaggerUi = require("@fastify/swagger-ui");
require("dotenv").config();

module.exports = async function (fastify, opts) {
  // Configurar CORS
  fastify.register(require("@fastify/cors"), {
    origin: "*", // Permite todas as origens
    methods: ["GET", "POST", "PUT", "DELETE"], // Permite esses métodos
    allowedHeaders: ["Content-Type", "Authorization"], // Cabeçalhos permitidos
  });

  // Registra o plugin @fastify/multipart para suporte a uploads de arquivos
  fastify.register(require("@fastify/multipart"), {
    limits: {
      fileSize: 5 * 1024 * 1024, // Limite de tamanho do arquivo (5 MB)
    },
  });

  // Configurar Swagger
  fastify.register(swagger, {
    swagger: {
      info: {
        title: "OtakuDiscuss API",
        description: "Documentação da API plataforma OtakuDiscuss",
        version: "1.0.0",
      },
      host: process.env.HOST || "localhost:3000", // Ajusta para produção
      schemes: ["http", "https"],
      consumes: ["application/json"],
      produces: ["application/json"],
      securityDefinitions: {
        BearerAuth: {
          type: "apiKey",
          name: "Authorization",
          in: "header",
          description: "Adicione o token no formato: Bearer <token>",
        },
      },
      security: [{ BearerAuth: [] }],
    },
  });

  // Registrar Swagger UI
  fastify.register(swaggerUi, {
    routePrefix: "/docs", // URL para acessar a documentação
    uiConfig: {
      docExpansion: "list", // Expande os métodos por padrão
      deepLinking: true,
    },
    staticCSP: true,
    transformSpecification: (swaggerObject, request, reply) => {
      return swaggerObject;
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
