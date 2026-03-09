const URL_BASE = 'http://localhost:3001'

function obtenerToken() {
  try {
    const guardado = localStorage.getItem('plataforma-certificados-usuario')
    if (!guardado) return null
    const usuario = JSON.parse(guardado)
    return usuario?.token ?? null
  } catch {
    return null
  }
}

function cabeceras(conToken = false) {
  const cabeceras = { 'Content-Type': 'application/json' }
  if (conToken) {
    const token = obtenerToken()
    if (token) cabeceras.Authorization = `Bearer ${token}`
  }
  return cabeceras
}

export async function apiRegistro(nombre, correo, contraseña, cedula) {
  const res = await fetch(`${URL_BASE}/api/usuarios/registro`, {
    method: 'POST',
    headers: cabeceras(),
    body: JSON.stringify({ nombre, correo, contraseña, cedula }),
  })
  const datos = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(datos.error || 'Error al registrarse')
  return datos
}

export async function apiIniciarSesion(correo, contraseña) {
  const res = await fetch(`${URL_BASE}/api/usuarios/iniciar-sesion`, {
    method: 'POST',
    headers: cabeceras(),
    body: JSON.stringify({ correo, contraseña }),
  })
  const datos = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(datos.error || 'Error al iniciar sesión')
  return datos
}

export async function apiCursosDisponibles() {
  const res = await fetch(`${URL_BASE}/api/cursos`, { headers: cabeceras() })
  if (!res.ok) throw new Error('Error al cargar cursos')
  return res.json()
}

export async function apiMisCursos() {
  const res = await fetch(`${URL_BASE}/api/mi-perfil/cursos`, {
    headers: cabeceras(true),
  })
  if (!res.ok) throw new Error('Error al cargar tus cursos')
  return res.json()
}

export async function apiInscribirCurso(idCurso) {
  const res = await fetch(`${URL_BASE}/api/cursos/inscribir`, {
    method: 'POST',
    headers: cabeceras(true),
    body: JSON.stringify({ idCurso }),
  })
  const datos = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(datos.error || 'Error al inscribirse')
  return datos
}

export async function apiAprobarCurso(idCurso) {
  const res = await fetch(`${URL_BASE}/api/cursos/${idCurso}/aprobar`, {
    method: 'POST',
    headers: cabeceras(true),
  })
  const datos = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(datos.error || 'Error al aprobar')
  return datos
}

export async function apiMisCertificados() {
  const res = await fetch(`${URL_BASE}/api/mi-perfil/certificados`, {
    headers: cabeceras(true),
  })
  if (!res.ok) throw new Error('Error al cargar certificados')
  return res.json()
}

export async function apiCertificadoPorId(id) {
  const res = await fetch(`${URL_BASE}/api/certificados/${id}`, {
    headers: cabeceras(true),
  })
  if (!res.ok) return null
  return res.json()
}

export async function apiVerificarCertificado(codigo) {
  const codigoCodificado = encodeURIComponent(codigo.trim())
  const res = await fetch(`${URL_BASE}/api/certificados/verificar/${codigoCodificado}`)
  return res.json()
}

export async function apiActualizarPerfil(datos) {
  const res = await fetch(`${URL_BASE}/api/mi-perfil`, {
    method: 'PATCH',
    headers: cabeceras(true),
    body: JSON.stringify(datos),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Error al actualizar perfil')
  return data
}

export async function apiCambiarContraseña(contraseñaActual, contraseñaNueva) {
  const res = await fetch(`${URL_BASE}/api/mi-perfil/cambiar-contrasena`, {
    method: 'POST',
    headers: cabeceras(true),
    body: JSON.stringify({
      contraseñaActual,
      contraseñaNueva,
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Error al cambiar contraseña')
  return data
}

export async function apiActualizarProgreso(idInscripcion, progreso) {
  const res = await fetch(`${URL_BASE}/api/inscripciones/${idInscripcion}`, {
    method: 'PATCH',
    headers: cabeceras(true),
    body: JSON.stringify({ progreso }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Error al actualizar progreso')
  return data
}
