import crypto from 'crypto'

/**
 * Cadena de bloques para validar certificados (estilo blockchain).
 * Cada bloque incluye datos y el hash del bloque anterior; el hash propio se calcula
 * a partir de: índice + fecha + datos + hashAnterior.
 *
 * Bloques:
 * 0 - Genesis: nombre completo + cédula + id_curso + fecha
 * 1 - Inscripción: id_inscripcion + fecha_inscripcion + hash_genesis
 * 2 - Curso completado: id_inscripcion + fecha_aprobacion + progreso 100 + hash_inscripcion
 * 3 - Certificado: id_certificado + codigo_verificacion + fecha_emision + hash_curso_completado
 */

function sha256(texto) {
  return crypto.createHash('sha256').update(String(texto), 'utf8').digest('hex')
}

/** Normaliza fecha a YYYY-MM-DD para que el hash coincida (al crear usamos solo la fecha, no la hora) */
function fechaAYYYYMMDD(val) {
  if (val == null || val === '') return ''
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val
  try {
    const d = new Date(val)
    if (Number.isNaN(d.getTime())) return String(val)
    return d.toISOString().slice(0, 10)
  } catch {
    return String(val)
  }
}

/** Bloque 0: datos del titular y curso (genesis) */
export function calcularHashGenesis(nombreCompleto, cedula, idCurso, fecha) {
  const datos = [nombreCompleto, cedula, idCurso, fecha].join('|')
  return sha256(`0|${datos}|`)
}

/** Bloque 1: inscripción al curso */
export function calcularHashInscripcion(idInscripcion, fechaInscripcion, hashAnterior) {
  const datos = [idInscripcion, fechaInscripcion].join('|')
  return sha256(`1|${datos}|${hashAnterior}`)
}

/** Bloque 2: curso completado (aprobación) */
export function calcularHashCursoCompletado(idInscripcion, fechaAprobacion, hashAnterior) {
  const datos = [idInscripcion, fechaAprobacion, '100'].join('|')
  return sha256(`2|${datos}|${hashAnterior}`)
}

/** Bloque 3: emisión del certificado */
export function calcularHashCertificado(idCertificado, codigoVerificacion, fechaEmision, hashAnterior) {
  const datos = [idCertificado, codigoVerificacion, fechaEmision].join('|')
  return sha256(`3|${datos}|${hashAnterior}`)
}

/**
 * Valida que la cadena de hashes del certificado sea coherente con los datos guardados.
 * Recalcula cada hash y compara con el almacenado.
 * @param {Object} inscripcion - { id, idUsuario, idCurso, nombreCurso, fechaInscripcion, fechaAprobacion, hashGenesis, hashInscripcion, hashCursoCompletado }
 * @param {Object} certificado - { id, codigoVerificacion, fechaEmision, hashCertificado }
 * @param {string} nombreCompleto - nombre del titular
 * @returns {{ valido: boolean, detalle?: string }}
 */
