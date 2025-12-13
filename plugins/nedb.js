import fp from 'fastify-plugin'
import Datastore from 'nedb'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default fp(async function (fastify, opts) {
  const rootDir = path.join(__dirname, '..')
  const dbDir = path.join(rootDir, 'db')
  fs.mkdirSync(dbDir, { recursive: true })

  const filename = (opts && opts.dbFilename) || 'data.db'
  const datafile = path.join(dbDir, filename)

  const db = new Datastore({
    filename: datafile,
    autoload: true,
    timestampData: true
  })

  db.persistence.setAutocompactionInterval(
    (opts && opts.autocompactionInterval) || 300000
  )

  const buildCursor = (query = {}, options = {}) => {
    let cursor = db.find(query)
    if (options.sort) cursor = cursor.sort(options.sort)
    if (typeof options.skip === 'number') cursor = cursor.skip(options.skip)
    if (typeof options.limit === 'number') cursor = cursor.limit(options.limit)
    if (options.projection) cursor = cursor.projection(options.projection)
    return cursor
  }

  const api = {
    insert: (doc) =>
      new Promise((resolve, reject) => {
        db.insert(doc, (err, newDoc) => {
          if (err) reject(err)
          else resolve(newDoc)
        })
      }),
    find: (query = {}, options = {}) =>
      new Promise((resolve, reject) => {
        buildCursor(query, options).exec((err, docs) => {
          if (err) reject(err)
          else resolve(docs)
        })
      }),
    findOne: (query = {}, options = {}) =>
      new Promise((resolve, reject) => {
        db.findOne(query, options, (err, doc) => {
          if (err) reject(err)
          else resolve(doc)
        })
      }),
    update: (query, update, options = {}) =>
      new Promise((resolve, reject) => {
        db.update(query, update, options, (err, numAffected, affectedDocs, upsert) => {
          if (err) reject(err)
          else {
            if (options && options.returnUpdatedDocs) {
              resolve({ numAffected, affectedDocs, upsert })
            } else {
              resolve({ numAffected })
            }
          }
        })
      }),
    remove: (query, options = {}) =>
      new Promise((resolve, reject) => {
        db.remove(query, options, (err, numRemoved) => {
          if (err) reject(err)
          else resolve({ numRemoved })
        })
      }),
    count: (query = {}) =>
      new Promise((resolve, reject) => {
        db.count(query, (err, count) => {
          if (err) reject(err)
          else resolve(count)
        })
      }),
    ensureIndex: (options) =>
      new Promise((resolve, reject) => {
        db.ensureIndex(options, (err) => {
          if (err) reject(err)
          else resolve(true)
        })
      }),
    removeIndex: (fieldName) =>
      new Promise((resolve, reject) => {
        db.removeIndex(fieldName, (err) => {
          if (err) reject(err)
          else resolve(true)
        })
      }),
    raw: db
  }

  fastify.decorate('db', api)

  fastify.addHook('onClose', (instance, done) => {
    db.persistence.stopAutocompaction()
    done()
  })
})
