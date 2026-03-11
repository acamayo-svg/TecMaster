/**
 * Catch-all serverless handler para Vercel.
 * Permite que /api/* llegue a la misma app Express conservando la ruta.
 */
import app from '../servidor/servidor.js'

const createHandler = (await import('serverless-http')).default
const handler = createHandler(app)

export default async function (req, res) {
  return handler(req, res)
}

