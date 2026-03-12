import bcrypt from 'bcryptjs'
import { applyCors, handleOptions } from '../_cors.js'
import { getPool } from '../_db.js'
import { requireAuth } from '../_auth.js'

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
      if (data.length > 2_000_000) reject(new Error('Payload demasiado grande'))
    })
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {})
      } catch (e) {
        reject(e)
      }
    })
  })
}

export default async function handler(req, res) {
  applyCors(req, res)
  if (handleOptions(req, res)) return

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' })
    return
  }

  try {
    const usuario = await requireAuth(req)
    const { contraseñaActual, contraseñaNueva } = await readJson(req)
    if (!contraseñaActual || !contraseñaNueva) {
      res.status(400).json({ error: 'Faltan contraseña actual o nueva.' })
      return
    }
    if (String(contraseñaNueva).length < 6) {
      res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' })
      return
    }

    const pool = getPool()
    const r = await pool.query(
      'SELECT id, contraseña_hash FROM usuarios WHERE id = $1',
      [usuario.id]
    )
    const fila = r.rows?.[0]
    if (!fila) {
      res.status(401).json({ error: 'Usuario no encontrado.' })
      return
    }

    const coincide = await bcrypt.compare(String(contraseñaActual), fila.contraseña_hash)
    if (!coincide) {
      res.status(401).json({ error: 'Contraseña actual incorrecta.' })
      return
    }

    const nuevaHash = await bcrypt.hash(String(contraseñaNueva), 10)
    await pool.query(
      'UPDATE usuarios SET contraseña_hash = $1 WHERE id = $2',
      [nuevaHash, usuario.id]
    )

    res.status(200).json({ ok: true })
  } catch (err) {
    res.status(err.statusCode || 503).json({ error: err.message || 'Error al cambiar contraseña.' })
  }
}

