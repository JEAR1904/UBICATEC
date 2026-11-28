// Capa de acceso a datos: todas las consultas SQL de la API están aquí.
import db from '../db.js';

export const normalizar = (texto = '') =>
  texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const aEspacio = (fila) => fila && { ...fila, edificio: fila.edificio_id };

export function edificios() {
  const filas = db.prepare('SELECT * FROM edificio ORDER BY clave').all();
  return {
    type: 'FeatureCollection',
    features: filas.map(({ poligono, ...props }) => ({
      type: 'Feature',
      properties: props,
      geometry: JSON.parse(poligono),
    })),
  };
}

export function espacios({ categoria } = {}) {
  const filas = categoria
    ? db.prepare('SELECT * FROM espacio WHERE categoria = ? ORDER BY nombre').all(categoria)
    : db.prepare('SELECT * FROM espacio ORDER BY nombre').all();
  return filas.map(aEspacio);
}

export function espacio(id) {
  return aEspacio(
    db
      .prepare(
        `SELECT e.*, ed.nombre AS edificio_nombre
         FROM espacio e JOIN edificio ed ON ed.id = e.edificio_id
         WHERE e.id = ?`,
      )
      .get(id),
  ) || null;
}

export function origenes() {
  return db.prepare('SELECT * FROM origen ORDER BY nombre').all();
}

export function ruta(espacioId, origenId = 'principal') {
  const fila = db
    .prepare('SELECT * FROM ruta WHERE espacio_id = ? AND origen_id = ?')
    .get(espacioId, origenId);
  if (!fila) return null;
  return {
    type: 'Feature',
    properties: { id: fila.id, origen: fila.origen_id, destino: fila.espacio_id, indicaciones: fila.indicaciones },
    geometry: JSON.parse(fila.linea),
  };
}

// RNF-03: solo se consulta la vista docente_publico (docentes autorizados).
export function docentes({ q } = {}) {
  const lista = db
    .prepare(
      `SELECT d.*, e.nombre AS espacio_nombre
       FROM docente_publico d LEFT JOIN espacio e ON e.id = d.espacio_id
       ORDER BY d.nombre`,
    )
    .all();
  const horarios = db.prepare(
    'SELECT dia, hora_inicio AS inicio, hora_fin AS fin FROM horario_atencion WHERE docente_id = ?',
  );
  const n = normalizar(q);
  return lista
    .filter((d) => !n || normalizar(d.nombre).includes(n) || normalizar(d.departamento).includes(n))
    .map((d) => ({ ...d, espacio: d.espacio_id, horario: horarios.all(d.id) }));
}

// RF-03: sin distinguir acentos ni mayúsculas.
export function buscar(q) {
  const n = normalizar(q);
  if (!n) return { espacios: [], docentes: [] };
  const lugares = espacios().filter(
    (e) => normalizar(e.nombre).includes(n) || normalizar(e.clave).includes(n),
  );
  return { espacios: lugares, docentes: docentes({ q }) };
}


// Modulo academico: autenticacion y horarios.

export function usuarioPorControl(numeroControl) {
  return db.prepare(`
    SELECT id, alumno_id, nombre_usuario, password_hash, activo
    FROM usuario
    WHERE nombre_usuario = ?
  `).get(numeroControl) || null;
}

export function perfilAlumno(alumnoId) {
  return db.prepare(`
    SELECT id, numero_control, nombre, carrera, semestre
    FROM alumno
    WHERE id = ?
  `).get(alumnoId) || null;
}

export function horarioAlumno(alumnoId) {
  return db.prepare(`
    SELECT
      h.id,
      m.nombre AS materia,
      h.dia,
      h.hora_inicio AS inicio,
      h.hora_fin AS fin,
      h.aula
    FROM horario_clase h
    JOIN materia m ON m.id = h.materia_id
    WHERE h.alumno_id = ?
    ORDER BY
      CASE h.dia
        WHEN 'lunes' THEN 1
        WHEN 'martes' THEN 2
        WHEN 'miercoles' THEN 3
        WHEN 'jueves' THEN 4
        WHEN 'viernes' THEN 5
        WHEN 'sabado' THEN 6
      END,
      h.hora_inicio
  `).all(alumnoId);
}