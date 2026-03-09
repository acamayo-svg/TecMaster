import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiVerificarCertificado } from '../utilidades/api'
import Boton from '../componentes/Boton'
import CampoFormulario from '../componentes/CampoFormulario'
import Tarjeta from '../componentes/Tarjeta'
import '../estilos/ConsultarCertificado.css'

export default function ConsultarCertificado() {
  const [searchParams] = useSearchParams()
  const codigoInicial = searchParams.get('codigo') || ''
  const [codigo, establecerCodigo] = useState(codigoInicial)
  const [resultado, establecerResultado] = useState(null)
  const [busquedaRealizada, establecerBusquedaRealizada] = useState(false)
  const [cargando, establecerCargando] = useState(false)

  useEffect(() => {
    if (codigoInicial && codigoInicial.trim()) {
      establecerCodigo(codigoInicial.trim())
    }
  }, [codigoInicial])

  const manejarEnvio = async (e) => {
    e.preventDefault()
    establecerBusquedaRealizada(false)
    establecerResultado(null)
    if (!codigo.trim()) return

    establecerCargando(true)
    try {
      const datos = await apiVerificarCertificado(codigo)
      establecerResultado(datos)
      establecerBusquedaRealizada(true)
    } catch {
      establecerResultado({ valido: false })
      establecerBusquedaRealizada(true)
    } finally {
      establecerCargando(false)
    }
  }

  return (
    <div className="consultar-certificado">
      <Tarjeta className="consultar-certificado__tarjeta">
        <h1 className="consultar-certificado__titulo">Consultar certificado</h1>
        <p className="consultar-certificado__subtitulo">
          Introduce el código de verificación que aparece en el certificado del candidato.
        </p>
        <form onSubmit={manejarEnvio} className="consultar-certificado__formulario">
          <CampoFormulario
            etiqueta="Código de verificación"
            nombre="codigo"
            valor={codigo}
            onChange={(e) => establecerCodigo(e.target.value)}
            placeholder="Ej: CERT-2024-001-X7K9"
            requerido
          />
          <Boton tipo="submit" variante="primario" tamano="grande" className="consultar-certificado__boton" deshabilitado={cargando}>
            {cargando ? 'Verificando…' : 'Verificar'}
          </Boton>
        </form>
      </Tarjeta>

      {busquedaRealizada && resultado !== null && (
        <Tarjeta className={`consultar-certificado__resultado consultar-certificado__resultado--${resultado.valido ? 'valido' : 'invalido'}`}>
          <h2 className="consultar-certificado__resultado-titulo">
            {resultado.valido ? 'Certificado válido' : 'Certificado no encontrado'}
          </h2>
          {resultado.valido ? (
            <>
              <dl className="consultar-certificado__lista-datos">
                <dt>Titular</dt>
                <dd>{resultado.nombreCompleto}</dd>
                <dt>Curso</dt>
                <dd>{resultado.nombreCurso}</dd>
                <dt>Fecha de emisión</dt>
                <dd>{resultado.fechaEmision}</dd>
                <dt>Código</dt>
                <dd><strong>{resultado.codigoVerificacion}</strong></dd>
                {resultado.hashCertificado != null && (
                  <>
                    <dt>Cadena de bloques</dt>
                    <dd>{resultado.cadenaValida ? 'Válida (certificado respaldado por la cadena)' : 'No validada'}</dd>
                  </>
                )}
              </dl>
              {resultado.cadena && resultado.cadena.length > 0 && (
                <section className="consultar-certificado__cadena">
                  <h3 className="consultar-certificado__cadena-titulo">Cadena de hashes (log)</h3>
                  <div className="consultar-certificado__cadena-log">
                    {resultado.cadena.map((bloque) => (
                      <div key={bloque.paso} className="consultar-certificado__cadena-bloque">
                        <div className="consultar-certificado__cadena-etiqueta">{bloque.etiqueta}</div>
                        <div className="consultar-certificado__cadena-descripcion">{bloque.descripcionDatos}</div>
                        <div className="consultar-certificado__cadena-datos">
                          <span className="consultar-certificado__cadena-datos-label">Texto hasheado:</span>
                          <code>{bloque.datos}</code>
                        </div>
                        <div className="consultar-certificado__cadena-hash">
                          <span className="consultar-certificado__cadena-hash-label">Hash:</span>
                          <code>{bloque.hash}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <p className="consultar-certificado__resultado-texto">
              No existe un certificado con ese código. Comprueba que lo has escrito correctamente.
            </p>
          )}
        </Tarjeta>
      )}

      <p className="consultar-certificado__volver">
        <Link to="/empresas">← Volver a verificación</Link>
      </p>
    </div>
  )
}
