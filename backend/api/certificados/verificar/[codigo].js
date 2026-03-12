import { applyCors, handleOptions } from '../../_cors.js'
import { getPool } from '../../_db.js'
import { obtenerDetalleCadena, validarCadenaCertificado } from '../../../servidor/cadenaCertificados.js'

export default async function handler(req, res) {
  applyCors(req, res)
  if (handleOptions(req, res)) return

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método no permitido' })
    return
  }

  try {
    const codigo = String(req.query?.codigo || '').trim().toUpperCase()
    const pool = getPool()
    const certRes = await pool.query(
      `SELECT id, id_inscripcion, id_usuario, nombre_curso, codigo_verificacion, fecha_emision, hash_certificado
       FROM certificados
       WHERE UPPER(codigo_verificacion) = $1`,
      [codigo]
    )
    const cert = certRes.rows?.[0]
    if (!cert) {
      res.status(200).json({ valido: false })
      return
    }

    const nomRes = await pool.query('SELECT nombre FROM usuarios WHERE id = $1', [cert.id_usuario])
    const nombreCompleto = nomRes.rows?.[0]?.nombre || null

    let cadenaValida = false
    let cadena = []
    if (cert.hash_certificado) {
      const insRes = await pool.query(
        `SELECT id, id_usuario, id_curso, nombre_curso, fecha_inscripcion, fecha_aprobacion, hash_genesis, hash_inscripcion, hash_curso_completado
         FROM inscripciones WHERE id = $1`,
        [cert.id_inscripcion]
      )
      const ins = insRes.rows?.[0]
      if (ins && nombreCompleto) {
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
        const resultado = validarCadenaCertificado(inscripcion, certificado, nombreCompleto)
        cadenaValida = resultado.valido
        cadena = obtenerDetalleCadena(inscripcion, certificado, nombreCompleto)
      }
    }

    res.status(200).json({
      valido: true,
      id: cert.id,
      nombreCompleto,
      nombreCurso: cert.nombre_curso,
      fechaEmision: cert.fecha_emision,
      codigoVerificacion: cert.codigo_verificacion,
      hashCertificado: cert.hash_certificado || null,
      cadenaValida,
      cadena,
    })
  } catch (err) {
    res.status(503).json({ error: 'Error al verificar', detalle: err.message || String(err) })
  }
}

