import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexto/AuthContext'
import { apiMisCursos, apiMisCertificados } from '../utilidades/api'
import Boton from '../componentes/Boton'
import CarruselMisCursos from '../componentes/CarruselMisCursos'
import '../estilos/AreaUsuario.css'

export default function AreaUsuario() {
  const { usuario } = useAuth()
  const [inscripciones, establecerInscripciones] = useState([])
  const [certificados, establecerCertificados] = useState([])
  const [cargando, establecerCargando] = useState(true)
  const [error, establecerError] = useState('')

  useEffect(() => {
    let cancelado = false
    async function cargar() {
      try {
        establecerCargando(true)
        establecerError('')
        const [cursosRes, certsRes] = await Promise.all([
          apiMisCursos(),
          apiMisCertificados(),
        ])
        if (!cancelado) {
          establecerInscripciones(Array.isArray(cursosRes) ? cursosRes : [])
          establecerCertificados(Array.isArray(certsRes) ? certsRes : [])
        }
      } catch (err) {
        if (!cancelado) establecerError(err.message || 'Error al cargar datos.')
      } finally {
        if (!cancelado) establecerCargando(false)
      }
    }
    cargar()
    return () => { cancelado = true }
  }, [])

  const listaInscripciones = Array.isArray(inscripciones) ? inscripciones : []
  const cursosEnProgreso = listaInscripciones.filter(
    (i) => i.estado === 'en_curso' || i.estado === 'inscrito'
  )
  const cursosAprobados = listaInscripciones.filter((i) => i.estado === 'aprobado')

  return (
    <div className="area-usuario">
      <header className="area-usuario__cabecera">
        <h1 className="area-usuario__titulo">Mi área</h1>
        <p className="area-usuario__saludo">
          Hola, {usuario?.nombre ?? usuario?.correo}. Aquí puedes ver tus cursos y certificados.
        </p>
      </header>

      {error && (
        <div className="area-usuario__error" role="alert">
          <strong>Error:</strong> {error} Asegúrate de tener el servidor en marcha (en la carpeta{' '}
          <code>servidor</code> ejecuta <code>npm run iniciar</code>).
        </div>
      )}

      <section className="area-usuario__seccion area-usuario__seccion--destacada">
        <div className="area-usuario__seccion-cabecera">
          <h2 className="area-usuario__seccion-titulo">Inscribirse a un curso</h2>
          <Link to="/inscripcion-curso">
            <Boton variante="primario">Inscribirme</Boton>
          </Link>
        </div>
        <p className="area-usuario__seccion-descripcion">
          Elige un curso, inscríbete y cuando lo completes podrás aprobarlo y obtener tu certificado.
        </p>
      </section>

      {cargando ? (
        <div className="area-usuario__cargando">
          <p>Cargando tus cursos y certificados…</p>
        </div>
      ) : (
        <>
          <section className="area-usuario__seccion">
            <h2 className="area-usuario__seccion-titulo area-usuario__seccion-titulo--carrusel">
              Mis cursos
            </h2>
            {cursosEnProgreso.length === 0 ? (
              <p className="area-usuario__sin-cursos">
                Aún no estás inscrito en ningún curso. Inscríbete desde el botón de arriba.
              </p>
            ) : (
              <CarruselMisCursos
                titulo="En progreso"
                inscripciones={cursosEnProgreso}
                esCertificados={false}
              />
            )}
          </section>

          <section className="area-usuario__seccion">
            <h2 className="area-usuario__seccion-titulo area-usuario__seccion-titulo--carrusel">
              Certificados obtenidos
            </h2>
            {cursosAprobados.length === 0 ? (
              <p className="area-usuario__sin-certificados">
                Aún no tienes certificados. Aprueba un curso para obtener el primero.
              </p>
            ) : (
              <CarruselMisCursos
                titulo="Completados"
                inscripciones={cursosAprobados}
                esCertificados
              />
            )}
          </section>
        </>
      )}
    </div>
  )
}
