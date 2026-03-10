import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexto/AuthContext'
import { apiRegistro } from '../utilidades/api'
import Boton from '../componentes/Boton'
import CampoFormulario from '../componentes/CampoFormulario'
import Tarjeta from '../componentes/Tarjeta'
import '../estilos/FormularioPagina.css'

export default function Registro() {
  const [nombre, establecerNombre] = useState('')
  const [correo, establecerCorreo] = useState('')
  const [cedula, establecerCedula] = useState('')
  const [contraseña, establecerContraseña] = useState('')
  const [repetirContraseña, establecerRepetirContraseña] = useState('')
  const [error, establecerError] = useState('')
  const [cargando, establecerCargando] = useState(false)
  const { iniciarSesion } = useAuth()
  const navegar = useNavigate()

  const manejarEnvio = async (e) => {
    e.preventDefault()
    establecerError('')

    if (!nombre.trim() || !correo.trim() || !cedula.trim() || !contraseña || !repetirContraseña) {
      establecerError('Completa todos los campos.')
      return
    }
    if (contraseña !== repetirContraseña) {
      establecerError('Las contraseñas no coinciden.')
      return
    }
    if (contraseña.length < 6) {
      establecerError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    establecerCargando(true)
    try {
      const datos = await apiRegistro(nombre.trim(), correo.trim(), contraseña, cedula.trim())
      iniciarSesion(datos)
      navegar('/area-usuario')
    } catch (err) {
      establecerError(err.message || 'Error al registrarse. Comprueba que el servidor esté en marcha.')
    } finally {
      establecerCargando(false)
    }
  }

  return (
    <div className="formulario-pagina">
      <Tarjeta className="formulario-pagina__tarjeta">
        <h1 className="formulario-pagina__titulo">Crear cuenta</h1>
        <p className="formulario-pagina__subtitulo">
          Regístrate para inscribirte a cursos y obtener certificados.
        </p>
        <form onSubmit={manejarEnvio} className="formulario-pagina__formulario">
          {error && <p className="formulario-pagina__error">{error}</p>}
          <CampoFormulario
            etiqueta="Nombre completo"
            nombre="nombre"
            valor={nombre}
            onChange={(e) => establecerNombre(e.target.value)}
            placeholder="Tu nombre"
            requerido
          />
          <CampoFormulario
            etiqueta="Número de cédula o identificación"
            nombre="cedula"
            valor={cedula}
            onChange={(e) => establecerCedula(e.target.value)}
            placeholder="Ej: 1234567890"
            requerido
          />
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
            placeholder="Mínimo 6 caracteres"
            requerido
            textoAyuda="Mínimo 6 caracteres."
          />
          <CampoFormulario
            etiqueta="Repetir contraseña"
            nombre="repetirContraseña"
            tipo="password"
            valor={repetirContraseña}
            onChange={(e) => establecerRepetirContraseña(e.target.value)}
            placeholder="••••••••"
            requerido
          />
          <Boton tipo="submit" variante="primario" tamano="grande" className="formulario-pagina__boton" deshabilitado={cargando}>
            {cargando ? 'Registrando…' : 'Registrarse'}
          </Boton>
        </form>
        <p className="formulario-pagina__pie">
          ¿Ya tienes cuenta? <Link to="/iniciar-sesion">Inicia sesión</Link>
        </p>
      </Tarjeta>
    </div>
  )
}
