import { applyCors, handleOptions } from '../../../_cors.js'
import { getPool } from '../../../_db.js'
import { requireAuth } from '../../../_auth.js'
import { calcularHashCursoCompletado, calcularHashCertificado } from '../../../../servidor/cadenaCertificados.js'

export default async function handler(req, res) {
  applyCors(req, res)
  if (handleOptions(req, res)) return

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' })
    return
  }

  try {
    const usuario = await requireAuth(req)
    const idCurso = req.query?.idCurso || req.query?.idcurso || req.query?.[0] || req.query?.id
    const idCursoStr = String(idCurso || '').trim()
    if (!idCursoStr) {
      res.status(400).json({ error: 'Falta idCurso.' })
      return
    }

    const pool = getPool()

    const insRes = await pool.query(
      `SELECT id, id_curso, nombre_curso, estado, progreso, id_certificado, fecha_inscripcion, hash_inscripcion
       FROM inscripciones
       WHERE id_usuario = $1 AND id_curso = $2
       ORDER BY fecha_inscripcion DESC
       LIMIT 1`,
      [usuario.id, idCursoStr]
    )
    const ins = insRes.rows?.[0]
    if (!ins) {
      res.status(404).json({ error: 'No estás inscrito en este curso.' })
      return
    }

    if (ins.estado === 'aprobado' && ins.id_certificado) {
      const certRes = await pool.query(
        `SELECT id, id_inscripcion, id_usuario, nombre_curso, codigo_verificacion, fecha_emision, hash_certificado
         FROM certificados WHERE id = $1`,
        [ins.id_certificado]
      )
      const cert = certRes.rows?.[0]
      res.status(200).json({
        inscripcion: {
          id: ins.id,
          idUsuario: usuario.id,
          idCurso: ins.id_curso,
          nombreCurso: ins.nombre_curso,
          estado: ins.estado,
          progreso: ins.progreso ?? 0,
          idCertificado: ins.id_certificado,
          fechaInscripcion: ins.fecha_inscripcion,
        },
        certificado: cert
          ? {
              id: cert.id,
              idInscripcion: cert.id_inscripcion,
              idUsuario: cert.id_usuario,
              nombreCurso: cert.nombre_curso,
              codigoVerificacion: cert.codigo_verificacion,
              fechaEmision: cert.fecha_emision,
              hashCertificado: cert.hash_certificado || null,
            }
          : null,
      })
      return
    }

    const fechaAprobacion = new Date().toISOString().slice(0, 10)
    const hashCursoCompletado = ins.hash_inscripcion
      ? calcularHashCursoCompletado(ins.id, fechaAprobacion, ins.hash_inscripcion)
      : null

    const countRes = await pool.query('SELECT COUNT(*)::int AS n FROM certificados')
    const numCert = (countRes.rows?.[0]?.n || 0) + 1
    const codigoVerificacion = `CERT-${new Date().getFullYear()}-${String(numCert).padStart(3, '0')}-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`

    const idCertificado = `cert-${idCursoStr}-${Date.now()}`
    const hashCertificado = hashCursoCompletado
      ? calcularHashCertificado(idCertificado, codigoVerificacion, fechaAprobacion, hashCursoCompletado)
      : null

    await pool.query(
      `UPDATE inscripciones
       SET estado = 'aprobado', progreso = 100, id_certificado = $1, fecha_aprobacion = $2, hash_curso_completado = $3
       WHERE id = $4 AND id_usuario = $5`,
      [idCertificado, fechaAprobacion, hashCursoCompletado, ins.id, usuario.id]
    )
    await pool.query(
      `INSERT INTO certificados (id, id_inscripcion, id_usuario, nombre_curso, codigo_verificacion, fecha_emision, hash_certificado)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [idCertificado, ins.id, usuario.id, ins.nombre_curso, codigoVerificacion, fechaAprobacion, hashCertificado]
    )

    res.status(200).json({
      inscripcion: {
        id: ins.id,
        idUsuario: usuario.id,
        idCurso: idCursoStr,
        nombreCurso: ins.nombre_curso,
        estado: 'aprobado',
        progreso: 100,
        idCertificado,
        fechaInscripcion: ins.fecha_inscripcion,
        fechaAprobacion,
        hashCursoCompletado,
      },
      certificado: {
        id: idCertificado,
        idInscripcion: ins.id,
        idUsuario: usuario.id,
        nombreCurso: ins.nombre_curso,
        codigoVerificacion,
        fechaEmision: fechaAprobacion,
        hashCertificado,
      },
    })
  } catch (err) {
    res.status(err.statusCode || 503).json({ error: err.message || 'Error al aprobar' })
  }
}

