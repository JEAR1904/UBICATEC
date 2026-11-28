-- Esquema relacional de UbicaTec (EDT 4.2 y 4.3) para SQLite.
-- Las geometrías (polígonos y líneas) se guardan como texto GeoJSON.

PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS horario_clase;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS materia;
DROP TABLE IF EXISTS alumno;

DROP VIEW  IF EXISTS docente_publico;
DROP TABLE IF EXISTS horario_atencion;
DROP TABLE IF EXISTS docente;
DROP TABLE IF EXISTS ruta;
DROP TABLE IF EXISTS origen;
DROP TABLE IF EXISTS espacio;
DROP TABLE IF EXISTS edificio;

CREATE TABLE edificio (
  id          TEXT PRIMARY KEY,
  clave       TEXT NOT NULL UNIQUE,
  nombre      TEXT NOT NULL,
  descripcion TEXT,
  poligono    TEXT NOT NULL,          -- GeoJSON Polygon
  foto        TEXT
);

CREATE TABLE espacio (
  id          TEXT PRIMARY KEY,
  clave       TEXT NOT NULL UNIQUE,
  nombre      TEXT NOT NULL,
  categoria   TEXT NOT NULL CHECK (categoria IN ('aula','laboratorio','departamento','oficina','servicio')),
  edificio_id TEXT NOT NULL REFERENCES edificio(id),
  planta      TEXT,
  lat         REAL NOT NULL,
  lng         REAL NOT NULL,
  descripcion TEXT,
  foto        TEXT,
  video       TEXT
);

CREATE TABLE origen (
  id     TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  lat    REAL NOT NULL,
  lng    REAL NOT NULL
);

CREATE TABLE ruta (
  id           TEXT PRIMARY KEY,
  origen_id    TEXT NOT NULL REFERENCES origen(id),
  espacio_id   TEXT NOT NULL REFERENCES espacio(id),
  linea        TEXT NOT NULL,          -- GeoJSON LineString
  indicaciones TEXT,
  UNIQUE (origen_id, espacio_id)
);

CREATE TABLE docente (
  id                 TEXT PRIMARY KEY,
  nombre             TEXT NOT NULL,
  departamento       TEXT NOT NULL,
  espacio_id         TEXT REFERENCES espacio(id),
  autorizado         INTEGER NOT NULL DEFAULT 0 CHECK (autorizado IN (0, 1)),
  fecha_autorizacion TEXT,
  -- RNF-03: no se puede marcar como autorizado sin fecha de autorización
  CHECK (autorizado = 0 OR fecha_autorizacion IS NOT NULL)
);

CREATE TABLE horario_atencion (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  docente_id  TEXT NOT NULL REFERENCES docente(id) ON DELETE CASCADE,
  dia         TEXT NOT NULL CHECK (dia IN ('lunes','martes','miércoles','jueves','viernes','sábado')),
  hora_inicio TEXT NOT NULL,
  hora_fin    TEXT NOT NULL,
  CHECK (hora_fin > hora_inicio)
);

-- Vista pública: la API solo consulta docentes a través de esta vista (RNF-03).
CREATE VIEW docente_publico AS
  SELECT id, nombre, departamento, espacio_id
  FROM docente
  WHERE autorizado = 1;


-- Modulo de alumnos y horarios (Ambar simulado).

CREATE TABLE alumno (
  id TEXT PRIMARY KEY,
  numero_control TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  carrera TEXT NOT NULL,
  semestre INTEGER NOT NULL CHECK (semestre > 0)
);

CREATE TABLE usuario (
  id TEXT PRIMARY KEY,
  alumno_id TEXT NOT NULL UNIQUE REFERENCES alumno(id),
  nombre_usuario TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  activo INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0, 1))
);

CREATE TABLE materia (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL
);

CREATE TABLE horario_clase (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  alumno_id TEXT NOT NULL REFERENCES alumno(id),
  materia_id TEXT NOT NULL REFERENCES materia(id),
  dia TEXT NOT NULL CHECK (dia IN ('lunes','martes','miercoles','jueves','viernes','sabado')),
  hora_inicio TEXT NOT NULL,
  hora_fin TEXT NOT NULL,
  aula TEXT NOT NULL,
  CHECK (hora_fin > hora_inicio),
  UNIQUE (alumno_id, materia_id, dia, hora_inicio)
);