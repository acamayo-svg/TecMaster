import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexto/AuthContext'
import { obtenerImagenCurso } from '../utilidades/imagenesCursos'
import Boton from './Boton'
import '../estilos/CarruselCursos.css'

export default function CarruselCursos({ titulo, cursos }) {
  const ref = useRef(null)
  const { estaAutenticado } = useAuth()

  const desplazar = (direccion) => {
    if (!ref.current) return
    const paso = 340
    ref.current.scrollBy({ left: direccion === 'next' ? paso : -paso, behavior: 'smooth' })
  }

  if (!cursos || cursos.length === 0) return null

  return (
    <section className="carrusel-cursos">
      <div className="carrusel-cursos__cabecera">
        <h2 className="carrusel-cursos__titulo">{titulo}</h2>
        <div className="carrusel-cursos__flechas">
          <button type="button" className="carrusel-cursos__flecha" onClick={() => desplazar('prev')} aria-label="Anterior">‹</button>
          <button type="button" className="carrusel-cursos__flecha" onClick={() => desplazar('next')} aria-label="Siguiente">›</button>
        </div>
      </div>
      <div className="carrusel-cursos__contenedor" ref={ref}>
        {cursos.map((curso) => (
          <article key={curso.id} className="carrusel-cursos__tarjeta">
            <div className="carrusel-cursos__tarjeta-imagen-wrap">
              <img
                src={obtenerImagenCurso(curso)}
                alt=""
                className="carrusel-cursos__tarjeta-imagen"
              />
              <span className="carrusel-cursos__categoria">{curso.categoria || 'Curso'}</span>
            </div>
            <div className="carrusel-cursos__tarjeta-cuerpo">
              <h3 className="carrusel-cursos__nombre">{curso.nombre}</h3>
              <p className="carrusel-cursos__duracion">{curso.duracion}</p>
              <p className="carrusel-cursos__descripcion">{curso.descripcion}</p>
            </div>
            <div className="carrusel-cursos__tarjeta-pie">
              {estaAutenticado ? (
                <Link to="/inscripcion-curso">
                  <Boton variante="primario" tamano="normal">Inscribirme</Boton>
                </Link>
              ) : (
                <Link to="/registro">
                  <Boton variante="primario" tamano="normal">Ver curso</Boton>
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
