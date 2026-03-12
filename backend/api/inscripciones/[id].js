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

  if (req.method !== 'PATCH') {
    res.status(405).json({ error: 'Método no permitido' })
    return
  }

  try {
    const usuario = await requireAuth(req)
    const idInscripcion = String(req.query?.id || req.query?.[0] || '').trim()
    if (!idInscripcion) {
      res.status(400).json({ error: 'Falta id de inscripción.' })
      return
    }
    const { progreso } = await readJson(req)
    const num = Math.min(100, Math.max(0, parseInt(progreso, 10) || 0))

    const pool = getPool()
    const r = await pool.query(
      'UPDATE inscripciones SET progreso = $1 WHERE id = $2 AND id_usuario = $3 RETURNING id',
      [num, idInscripcion, usuario.id]
    )
    if (r.rowCount === 0) {
      res.status(404).json({ error: 'Inscripción no encontrada o no tienes permiso.' })
      return
    }
    res.status(200).json({ ok: true })
  } catch (err) {
    res.status(err.statusCode || 503).json({ error: err.message || 'Error al actualizar progreso.' })
  }
}

