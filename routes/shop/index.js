export default async function (fastify, opts) {
  fastify.post('/set', async function (request, reply) {
    console.log(request.body)
    return reply.success({ body: request.body }, 'Shop set received')
  })
}
