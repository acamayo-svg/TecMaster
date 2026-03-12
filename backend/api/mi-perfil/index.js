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
    const { fotoPerfil, nombre } = await readJson(req)
    const pool = getPool()
    let actualizado = null

    if (fotoPerfil !== undefined) {
      const r = await pool.query(
        'UPDATE usuarios SET foto_perfil = $1 WHERE id = $2 RETURNING id, nombre, correo, token, foto_perfil',
        [fotoPerfil || null, usuario.id]
      )
      actualizado = r.rows?.[0] || null
      if (!actualizado) {
        res.status(500).json({ error: 'Error al actualizar foto.' })
        return
      }
    }

    if (nombre !== undefined) {
      if (!String(nombre).trim()) {
        res.status(400).json({ error: 'El nombre no puede estar vacío.' })
        return
      }
      const r = await pool.query(
        'UPDATE usuarios SET nombre = $1 WHERE id = $2 RETURNING id, nombre, correo, token, foto_perfil',
        [String(nombre).trim(), usuario.id]
      )
      actualizado = r.rows?.[0] || null
      if (!actualizado) {
        res.status(500).json({ error: 'Error al actualizar nombre.' })
        return
      }
    }

    if (!actualizado) {
      res.status(400).json({ error: 'Indica fotoPerfil o nombre para actualizar.' })
      return
    }

    res.status(200).json({
      usuario: {
        id: actualizado.id,
        nombre: actualizado.nombre,
        correo: actualizado.correo,
        token: actualizado.token,
        fotoPerfil: actualizado.foto_perfil || null,
      },
    })
  } catch (err) {
    res.status(err.statusCode || 503).json({ error: err.message || 'Error al actualizar perfil.' })
  }
}

