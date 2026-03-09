import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiCursosDisponibles, apiInscribirCurso } from '../utilidades/api'
import Boton from '../componentes/Boton'
import CampoFormulario from '../componentes/CampoFormulario'
import Tarjeta from '../componentes/Tarjeta'
import '../estilos/InscripcionCurso.css'

export default function InscripcionCurso() {
  const [cursos, establecerCursos] = useState([])
  const [idCursoSeleccionado, establecerIdCursoSeleccionado] = useState('')
  const [mensaje, establecerMensaje] = useState('')
  const [error, establecerError] = useState('')
  const [cargando, establecerCargando] = useState(false)
  const navegar = useNavigate()

  useEffect(() => {
    apiCursosDisponibles()
      .then(establecerCursos)
      .catch(() => establecerCursos([]))
  }, [])

  const opcionesCursos = cursos.map((c) => ({
    valor: c.id,
    etiqueta: `${c.nombre} (${c.duracion})`,
  }))

  const manejarEnvio = async (e) => {
    e.preventDefault()
    establecerMensaje('')
    establecerError('')

    if (!idCursoSeleccionado) {
      establecerError('Selecciona un curso.')
      return
    }

    establecerCargando(true)
    try {
      await apiInscribirCurso(idCursoSeleccionado)
      establecerMensaje('Inscripción realizada. Redirigiendo al curso…')
      setTimeout(() => navegar(`/curso/${idCursoSeleccionado}`), 1000)
    } catch (err) {
      establecerError(err.message || 'Error al inscribirse.')
    } finally {
      establecerCargando(false)
    }
  }

  return (
    <div className="inscripcion-curso">
      <Tarjeta className="inscripcion-curso__tarjeta">
        <h1 className="inscripcion-curso__titulo">Inscripción a curso</h1>
        <p className="inscripcion-curso__subtitulo">
          Elige el curso al que quieres inscribirte. Podrás ver el contenido y aprobar para obtener tu certificado.
        </p>
        <form onSubmit={manejarEnvio} className="inscripcion-curso__formulario">
          {error && <p className="inscripcion-curso__error">{error}</p>}
          {mensaje && (
            <p className="inscripcion-curso__mensaje inscripcion-curso__mensaje--exito">
              {mensaje}
            </p>
          )}
          <CampoFormulario
            etiqueta="Curso"
            nombre="idCurso"
            valor={idCursoSeleccionado}
            onChange={(e) => establecerIdCursoSeleccionado(e.target.value)}
            opciones={opcionesCursos}
            requerido
          />
          <Boton tipo="submit" variante="primario" tamano="grande" className="inscripcion-curso__boton" deshabilitado={cargando}>
            {cargando ? 'Inscribiendo…' : 'Inscribirme'}
          </Boton>
        </form>
      </Tarjeta>
    </div>
  )
}
