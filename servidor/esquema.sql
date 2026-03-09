-- Crear tablas para la plataforma de certificados (PostgreSQL)
-- Ejecuta este script en pgAdmin o con: psql -U postgres -d tu_base -f esquema.sql

-- Usuarios registrados
CREATE TABLE IF NOT EXISTS usuarios (
  id VARCHAR(64) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  correo VARCHAR(255) NOT NULL UNIQUE,
  contraseña_hash VARCHAR(255) NOT NULL,
  token VARCHAR(128),
  foto_perfil TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Catálogo de cursos (tecnología: Desarrollo, Ciberseguridad, Soporte técnico, Redes)
CREATE TABLE IF NOT EXISTS cursos (
  id VARCHAR(32) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  duracion VARCHAR(64) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(64) DEFAULT 'General'
);

-- Inscripciones de usuarios a cursos (cadena de bloques: hash_genesis, hash_inscripcion, hash_curso_completado)
CREATE TABLE IF NOT EXISTS inscripciones (
  id VARCHAR(64) PRIMARY KEY,
  id_usuario VARCHAR(64) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  id_curso VARCHAR(32) NOT NULL,
  nombre_curso VARCHAR(255) NOT NULL,
  estado VARCHAR(32) NOT NULL DEFAULT 'inscrito',
  progreso INTEGER NOT NULL DEFAULT 0,
  id_certificado VARCHAR(64),
  fecha_inscripcion DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_aprobacion DATE,
  hash_genesis VARCHAR(64),
  hash_inscripcion VARCHAR(64),
  hash_curso_completado VARCHAR(64),
  UNIQUE(id_usuario, id_curso)
);

-- Certificados emitidos (hash_certificado = último eslabón de la cadena)
CREATE TABLE IF NOT EXISTS certificados (
  id VARCHAR(64) PRIMARY KEY,
  id_inscripcion VARCHAR(64) NOT NULL REFERENCES inscripciones(id) ON DELETE CASCADE,
  id_usuario VARCHAR(64) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre_curso VARCHAR(255) NOT NULL,
  codigo_verificacion VARCHAR(64) NOT NULL UNIQUE,
  fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
  hash_certificado VARCHAR(64)
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(LOWER(correo));
CREATE INDEX IF NOT EXISTS idx_usuarios_token ON usuarios(token);
CREATE INDEX IF NOT EXISTS idx_inscripciones_usuario ON inscripciones(id_usuario);
CREATE INDEX IF NOT EXISTS idx_certificados_usuario ON certificados(id_usuario);
CREATE INDEX IF NOT EXISTS idx_certificados_codigo ON certificados(UPPER(codigo_verificacion));
