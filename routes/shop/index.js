import moment from "moment"
moment.locale('zh-cn')

export default async function (fastify, opts) {
  fastify.post('/set', async function (request, reply) {
    try {
      const { id, ...raw } = request.body || {}
      if (id) {
        const db = await fastify.db.findOne({ _id: id })
        if (db?._id) {
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
          const currentMonth = moment().format('YYYY-MM')
          const update =
            db.month === currentMonth
              ? { $inc: { times: 1, monthTimes: 1 } }
              : { $set: { month: currentMonth, monthTimes: 1 }, $inc: { times: 1 } }
          const { affectedDocs } = await fastify.db.update({ _id: id }, update, { returnUpdatedDocs: true })
          const { _id, createdAt, updatedAt, ...raw } = affectedDocs
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

  fastify.get('/list', async function (request, reply) {
    try {
      const { page = 1, pageSize = 10, sort = 'updatedAt', order = 'desc' } = request.query || {}
      const p = Math.max(1, Number(page) || 1)
      const ps = Math.min(100, Math.max(1, Number(pageSize) || 10))
      const skip = (p - 1) * ps
      const sortOrder = order === 'asc' ? 1 : -1
      const sortObj = { [sort]: sortOrder }
      const [list, total] = await Promise.all([
        fastify.db.find({}, { sort: sortObj, skip, limit: ps }),
        fastify.db.count({})
      ])
      const data = list.map(item => {
        const { _id, createdAt, updatedAt, ...raw } = item
        return {
          id: _id,
          createdAt: moment(createdAt).format('LLLL'),
          updatedAt: moment(updatedAt).format('LLLL'),
          ...raw
        }
      })
      return reply.success({
        list: data,
        page: p,
        pageSize: ps,
        total,
        pages: Math.max(1, Math.ceil(total / ps))
      }, 'success')
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
