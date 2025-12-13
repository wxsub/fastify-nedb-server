import Fastify from 'fastify'
import appPlugin, { options as appOptions } from './app.js'

async function start () {
  const fastify = Fastify({ logger: { level: 'info' } })

  await fastify.register(appPlugin, appOptions || {})

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
