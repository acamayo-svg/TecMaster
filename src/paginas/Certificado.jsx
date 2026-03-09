import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexto/AuthContext'
import { apiCertificadoPorId } from '../utilidades/api'
import Boton from '../componentes/Boton'
import CertificadoDocumento from '../componentes/CertificadoDocumento'
import '../estilos/Certificado.css'

export default function Certificado() {
  const { idCertificado } = useParams()
  const { usuario } = useAuth()
  const [certificado, establecerCertificado] = useState(null)
  const [cargando, establecerCargando] = useState(true)

  useEffect(() => {
    let cancelado = false
    apiCertificadoPorId(idCertificado)
      .then((datos) => { if (!cancelado) establecerCertificado(datos) })
      .catch(() => { if (!cancelado) establecerCertificado(null) })
      .finally(() => { if (!cancelado) establecerCargando(false) })
    return () => { cancelado = true }
  }, [idCertificado])

  if (cargando) {
    return <div className="certificado"><p className="certificado__cargando">Cargando certificado…</p></div>
  }

  if (!certificado || !certificado.valido) {
    return (
      <div className="certificado certificado--no-encontrado">
        <p>Certificado no encontrado o no tienes acceso.</p>
        <Link to="/area-usuario"><Boton variante="secundario">Volver a mi área</Boton></Link>
      </div>
    )
  }

  const nombreMostrar = certificado.nombreCompleto || usuario?.nombre || 'Usuario'

  return (
    <div className="certificado">
      <div className="certificado__doc-wrap">
        <CertificadoDocumento
          nombreCompleto={nombreMostrar}
          cedula={certificado.idUsuario}
          nombreCurso={certificado.nombreCurso}
          fechaEmision={certificado.fechaEmision}
          codigoVerificacion={certificado.codigoVerificacion}
          hashCertificado={certificado.hashCertificado}
        />
      </div>
      <div className="certificado__acciones">
        <button
          type="button"
          className="certificado__boton-imprimir"
          onClick={() => window.print()}
          title="Abre el cuadro de impresión; elige «Guardar como PDF» para descargar"
        >
          Descargar PDF / Imprimir
        </button>
        <Link to="/area-usuario">
          <Boton variante="secundario">Volver a mi área</Boton>
        </Link>
      </div>
    </div>
  )
}
