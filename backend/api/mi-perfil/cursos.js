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
      `SELECT i.id, i.id_usuario, i.id_curso, i.nombre_curso, i.estado, i.progreso,
              i.id_certificado, i.fecha_inscripcion, i.fecha_aprobacion,
              i.hash_genesis, i.hash_inscripcion, i.hash_curso_completado,
              c.imagen AS imagen_curso
       FROM inscripciones i
       LEFT JOIN cursos c ON c.id = i.id_curso
       WHERE i.id_usuario = $1
       ORDER BY i.fecha_inscripcion DESC`,
      [usuario.id]
    )
    res.status(200).json(
      r.rows.map((fila) => ({
        id: fila.id,
        idUsuario: fila.id_usuario,
        idCurso: fila.id_curso,
        nombreCurso: fila.nombre_curso,
        estado: fila.estado,
        progreso: fila.progreso ?? 0,
        idCertificado: fila.id_certificado,
        fechaInscripcion: fila.fecha_inscripcion,
        fechaAprobacion: fila.fecha_aprobacion,
        imagenCurso: fila.imagen_curso || null,
        hashGenesis: fila.hash_genesis || null,
        hashInscripcion: fila.hash_inscripcion || null,
        hashCursoCompletado: fila.hash_curso_completado || null,
      }))
    )
  } catch (err) {
    res.status(err.statusCode || 503).json({ error: err.message || 'Error al cargar tus cursos' })
  }
}

