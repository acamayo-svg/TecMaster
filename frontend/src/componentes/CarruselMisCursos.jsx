import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { obtenerImagenCurso } from '../utilidades/imagenesCursos'
import Boton from './Boton'
import '../estilos/CarruselMisCursos.css'

/**
 * Devuelve el color de la barra de progreso según el porcentaje:
 * 0-33% rojo, 34-66% naranja, 67-100% verde.
 */
function colorProgreso(porcentaje) {
  const p = Math.min(100, Math.max(0, Number(porcentaje) || 0))
  if (p < 34) return 'rojo'
  if (p < 67) return 'naranja'
  return 'verde'
}

export default function CarruselMisCursos({ titulo, inscripciones, esCertificados }) {
  const ref = useRef(null)

  const desplazar = (direccion) => {
    if (!ref.current) return
    const paso = 340
    ref.current.scrollBy({ left: direccion === 'next' ? paso : -paso, behavior: 'smooth' })
  }

  if (!inscripciones || inscripciones.length === 0) return null

  return (
    <section className="carrusel-mis-cursos">
      <div className="carrusel-mis-cursos__cabecera">
        <h2 className="carrusel-mis-cursos__titulo">{titulo}</h2>
        <div className="carrusel-mis-cursos__flechas">
          <button
            type="button"
            className="carrusel-mis-cursos__flecha"
            onClick={() => desplazar('prev')}
            aria-label="Anterior"
          >
            ‹
          </button>
          <button
            type="button"
            className="carrusel-mis-cursos__flecha"
            onClick={() => desplazar('next')}
            aria-label="Siguiente"
          >
            ›
          </button>
        </div>
      </div>
      <div className="carrusel-mis-cursos__contenedor" ref={ref}>
        {inscripciones.map((ins) => {
          const imagen = ins.imagenCurso || obtenerImagenCurso({ id: ins.idCurso })
          const progreso = esCertificados ? 100 : (ins.progreso ?? 0)
          const tipoColor = colorProgreso(progreso)
          return (
            <article key={ins.id} className="carrusel-mis-cursos__tarjeta">
              <div className="carrusel-mis-cursos__tarjeta-imagen-wrap">
                <img
                  src={imagen}
                  alt=""
                  className="carrusel-mis-cursos__tarjeta-imagen"
                />
                <div className="carrusel-mis-cursos__tarjeta-progreso-wrap">
                  <div
                    className={`carrusel-mis-cursos__barra carrusel-mis-cursos__barra--${tipoColor}`}
                    style={{ width: `${progreso}%` }}
                  />
                  <span className="carrusel-mis-cursos__porcentaje">{progreso}%</span>
                </div>
              </div>
              <div className="carrusel-mis-cursos__tarjeta-cuerpo">
                <h3 className="carrusel-mis-cursos__nombre">{ins.nombreCurso}</h3>
                <p className="carrusel-mis-cursos__estado">
                  {esCertificados
                    ? `Aprobado · ${ins.fechaAprobacion ?? '—'}`
                    : ins.estado === 'aprobado'
                      ? 'Completado'
                      : `En curso · ${progreso}%`}
                </p>
              </div>
              <div className="carrusel-mis-cursos__tarjeta-pie">
                {esCertificados ? (
                  <Link to={`/certificado/${ins.idCertificado}`}>
                    <Boton variante="primario" tamano="normal">
                      Ver certificado
                    </Boton>
                  </Link>
                ) : (
                  <Link to={`/curso/${ins.idCurso}`}>
                    <Boton variante="primario" tamano="normal">
                      Ver curso
                    </Boton>
                  </Link>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
