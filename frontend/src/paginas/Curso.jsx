import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiCursosDisponibles, apiMisCursos, apiAprobarCurso, apiActualizarProgreso } from '../utilidades/api'
import Boton from '../componentes/Boton'
import Tarjeta from '../componentes/Tarjeta'
import '../estilos/Curso.css'

export default function Curso() {
  const { idCurso } = useParams()
  const navegar = useNavigate()
  const [curso, establecerCurso] = useState(null)
  const [inscripcion, establecerInscripcion] = useState(null)
  const [cargando, establecerCargando] = useState(true)
  const [mostrarConfirmarAprobar, establecerMostrarConfirmarAprobar] = useState(false)
  const [aprobando, establecerAprobando] = useState(false)
  const [actualizandoProgreso, establecerActualizandoProgreso] = useState(false)
  const [errorProgreso, establecerErrorProgreso] = useState(null)

  useEffect(() => {
    let cancelado = false
    async function cargar() {
      try {
        const [cursos, misCursos] = await Promise.all([
          apiCursosDisponibles(),
          apiMisCursos(),
        ])
        if (cancelado) return
        const c = cursos.find((x) => x.id === idCurso) || null
        const ins = misCursos.find((i) => i.idCurso === idCurso) || null
        establecerCurso(c)
        establecerInscripcion(ins)
      } catch {
        if (!cancelado) establecerCurso(null)
      } finally {
        if (!cancelado) establecerCargando(false)
      }
    }
    cargar()
    return () => { cancelado = true }
  }, [idCurso])

  const aprobado = inscripcion?.estado === 'aprobado'
  const idCertificado = inscripcion?.idCertificado
  const progresoActual = inscripcion?.progreso ?? 0

  const alMoverProgreso = (valor) => {
    const num = Math.min(100, Math.max(0, parseInt(valor, 10) || 0))
    establecerInscripcion((prev) => (prev ? { ...prev, progreso: num } : prev))
  }

  const guardarProgreso = (id, num) => {
    const idInscripcion = id ?? inscripcion?.id
    if (!idInscripcion) {
      establecerErrorProgreso('No se pudo identificar la inscripción. Recarga la página.')
      return
    }
    establecerErrorProgreso(null)
    establecerActualizandoProgreso(true)
    apiActualizarProgreso(idInscripcion, num)
      .then(() => { /* guardado correcto */ })
      .catch((err) => {
        establecerErrorProgreso(err?.message || 'No se pudo guardar el progreso. Revisa tu conexión.')
      })
      .finally(() => establecerActualizandoProgreso(false))
  }

  const alSoltarProgreso = (e) => {
    const input = e?.currentTarget ?? e?.target
    const num = input ? Math.min(100, Math.max(0, parseInt(input.value, 10) || 0)) : (inscripcion?.progreso ?? 0)
    if (num === progresoActual) return
    establecerInscripcion((prev) => (prev ? { ...prev, progreso: num } : prev))
    guardarProgreso(inscripcion.id, num)
  }

  const simularProgreso = (porcentaje) => {
    const num = porcentaje === 50 ? 50 : 100
    if (num === progresoActual) return
    establecerInscripcion((prev) => (prev ? { ...prev, progreso: num } : prev))
    guardarProgreso(inscripcion.id, num)
  }

  const alConfirmarAprobar = async () => {
    establecerAprobando(true)
    try {
      const resultado = await apiAprobarCurso(idCurso)
      if (resultado.inscripcion) establecerInscripcion(resultado.inscripcion)
      establecerMostrarConfirmarAprobar(false)
    } catch {
      // error ya mostrado o manejar
    } finally {
      establecerAprobando(false)
    }
  }

  if (cargando) {
    return <div className="curso"><p className="curso__cargando">Cargando curso…</p></div>
  }

  if (!curso) {
    return (
      <div className="curso curso--no-encontrado">
        <p>Curso no encontrado.</p>
        <Boton variante="secundario" onClick={() => navegar('/area-usuario')}>
          Volver a mi área
        </Boton>
      </div>
    )
  }

  if (!inscripcion) {
    return (
      <div className="curso curso--no-encontrado">
        <p>No estás inscrito en este curso. Inscríbete desde Mi área.</p>
        <Boton variante="secundario" onClick={() => navegar('/area-usuario')}>
          Ir a mi área
        </Boton>
      </div>
    )
  }

  return (
    <div className="curso">
      <Tarjeta className="curso__cabecera">
        <h1 className="curso__titulo">{curso.nombre}</h1>
        <p className="curso__duracion">{curso.duracion}</p>
        <p className="curso__descripcion">{curso.descripcion}</p>
      </Tarjeta>

      <Tarjeta className="curso__contenido">
        <h2 className="curso__seccion-titulo">Contenido del curso</h2>
        <p className="curso__texto">
          Aquí iría el contenido del curso (módulos, lecciones, etc.). Por ahora no hay contenido; puedes simular tu avance para probar el flujo hasta el certificado.
        </p>
        {!aprobado && (
          <>
            <div className="curso__progreso-wrap">
              <label className="curso__progreso-etiqueta">
                Mi progreso: <strong>{progresoActual}%</strong>
                {actualizandoProgreso && <span className="curso__progreso-guardando"> Guardando…</span>}
              </label>
              {errorProgreso && (
                <p className="curso__error-progreso" role="alert">
                  {errorProgreso}
                </p>
              )}
              <input
                type="range"
                min="0"
                max="100"
                value={progresoActual}
                onChange={(e) => alMoverProgreso(e.target.value)}
                onMouseUp={(e) => alSoltarProgreso(e)}
                onTouchEnd={(e) => alSoltarProgreso(e)}
                className="curso__progreso-slider"
                disabled={actualizandoProgreso}
              />
              <p className="curso__progreso-ayuda">
                Sin contenido aún: usa el deslizador o los botones para simular que vas a la mitad o que finalizaste el curso.
              </p>
              <div className="curso__simular-botones">
                <Boton
                  tipo="button"
                  variante="secundario"
                  onClick={() => simularProgreso(50)}
                  deshabilitado={actualizandoProgreso || progresoActual === 50}
                >
                  Simular: mitad de curso (50%)
                </Boton>
                <Boton
                  tipo="button"
                  variante="secundario"
                  onClick={() => simularProgreso(100)}
                  deshabilitado={actualizandoProgreso || progresoActual === 100}
                >
                  Simular: curso finalizado (100%)
                </Boton>
              </div>
            </div>
          </>
        )}
      </Tarjeta>

      <div className="curso__acciones">
        {aprobado ? (
          <div className="curso__certificado-ok">
            <p>Has aprobado este curso. Ya puedes ver y descargar tu certificado en PDF.</p>
            <Boton
              variante="primario"
              tamano="grande"
              onClick={() => navegar(`/certificado/${idCertificado}`)}
            >
              Ver certificado y descargar PDF
            </Boton>
          </div>
        ) : progresoActual < 100 ? (
          <div className="curso__aviso-progreso">
            <p className="curso__aviso-progreso-texto">
              Completa el curso al <strong>100%</strong> para habilitar la opción de aprobar y obtener tu certificado (descargable en PDF).
            </p>
            <p className="curso__aviso-progreso-sub">Usa el deslizador o los botones de simulación arriba para llegar al 100%.</p>
          </div>
        ) : mostrarConfirmarAprobar ? (
          <Tarjeta className="curso__confirmar">
            <p className="curso__confirmar-texto">
              ¿Confirmas que has completado el curso y quieres aprobarlo? Se generará tu certificado y podrás descargarlo en PDF.
            </p>
            <div className="curso__confirmar-botones">
              <Boton variante="secundario" onClick={() => establecerMostrarConfirmarAprobar(false)} deshabilitado={aprobando}>
                Cancelar
              </Boton>
              <Boton variante="primario" onClick={alConfirmarAprobar} deshabilitado={aprobando}>
                {aprobando ? 'Aprobando…' : 'Sí, aprobar curso'}
              </Boton>
            </div>
          </Tarjeta>
        ) : (
          <Boton
            variante="primario"
            tamano="grande"
            onClick={() => establecerMostrarConfirmarAprobar(true)}
          >
            Marcar como aprobado y generar certificado
          </Boton>
        )}
      </div>
    </div>
  )
}
