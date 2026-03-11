/**
 * Handler serverless para Vercel: redirige todas las peticiones /api/* a la app Express.
 */
import app from '../servidor/servidor.js'
import { inicializarTablas } from '../servidor/baseDeDatos.js'

const createHandler = (await import('serverless-http')).default
const handler = createHandler(app)

let dbReady = null
async function ensureDb() {
  if (dbReady === null) {
    dbReady = inicializarTablas().catch((err) => {
      dbReady = Promise.reject(err)
      throw err
    })
  }
  return dbReady
}

const CONNECTION_TIMEOUT_MS = 20000

export default async function (req, res) {
  try {
    await Promise.race([
      ensureDb(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout conectando a la base de datos')), CONNECTION_TIMEOUT_MS)
      ),
    ])
  } catch (err) {
    console.error('Error inicializando BD:', err)
    res.status(500).json({
      error: 'Error de base de datos',
      detalle: err.message || String(err),
    })
    return
  }
  return handler(req, res)
}
