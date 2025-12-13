export default async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    return reply.success({ root: true })
  })
}
