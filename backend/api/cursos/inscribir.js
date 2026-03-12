import { applyCors, handleOptions } from '../_cors.js'
import { getPool } from '../_db.js'
import { requireAuth } from '../_auth.js'
import { calcularHashGenesis, calcularHashInscripcion } from '../../servidor/cadenaCertificados.js'

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
    const { idCurso } = await readJson(req)
    if (!idCurso) {
      res.status(400).json({ error: 'Falta idCurso.' })
      return
    }

    const pool = getPool()
    const cursoRes = await pool.query(
      'SELECT id, nombre FROM cursos WHERE id = $1',
      [String(idCurso)]
    )
    const curso = cursoRes.rows?.[0]
    if (!curso) {
      res.status(404).json({ error: 'Curso no encontrado.' })
      return
    }

    const ya = await pool.query(
      'SELECT 1 FROM inscripciones WHERE id_usuario = $1 AND id_curso = $2 LIMIT 1',
      [usuario.id, String(idCurso)]
    )
    if (ya.rows.length > 0) {
      res.status(409).json({ error: 'Ya estás inscrito en este curso.' })
      return
    }

    const id = `insc-${Date.now()}`
    const fechaInscripcion = new Date().toISOString().slice(0, 10)
    const hashGenesis = calcularHashGenesis(usuario.nombre, usuario.id, String(idCurso), fechaInscripcion)
    const hashInscripcion = calcularHashInscripcion(id, fechaInscripcion, hashGenesis)

    await pool.query(
      `INSERT INTO inscripciones (id, id_usuario, id_curso, nombre_curso, estado, progreso, fecha_inscripcion, hash_genesis, hash_inscripcion)
       VALUES ($1, $2, $3, $4, 'inscrito', 0, $5, $6, $7)`,
      [id, usuario.id, String(idCurso), curso.nombre, fechaInscripcion, hashGenesis, hashInscripcion]
    )

    res.status(201).json({
      id,
      idUsuario: usuario.id,
      idCurso: String(idCurso),
      nombreCurso: curso.nombre,
      estado: 'inscrito',
      progreso: 0,
      idCertificado: null,
      fechaInscripcion,
    })
  } catch (err) {
    res.status(err.statusCode || 503).json({ error: err.message || 'Error al inscribirse' })
  }
}

