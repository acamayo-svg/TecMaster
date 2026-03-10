import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const CLAVE_TEMA = 'tec-master-tema'
const TEMA_OSCURO = 'oscuro'
const TEMA_CLARO = 'claro'

const ContextoTema = createContext(null)

export function ProveedorTema({ children }) {
  const [tema, establecerTema] = useState(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_TEMA)
      return guardado === TEMA_CLARO ? TEMA_CLARO : TEMA_OSCURO
    } catch {
      return TEMA_OSCURO
    }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-tema', tema)
  }, [tema])

  const alternarTema = useCallback(() => {
    establecerTema((prev) => {
      const siguiente = prev === TEMA_OSCURO ? TEMA_CLARO : TEMA_OSCURO
      localStorage.setItem(CLAVE_TEMA, siguiente)
      return siguiente
    })
  }, [])

  const valor = {
    tema,
    esOscuro: tema === TEMA_OSCURO,
    esClaro: tema === TEMA_CLARO,
    alternarTema,
    establecerTema,
  }

  return (
    <ContextoTema.Provider value={valor}>
      {children}
    </ContextoTema.Provider>
  )
}

export function useTema() {
  const contexto = useContext(ContextoTema)
  if (!contexto) {
    throw new Error('useTema debe usarse dentro de ProveedorTema')
  }
  return contexto
}

export { TEMA_OSCURO, TEMA_CLARO }
