/**
 * Handler serverless para Vercel.
 * Rutas rápidas (/, /api, /api/health) responden SIN cargar Express ni BD.
 * El resto carga la app Express bajo demanda.
 */
function getPath(req) {
  const raw = req.url || req.path || ''
  const path = raw.startsWith('http') ? new URL(raw).pathname : raw.split('?')[0]
  return path || '/'
}

export default async function (req, res) {
  const path = getPath(req)
  if (path === '/' || path === '/api' || path === '/api/health') {
    res.status(200).json({ ok: true, mensaje: 'API Tec Master' })
    return
  }

  const { default: app } = await import('../servidor/servidor.js')
  const { default: createHandler } = await import('serverless-http')
  const handler = createHandler(app)
  await handler(req, res)
}
