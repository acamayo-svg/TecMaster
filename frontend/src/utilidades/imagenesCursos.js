/** Imágenes alusivas por categoría y por id de curso (fallback si la API no devuelve imagen) */
const POR_CATEGORIA = {
  Desarrollo: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600',
  Ciberseguridad: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600',
  'Soporte técnico': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600',
  Redes: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600',
  General: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600',
  Otros: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
}

const POR_ID = {
  '1': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600',
  '2': 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600',
  '3': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600',
  '4': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600',
  '5': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600',
  '6': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600',
  '7': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600',
  '8': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600',
}

export function obtenerImagenCurso(curso) {
  if (curso?.imagen) return curso.imagen
  if (curso?.id && POR_ID[curso.id]) return POR_ID[curso.id]
  const cat = curso?.categoria || 'General'
  return POR_CATEGORIA[cat] || POR_CATEGORIA.General
}
