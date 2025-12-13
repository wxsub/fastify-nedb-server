export default async function (fastify, opts) {
  fastify.get('/get', async function (request, reply) {
    return 'this is an shop'
  })
}
