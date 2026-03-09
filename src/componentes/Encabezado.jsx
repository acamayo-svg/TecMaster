import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexto/AuthContext'
import { useTema } from '../contexto/TemaContext'
import Logo from './Logo'
import ModalCambiarContraseña from './ModalCambiarContraseña'
import ModalCambiarFoto from './ModalCambiarFoto'
import '../estilos/Encabezado.css'

function Iniciales(nombre, correo) {
  if (nombre && nombre.trim()) {
    const partes = nombre.trim().split(/\s+/)
    if (partes.length >= 2) {
      return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase().slice(0, 2)
    }
    return nombre.trim().slice(0, 2).toUpperCase()
  }
  if (correo && correo.trim()) {
    return correo.trim().slice(0, 2).toUpperCase()
  }
  return '?'
}

export default function Encabezado() {
  const { usuario, estaAutenticado, cerrarSesion } = useAuth()
  const { esOscuro, alternarTema } = useTema()
  const navegar = useNavigate()
  const [desplegableAbierto, establecerDesplegableAbierto] = useState(false)
  const [modalContraseña, establecerModalContraseña] = useState(false)
  const [modalFoto, establecerModalFoto] = useState(false)
  const refDesplegable = useRef(null)

  useEffect(() => {
    function alClicFuera(e) {
      if (refDesplegable.current && !refDesplegable.current.contains(e.target)) {
        establecerDesplegableAbierto(false)
      }
    }
    if (desplegableAbierto) {
      document.addEventListener('click', alClicFuera)
      return () => document.removeEventListener('click', alClicFuera)
    }
  }, [desplegableAbierto])

  const alCerrarSesion = () => {
    establecerDesplegableAbierto(false)
    cerrarSesion()
    navegar('/')
  }

  const abrirModalContraseña = () => {
    establecerDesplegableAbierto(false)
    establecerModalContraseña(true)
  }

  const abrirModalFoto = () => {
    establecerDesplegableAbierto(false)
    establecerModalFoto(true)
  }

  return (
    <>
      <header className="encabezado">
        <div className="encabezado__contenedor">
          <Link to="/" className="encabezado__marca">
            <Logo />
          </Link>
          <nav className="encabezado__navegacion">
            <Link to="/" className="encabezado__enlace">Inicio</Link>
            <Link to="/empresas" className="encabezado__enlace">Verificar certificados</Link>
            <div className="encabezado__tema" role="group" aria-label="Tema visual">
              <button
                type="button"
                className={`encabezado__tema-opcion ${esOscuro ? 'encabezado__tema-opcion--activa' : ''}`}
                onClick={() => !esOscuro && alternarTema()}
                aria-pressed={esOscuro}
                aria-label="Modo oscuro"
                title="Modo oscuro"
              >
                Oscuro
              </button>
              <button
                type="button"
                className={`encabezado__tema-opcion ${!esOscuro ? 'encabezado__tema-opcion--activa' : ''}`}
                onClick={() => esOscuro && alternarTema()}
                aria-pressed={!esOscuro}
                aria-label="Modo claro"
                title="Modo claro"
              >
                Claro
              </button>
            </div>
            {estaAutenticado ? (
              <div className="encabezado__usuario-wrap" ref={refDesplegable}>
                <button
                  type="button"
                  className="encabezado__avatar"
                  onClick={() => establecerDesplegableAbierto((v) => !v)}
                  aria-expanded={desplegableAbierto}
                  aria-haspopup="true"
                  aria-label="Abrir menú de perfil"
                >
                  {usuario?.fotoPerfil ? (
                    <img
                      src={usuario.fotoPerfil}
                      alt=""
                      className="encabezado__avatar-img"
                    />
                  ) : (
                    <span className="encabezado__avatar-iniciales">
                      {Iniciales(usuario?.nombre, usuario?.correo)}
                    </span>
                  )}
                </button>
                {desplegableAbierto && (
                  <div className="encabezado__desplegable">
                    <div className="encabezado__desplegable-nombre">
                      {usuario?.nombre ?? usuario?.correo}
                    </div>
                    <Link
                      to="/area-usuario"
                      className="encabezado__desplegable-opcion"
                      onClick={() => establecerDesplegableAbierto(false)}
                    >
                      Mi área
                    </Link>
                    <button
                      type="button"
                      className="encabezado__desplegable-opcion"
                      onClick={abrirModalFoto}
                    >
                      Cambiar foto de perfil
                    </button>
                    <button
                      type="button"
                      className="encabezado__desplegable-opcion"
                      onClick={abrirModalContraseña}
                    >
                      Cambiar contraseña
                    </button>
                    <button
                      type="button"
                      className="encabezado__desplegable-opcion encabezado__desplegable-opcion--cerrar"
                      onClick={alCerrarSesion}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/iniciar-sesion" className="encabezado__boton encabezado__boton--secundario">
                  Iniciar sesión
                </Link>
                <Link to="/registro" className="encabezado__boton encabezado__boton--primario">
                  Registrarse
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {modalContraseña && (
        <ModalCambiarContraseña
          cerrar={() => establecerModalContraseña(false)}
        />
      )}
      {modalFoto && (
        <ModalCambiarFoto
          cerrar={() => establecerModalFoto(false)}
        />
      )}
    </>
  )
}
