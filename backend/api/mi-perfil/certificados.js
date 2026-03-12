import { applyCors, handleOptions } from '../_cors.js'
import { getPool } from '../_db.js'
import { requireAuth } from '../_auth.js'

export default async function handler(req, res) {
  applyCors(req, res)
  if (handleOptions(req, res)) return

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método no permitido' })
    return
  }

  try {
    const usuario = await requireAuth(req)
    const pool = getPool()
    const r = await pool.query(
      `SELECT id, id_inscripcion, id_usuario, nombre_curso, codigo_verificacion, fecha_emision, hash_certificado
       FROM certificados
       WHERE id_usuario = $1
       ORDER BY fecha_emision DESC`,
      [usuario.id]
    )
    res.status(200).json(
      r.rows.map((fila) => ({
        id: fila.id,
        idInscripcion: fila.id_inscripcion,
        idUsuario: fila.id_usuario,
        nombreCurso: fila.nombre_curso,
        codigoVerificacion: fila.codigo_verificacion,
        fechaEmision: fila.fecha_emision,
        hashCertificado: fila.hash_certificado || null,
      }))
    )
  } catch (err) {
    res.status(err.statusCode || 503).json({ error: err.message || 'Error al cargar certificados' })
  }
}

