import moment from "moment"
moment.locale('zh-cn')

export default async function (fastify, opts) {
  fastify.post('/set', async function (request, reply) {
    try {
      const { id, ...raw } = request.body || {}
      if (id) {
        const db = await fastify.db.findOne({ _id: id })
        if (db?._id) {
          console.log(id)
          const doc = await fastify.db.update({ _id: id }, raw)
          return reply.success(doc, 'update success！')
        } else {
          return reply.error({}, `can not found id:${id}`)
        }
      } else {
        const doc = await fastify.db.insert(raw)
        return reply.success(doc, 'add success！')
      }
    } catch (error) {
      return reply.error(error, 'error')
    }
  })

  fastify.get('/', async function (request, reply) {
    try {
      const { id } = request.query || {}
      if (id) {
        const db = await fastify.db.findOne({ _id: id })
        if (db) {
          const { _id, createdAt, updatedAt, ...raw } = db
          return reply.success({
            id: _id,
            createdAt: moment(createdAt).format('LLLL'),
            updatedAt: moment(updatedAt).format('LLLL'),
            ...raw
          }, 'success')
        } else {
          return reply.error({}, `db data is null`)
        }
      } else {
        throw new Error('id is required')
      }
    } catch (error) {
      return reply.error(error, 'error')
    }
  })

  fastify.delete('/', async function (request, reply) {
    try {
      const { id } = request.query || {}
      if (id) {
        const db = await fastify.db.remove({ _id: id })
        return reply.success(db, 'delete success！')
      } else {
        throw new Error('id is required')
      }
    } catch (error) {
      return reply.error(error, 'error')
    }
  })
}
