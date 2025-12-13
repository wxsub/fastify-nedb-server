'use strict'

const Fastify = require('fastify')
const appPlugin = require('./app')

async function start () {
  const fastify = Fastify({ logger: { level: 'info' } })

  // Register the application plugin exported by app.js
  await fastify.register(appPlugin, appPlugin.options || {})

  const port = process.env.PORT ? Number(process.env.PORT) : 3009
  const host = process.env.HOST || '0.0.0.0'

  try {
    await fastify.listen({ port, host })
    fastify.log.info(`Server listening on ${host}:${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
