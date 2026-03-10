/**
 * Handler serverless para Vercel: redirige todas las peticiones /api/* a la app Express.
 */
import app from '../servidor/servidor.js'
import { inicializarTablas } from '../servidor/baseDeDatos.js'

const createHandler = (await import('serverless-http')).default
const handler = createHandler(app)

let dbReady = null
async function ensureDb() {
  if (dbReady === null) dbReady = inicializarTablas().catch((err) => { dbReady = Promise.reject(err); throw err })
  return dbReady
}

export default async function (req, res) {
  await ensureDb()
  return handler(req, res)
}
