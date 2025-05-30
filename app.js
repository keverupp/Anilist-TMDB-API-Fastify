"use strict";

const path = require("node:path");
const AutoLoad = require("@fastify/autoload");
const swagger = require("@fastify/swagger");
const swaggerUi = require("@fastify/swagger-ui");
const websocket = require("@fastify/websocket");
const fastify = require("fastify")();

require("dotenv").config();

module.exports = async function (fastify, opts) {
  // CORS
  fastify.register(require("@fastify/cors"), {
    origin: "*", // aceita qualquer origem
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });

  // Multipart
  fastify.register(require("@fastify/multipart"), {
    limits: { fileSize: 5 * 1024 * 1024 },
  });

  // Swagger
  fastify.register(swagger, {
    swagger: {
      info: {
        title: "OtakuDiscuss API",
        description: "Documentação da API plataforma OtakuDiscuss",
        version: "1.0.0",
      },
      host: process.env.HOST || "localhost:3000",
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

  // Swagger UI
  fastify.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: { docExpansion: "list", deepLinking: true },
    staticCSP: true,
    transformSpecification: (swaggerObject) => swaggerObject,
  });

  // WebSocket plugin
  fastify.register(require("@fastify/websocket"));

  // Plugins folder
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "plugins"),
  });

  // Routes folder (inclui WS em routes/websockets)
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "routes"),
  });
};