export function validarCadenaCertificado(inscripcion, certificado, nombreCompleto) {
  if (!inscripcion || !certificado) {
    return { valido: false, detalle: 'Faltan inscripción o certificado.' }
  }
  const cedula = inscripcion.idUsuario
  const idCurso = inscripcion.idCurso
  const fechaInsc = fechaAYYYYMMDD(inscripcion.fechaInscripcion)
  const fechaAprob = fechaAYYYYMMDD(inscripcion.fechaAprobacion)
  const idInsc = inscripcion.id
  const idCert = certificado.id
  const codigo = certificado.codigoVerificacion
  const fechaCert = fechaAYYYYMMDD(certificado.fechaEmision)

  if (!inscripcion.hashGenesis || !inscripcion.hashInscripcion || !inscripcion.hashCursoCompletado || !certificado.hashCertificado) {
    return { valido: false, detalle: 'Faltan hashes en la cadena (certificado o inscripción anterior a la cadena de bloques).' }
  }

  const h0 = calcularHashGenesis(nombreCompleto, cedula, idCurso, fechaInsc)
  if (h0 !== inscripcion.hashGenesis) {
    return { valido: false, detalle: 'Hash genesis no coincide.' }
  }

  const h1 = calcularHashInscripcion(idInsc, fechaInsc, h0)
  if (h1 !== inscripcion.hashInscripcion) {
    return { valido: false, detalle: 'Hash inscripción no coincide.' }
  }

  const h2 = calcularHashCursoCompletado(idInsc, fechaAprob, h1)
  if (h2 !== inscripcion.hashCursoCompletado) {
    return { valido: false, detalle: 'Hash curso completado no coincide.' }
  }

  const h3 = calcularHashCertificado(idCert, codigo, fechaCert, h2)
  if (h3 !== certificado.hashCertificado) {
    return { valido: false, detalle: 'Hash certificado no coincide.' }
  }

  return { valido: true }
}

/**
 * Devuelve la cadena de hashes completa para mostrar como log (etiqueta + datos + hash por paso).
 * Solo incluye pasos que existan en inscripción/certificado.
 * @returns {Array<{ paso: number, etiqueta: string, descripcionDatos: string, datos: string, hash: string }>}
 */
export function obtenerDetalleCadena(inscripcion, certificado, nombreCompleto) {
  const pasos = []
  if (!inscripcion || !certificado) return pasos

  const cedula = inscripcion.idUsuario
  const idCurso = inscripcion.idCurso
  const fechaInsc = fechaAYYYYMMDD(inscripcion.fechaInscripcion)
  const fechaAprob = fechaAYYYYMMDD(inscripcion.fechaAprobacion)
  const idInsc = inscripcion.id
  const idCert = certificado.id
  const codigo = certificado.codigoVerificacion
  const fechaCert = fechaAYYYYMMDD(certificado.fechaEmision)

  if (inscripcion.hashGenesis) {
    const datos = `0|${nombreCompleto}|${cedula}|${idCurso}|${fechaInsc}|`
    pasos.push({
      paso: 0,
      etiqueta: 'Bloque 0 — Genesis',
      descripcionDatos: 'Nombre completo + cédula + id_curso + fecha de inscripción',
      datos,
      hash: inscripcion.hashGenesis,
    })
  }

  if (inscripcion.hashInscripcion) {
    const h0 = pasos.length ? calcularHashGenesis(nombreCompleto, cedula, idCurso, fechaInsc) : inscripcion.hashGenesis
    const datos = `1|${idInsc}|${fechaInsc}|${h0}`
    pasos.push({
      paso: 1,
      etiqueta: 'Bloque 1 — Inscripción al curso',
      descripcionDatos: 'id_inscripcion + fecha_inscripcion + hash_anterior (genesis)',
      datos,
      hash: inscripcion.hashInscripcion,
    })
  }

  if (inscripcion.hashCursoCompletado) {
    const h1 = inscripcion.hashInscripcion
    const datos = `2|${idInsc}|${fechaAprob}|100|${h1}`
    pasos.push({
      paso: 2,
      etiqueta: 'Bloque 2 — Curso completado',
      descripcionDatos: 'id_inscripcion + fecha_aprobación + progreso 100 + hash_anterior (inscripción)',
      datos,
      hash: inscripcion.hashCursoCompletado,
    })
  }

  if (certificado.hashCertificado) {
    const h2 = inscripcion.hashCursoCompletado
    const datos = `3|${idCert}|${codigo}|${fechaCert}|${h2}`
    pasos.push({
      paso: 3,
      etiqueta: 'Bloque 3 — Emisión del certificado',
      descripcionDatos: 'id_certificado + codigo_verificacion + fecha_emision + hash_anterior (curso completado)',
      datos,
      hash: certificado.hashCertificado,
    })
  }

  return pasos
}
