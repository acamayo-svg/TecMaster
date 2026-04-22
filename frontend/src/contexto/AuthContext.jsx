import { createContext, useContext, useState, useCallback } from 'react'

const ContextoAuth = createContext(null)

export function ProveedorAuth({ children }) {
  const [usuario, establecerUsuario] = useState(() => {
    try {
      const guardado = localStorage.getItem('plataforma-certificados-usuario')
      return guardado ? JSON.parse(guardado) : null
    } catch {
      return null
    }
  })

  const iniciarSesion = useCallback((datosUsuario) => {
    const paraGuardar = {
      id: datosUsuario.id,
      nombre: datosUsuario.nombre,
      correo: datosUsuario.correo,
      token: datosUsuario.token,
      fotoPerfil: datosUsuario.fotoPerfil ?? null,
      tipoDocumento: datosUsuario.tipoDocumento ?? null,
    }
    establecerUsuario(paraGuardar)
    localStorage.setItem('plataforma-certificados-usuario', JSON.stringify(paraGuardar))
  }, [])

  const cerrarSesion = useCallback(() => {
    establecerUsuario(null)
    localStorage.removeItem('plataforma-certificados-usuario')
  }, [])

  const actualizarUsuarioLocal = useCallback((datos) => {
    establecerUsuario((prev) => {
      if (!prev) return prev
      const actualizado = { ...prev, ...datos }
      localStorage.setItem('plataforma-certificados-usuario', JSON.stringify(actualizado))
      return actualizado
    })
  }, [])

  const valor = {
    usuario,
    iniciarSesion,
    cerrarSesion,
    actualizarUsuarioLocal,
    estaAutenticado: Boolean(usuario),
  }

  return (
    <ContextoAuth.Provider value={valor}>
      {children}
    </ContextoAuth.Provider>
  )
}

export function useAuth() {
  const contexto = useContext(ContextoAuth)
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de ProveedorAuth')
  }
  return contexto
}
