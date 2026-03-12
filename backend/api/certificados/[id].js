import { applyCors, handleOptions } from '../_cors.js'
import { getPool } from '../_db.js'
import { requireAuth } from '../_auth.js'
import { obtenerDetalleCadena, validarCadenaCertificado } from '../../servidor/cadenaCertificados.js'

export default async function handler(req, res) {
  applyCors(req, res)
  if (handleOptions(req, res)) return

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método no permitido' })
    return
  }

  try {
    const usuario = await requireAuth(req)
    const id = String(req.query?.id || req.query?.[0] || '').trim()
    if (!id) {
      res.status(400).json({ error: 'Falta id de certificado.' })
      return
    }

    const pool = getPool()
    const certRes = await pool.query(
      `SELECT id, id_inscripcion, id_usuario, nombre_curso, codigo_verificacion, fecha_emision, hash_certificado
       FROM certificados WHERE id = $1`,
      [id]
    )
    const cert = certRes.rows?.[0]
    if (!cert) {
      res.status(404).json({ error: 'Certificado no encontrado.' })
      return
    }
    if (cert.id_usuario !== usuario.id) {
      res.status(403).json({ error: 'No tienes acceso a este certificado.' })
      return
    }

    const nomRes = await pool.query('SELECT nombre FROM usuarios WHERE id = $1', [cert.id_usuario])
    const nombreCompleto = nomRes.rows?.[0]?.nombre || null

    let cadenaValida = false
    let cadena = []
    if (cert.hash_certificado && nombreCompleto) {
      const insRes = await pool.query(
        `SELECT id, id_usuario, id_curso, nombre_curso, fecha_inscripcion, fecha_aprobacion, hash_genesis, hash_inscripcion, hash_curso_completado
         FROM inscripciones WHERE id = $1`,
        [cert.id_inscripcion]
      )
      const ins = insRes.rows?.[0]
      if (ins) {
        const inscripcion = {
          id: ins.id,
          idUsuario: ins.id_usuario,
          idCurso: ins.id_curso,
          nombreCurso: ins.nombre_curso,
          fechaInscripcion: ins.fecha_inscripcion,
          fechaAprobacion: ins.fecha_aprobacion,
          hashGenesis: ins.hash_genesis,
          hashInscripcion: ins.hash_inscripcion,
          hashCursoCompletado: ins.hash_curso_completado,
        }
        const certificado = {
          id: cert.id,
          idInscripcion: cert.id_inscripcion,
          idUsuario: cert.id_usuario,
          nombreCurso: cert.nombre_curso,
          codigoVerificacion: cert.codigo_verificacion,
          fechaEmision: cert.fecha_emision,
          hashCertificado: cert.hash_certificado,
        }
        cadenaValida = validarCadenaCertificado(inscripcion, certificado, nombreCompleto)
        cadena = obtenerDetalleCadena(inscripcion, certificado, nombreCompleto)
      }
    }

    res.status(200).json({
      certificado: {
        id: cert.id,
        idInscripcion: cert.id_inscripcion,
        idUsuario: cert.id_usuario,
        nombreCurso: cert.nombre_curso,
        codigoVerificacion: cert.codigo_verificacion,
        fechaEmision: cert.fecha_emision,
        hashCertificado: cert.hash_certificado,
      },
      cadenaValida,
      cadena,
    })
  } catch (err) {
    res.status(err.statusCode || 503).json({ error: err.message || 'Error al obtener certificado.' })
  }
}

