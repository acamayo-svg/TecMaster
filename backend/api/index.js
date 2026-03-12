/**
 * Handler serverless para Vercel: todas las peticiones (rewrite) llegan aquí.
 */
import app from '../servidor/servidor.js'

const createHandler = (await import('serverless-http')).default
const handler = createHandler(app)

const TIMEOUT_MS = 25_000

export default async function (req, res) {
  const timeoutId = setTimeout(() => {
    if (!res.headersSent) {
      res.status(503).json({ error: 'Timeout', mensaje: 'La función tardó demasiado.' })
    }
  }, TIMEOUT_MS)
  try {
    await handler(req, res)
  } finally {
    clearTimeout(timeoutId)
  }
}
