import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexto/AuthContext'
import { apiIniciarSesion } from '../utilidades/api'
import Boton from '../componentes/Boton'
import CampoFormulario from '../componentes/CampoFormulario'
import Tarjeta from '../componentes/Tarjeta'
import '../estilos/FormularioPagina.css'

export default function IniciarSesion() {
  const [correo, establecerCorreo] = useState('')
  const [contraseña, establecerContraseña] = useState('')
  const [error, establecerError] = useState('')
  const [cargando, establecerCargando] = useState(false)
  const { iniciarSesion } = useAuth()
  const navegar = useNavigate()

  const manejarEnvio = async (e) => {
    e.preventDefault()
    establecerError('')

    if (!correo.trim() || !contraseña.trim()) {
      establecerError('Completa correo y contraseña.')
      return
    }

    establecerCargando(true)
    try {
      const datos = await apiIniciarSesion(correo.trim(), contraseña)
      iniciarSesion(datos)
      navegar('/area-usuario')
    } catch (err) {
      establecerError(err.message || 'Error al iniciar sesión. Comprueba que el servidor esté en marcha.')
    } finally {
      establecerCargando(false)
    }
  }

  return (
    <div className="formulario-pagina">
      <Tarjeta className="formulario-pagina__tarjeta">
        <h1 className="formulario-pagina__titulo">Iniciar sesión</h1>
        <p className="formulario-pagina__subtitulo">
          Accede a tu área para ver tus cursos y certificados.
        </p>
        <form onSubmit={manejarEnvio} className="formulario-pagina__formulario">
          {error && <p className="formulario-pagina__error">{error}</p>}
          <CampoFormulario
            etiqueta="Correo electrónico"
            nombre="correo"
            tipo="email"
            valor={correo}
            onChange={(e) => establecerCorreo(e.target.value)}
            placeholder="tu@correo.com"
            requerido
          />
          <CampoFormulario
            etiqueta="Contraseña"
            nombre="contraseña"
            tipo="password"
            valor={contraseña}
            onChange={(e) => establecerContraseña(e.target.value)}
            placeholder="••••••••"
            requerido
          />
          <Boton tipo="submit" variante="primario" tamano="grande" className="formulario-pagina__boton" deshabilitado={cargando}>
            {cargando ? 'Entrando…' : 'Entrar'}
          </Boton>
        </form>
        <p className="formulario-pagina__pie">
          ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
        </p>
      </Tarjeta>
    </div>
  )
}
