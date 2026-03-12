function getAllowedOrigin(req) {
  const allowed = process.env.CORS_ORIGIN
  const origin = req.headers?.origin
  if (!allowed) return origin || '*'
  return origin === allowed ? allowed : allowed
}

export function applyCors(req, res) {
  const allowOrigin = getAllowedOrigin(req)
  res.setHeader('Access-Control-Allow-Origin', allowOrigin)
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export function handleOptions(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return true
  }
  return false
}

