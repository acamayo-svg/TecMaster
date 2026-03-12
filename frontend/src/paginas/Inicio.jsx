import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexto/AuthContext'
import { apiCursosDisponibles } from '../utilidades/api'
import Boton from '../componentes/Boton'
import CarruselCursos from '../componentes/CarruselCursos'
import '../estilos/Inicio.css'

const ORDEN_CATEGORIAS = ['Desarrollo', 'Ciberseguridad', 'Soporte técnico', 'Redes', 'General']

export default function Inicio() {
  const { estaAutenticado } = useAuth()
  const [cursos, establecerCursos] = useState([])
  const [cargandoCursos, establecerCargandoCursos] = useState(true)

  useEffect(() => {
    apiCursosDisponibles()
      .then((lista) => establecerCursos(Array.isArray(lista) ? lista : []))
      .catch(() => establecerCursos([]))
      .finally(() => establecerCargandoCursos(false))
  }, [])

  const cursosPorCategoria = ORDEN_CATEGORIAS.reduce((acc, cat) => {
    const filtrados = cursos.filter((c) => (c.categoria || 'General') === cat)
    if (filtrados.length > 0) acc.push({ categoria: cat, cursos: filtrados })
    return acc
  }, [])

  const otros = cursos.filter((c) => !ORDEN_CATEGORIAS.includes(c.categoria || 'General'))
  if (otros.length > 0) {
    cursosPorCategoria.push({ categoria: 'Otros', cursos: otros })
  }

  return (
    <div className="inicio">
      <section className="inicio__hero">
        <div className="inicio__hero-video-wrap">
          <video
            className="inicio__hero-video"
            src="https://videos.pexels.com/video-files/11812964/11812964-hd_1920_1080_25fps.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="inicio__hero-overlay" />
        </div>
        <div className="inicio__hero-contenido">
          <h1 className="inicio__titulo">
            Cursos de <em>tecnología</em> con certificado
          </h1>
          <p className="inicio__subtitulo">
            Desarrollo, ciberseguridad, soporte técnico y redes. Aprende, aprueba y obtén tu certificado verificable.
          </p>
          <div className="inicio__acciones">
            {estaAutenticado ? (
              <Link to="/area-usuario">
                <Boton variante="primario" tamano="grande">Ir a mi área</Boton>
              </Link>
            ) : (
              <>
                <Link to="/registro">
                  <Boton variante="primario" tamano="grande">Comenzar ahora</Boton>
                </Link>
                <Link to="/iniciar-sesion">
                  <Boton variante="secundario" tamano="grande">Iniciar sesión</Boton>
                </Link>
              </>
            )}
            <Link to="/empresas" className="inicio__enlace-empresas">
              ¿Eres empresa? Verificar certificados
            </Link>
          </div>
        </div>
      </section>

      <section className="inicio__cursos">
        <div className="inicio__cursos-intro">
          <h2 className="inicio__cursos-titulo">Cursos que ofrecemos</h2>
          <p className="inicio__cursos-texto">
            Formación en tecnología con enfoque práctico. Inscríbete, completa el curso y obtén tu certificado.
          </p>
        </div>

        {cargandoCursos ? (
          <p className="inicio__cargando">Cargando cursos…</p>
        ) : cursosPorCategoria.length > 0 ? (
          cursosPorCategoria.map(({ categoria, cursos: lista }) => (
            <CarruselCursos key={categoria} titulo={categoria} cursos={lista} />
          ))
        ) : (
          <div className="inicio__bloques">
            <div className="inicio__bloque">
              <span className="inicio__bloque-icono">💻</span>
              <h2 className="inicio__bloque-titulo">Desarrollo</h2>
              <p className="inicio__bloque-texto">
                Cursos de programación web, JavaScript, React y Node.js.
              </p>
            </div>
            <div className="inicio__bloque">
              <span className="inicio__bloque-icono">🔐</span>
              <h2 className="inicio__bloque-titulo">Ciberseguridad</h2>
              <p className="inicio__bloque-texto">
                Ethical hacking, pentesting y seguridad ofensiva.
              </p>
            </div>
            <div className="inicio__bloque">
              <span className="inicio__bloque-icono">🛠️</span>
              <h2 className="inicio__bloque-titulo">Soporte técnico</h2>
              <p className="inicio__bloque-texto">
                Help desk, administración de sistemas y resolución de incidencias.
              </p>
            </div>
            <div className="inicio__bloque">
              <span className="inicio__bloque-icono">🌐</span>
              <h2 className="inicio__bloque-titulo">Redes</h2>
              <p className="inicio__bloque-texto">
                TCP/IP, infraestructura y fundamentos de redes.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
