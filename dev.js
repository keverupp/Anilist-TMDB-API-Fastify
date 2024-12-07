'use strict'

const fastify = require('fastify')({ logger: true })
const app = require('./app') // importa o plugin do app.js

async function start() {
  try {
    // Registra o plugin
    await fastify.register(app)
    // Inicia o servidor
    await fastify.listen({ port: 3000 })
    console.log('Servidor rodando em modo desenvolvimento!')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
