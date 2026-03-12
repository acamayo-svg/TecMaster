function getAllowedOrigin(req) {
  // En Vercel las URLs de preview cambian. Para tokens Bearer (sin cookies),
  // podemos reflejar el Origin para evitar bloqueos de CORS.
  const origin = req.headers?.origin
  return origin || '*'
}

export function applyCors(req, res) {
  const allowOrigin = getAllowedOrigin(req)
  res.setHeader('Access-Control-Allow-Origin', allowOrigin)
  res.setHeader('Vary', 'Origin')
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

