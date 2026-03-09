import '../estilos/CertificadoDocumento.css'

function formatearFecha(iso) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    const dia = d.getDate()
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
    const mes = meses[d.getMonth()]
    const anio = d.getFullYear()
    return `${dia} de ${mes} de ${anio}`
  } catch {
    return iso
  }
}

/**
 * Documento del certificado (mismo diseño que el prototipo).
 * Usado en la vista del certificado y al imprimir/guardar PDF.
 * Logo: coloca Logo.jpg en public/ para que se vea en /Logo.jpg
 */
export default function CertificadoDocumento({
  nombreCompleto,
  cedula,
  nombreCurso,
  fechaEmision,
  codigoVerificacion,
  hashCertificado,
}) {
  const urlVerificacion =
    typeof window !== 'undefined'
      ? `${window.location.origin}/empresas/consultar?codigo=${encodeURIComponent(codigoVerificacion || '')}`
      : ''
  const qrSrc = urlVerificacion
    ? `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(urlVerificacion)}`
    : ''

  return (
    <div className="cert-doc">
      <div className="cert-doc__logo-wrap">
        <img src="/Logo.jpg" alt="Tec Master" />
      </div>
      <p className="cert-doc__intro">Hace constar que</p>
      <p className="cert-doc__nombre">{nombreCompleto || '—'}</p>
      <p className="cert-doc__cedula">
        Con Cédula de Ciudadanía No. {cedula || '—'}
      </p>
      <p className="cert-doc__texto-aprobo">
        Aprobó el curso <strong>{nombreCurso || '—'}</strong> y cumplió con las
        condiciones requeridas por la entidad.
      </p>
      <p className="cert-doc__fecha">Emitido el {formatearFecha(fechaEmision)}</p>
      <p className="cert-doc__codigo">
        Código de verificación: {codigoVerificacion || '—'}
      </p>
      {hashCertificado && (
        <p className="cert-doc__hash">
          Hash (cadena de bloques): <span className="cert-doc__hash-valor">{hashCertificado}</span>
        </p>
      )}
      <p className="cert-doc__pie">
        Este certificado puede ser verificado en la plataforma Tec Master.
        <br />
        Válido como acreditación de finalización del curso.
      </p>
      {qrSrc && (
        <div className="cert-doc__qr-wrap">
          <img src={qrSrc} alt="QR verificación" />
          <span>Escanear para verificar</span>
        </div>
      )}
    </div>
  )
}
