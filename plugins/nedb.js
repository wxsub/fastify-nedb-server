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

  fastify.decorate('db', db)

  fastify.addHook('onClose', (instance, done) => {
    db.persistence.stopAutocompaction()
    done()
  })
})
