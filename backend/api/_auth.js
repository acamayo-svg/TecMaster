import { getPool } from './_db.js'

export async function requireAuth(req) {
  const header = req.headers?.authorization || req.headers?.Authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    const err = new Error('No autorizado. Inicia sesión.')
    err.statusCode = 401
    throw err
  }
  const pool = getPool()
  const r = await pool.query(
    'SELECT id, nombre, correo, token, foto_perfil FROM usuarios WHERE token = $1',
    [token]
  )
  const u = r.rows?.[0]
  if (!u) {
    const err = new Error('Sesión inválida. Vuelve a iniciar sesión.')
    err.statusCode = 401
    throw err
  }
  return {
    id: u.id,
    nombre: u.nombre,
    correo: u.correo,
    token: u.token,
    fotoPerfil: u.foto_perfil || null,
  }
}

