// Catálogo de cursos disponibles (en un sistema real podría venir de la base de datos)

export const cursosDisponibles = [
  {
    id: '1',
    nombre: 'Introducción a React',
    duracion: '20 horas',
    descripcion: 'Aprende los fundamentos de React y construye interfaces modernas.',
  },
  {
    id: '2',
    nombre: 'JavaScript moderno',
    duracion: '30 horas',
    descripcion: 'ES6+, async/await, módulos y buenas prácticas.',
  },
  {
    id: '3',
    nombre: 'Diseño de interfaces',
    duracion: '25 horas',
    descripcion: 'UX/UI, accesibilidad y diseño responsivo.',
  },
]

export function obtenerCursoPorId(id) {
  return cursosDisponibles.find((c) => c.id === id) || null
}
