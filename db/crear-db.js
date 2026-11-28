// Crea db/ubicatec.db desde cero: aplica esquema.sql y carga los datos de /datos.
// Uso: npm run db:crear   (se puede correr las veces que sea, borra y vuelve a crear)
import Database from 'better-sqlite3';
import { readFileSync, existsSync } from 'node:fs';
import { randomBytes, scryptSync } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const datos = path.resolve(aqui, '../datos');
const leer = (archivo) => JSON.parse(readFileSync(path.join(datos, archivo), 'utf8'));

const db = new Database(path.join(aqui, 'ubicatec.db'));
db.exec(readFileSync(path.join(aqui, 'esquema.sql'), 'utf8'));

const cargar = db.transaction(() => {
  const edificio = db.prepare(
    'INSERT INTO edificio (id, clave, nombre, descripcion, poligono, foto) VALUES (?, ?, ?, ?, ?, ?)',
  );
  for (const f of leer('edificios.geojson').features) {
    const p = f.properties;
    edificio.run(p.id, p.clave, p.nombre, p.descripcion, JSON.stringify(f.geometry), p.foto);
  }

  const espacio = db.prepare(`INSERT INTO espacio
    (id, clave, nombre, categoria, edificio_id, planta, lat, lng, descripcion, foto, video)
    VALUES (@id, @clave, @nombre, @categoria, @edificio, @planta, @lat, @lng, @descripcion, @foto, @video)`);
  for (const e of leer('espacios.json')) espacio.run(e);

  const origen = db.prepare('INSERT INTO origen (id, nombre, lat, lng) VALUES (@id, @nombre, @lat, @lng)');
  for (const o of leer('origenes.json')) origen.run(o);

  const ruta = db.prepare(
    'INSERT INTO ruta (id, origen_id, espacio_id, linea, indicaciones) VALUES (?, ?, ?, ?, ?)',
  );
  for (const f of leer('rutas.geojson').features) {
    const p = f.properties;
    ruta.run(p.id, p.origen, p.destino, JSON.stringify(f.geometry), p.indicaciones);
  }

  const docente = db.prepare(`INSERT INTO docente
    (id, nombre, departamento, espacio_id, autorizado, fecha_autorizacion) VALUES (?, ?, ?, ?, ?, ?)`);
  const horario = db.prepare(
    'INSERT INTO horario_atencion (docente_id, dia, hora_inicio, hora_fin) VALUES (?, ?, ?, ?)',
  );
  for (const d of leer('docentes.json')) {
    docente.run(d.id, d.nombre, d.departamento, d.espacio, d.autorizado ? 1 : 0, d.fechaAutorizacion);
    for (const h of d.horario) horario.run(d.id, h.dia, h.inicio, h.fin);
  }

  // Alumnos y horarios de Ambar simulado.
  const archivoAlumnos = path.join(datos, 'alumnos.local.json');

  if (existsSync(archivoAlumnos)) {
    const alumnos = leer('alumnos.local.json');

    const insertarAlumno = db.prepare(`
      INSERT INTO alumno
      (id, numero_control, nombre, carrera, semestre)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertarUsuario = db.prepare(`
      INSERT INTO usuario
      (id, alumno_id, nombre_usuario, password_hash)
      VALUES (?, ?, ?, ?)
    `);

    const insertarMateria = db.prepare(`
      INSERT OR IGNORE INTO materia (id, nombre)
      VALUES (?, ?)
    `);

    const insertarClase = db.prepare(`
      INSERT INTO horario_clase
      (alumno_id, materia_id, dia, hora_inicio, hora_fin, aula)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const a of alumnos) {
      insertarAlumno.run(
        a.id,
        a.numero_control,
        a.nombre,
        a.carrera,
        a.semestre
      );

      const salt = randomBytes(16).toString('hex');
      const hash = scryptSync('password', salt, 64).toString('hex');

      insertarUsuario.run(
        'usuario-' + a.id,
        a.id,
        a.numero_control,
        salt + ':' + hash
      );

      for (const h of a.horario) {
        const materiaId = h.materia
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-');

        insertarMateria.run(materiaId, h.materia);

        for (const dia of h.dias) {
          insertarClase.run(
            a.id,
            materiaId,
            dia,
            h.inicio,
            h.fin,
            h.aula
          );
        }
      }
    }
  }
});

cargar();
const cuenta = (t) => db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n;
console.log(
  `Base creada: ${cuenta('edificio')} edificios, ${cuenta('espacio')} espacios, ` +
    `${cuenta('ruta')} rutas, ${cuenta('docente')} docentes.`,
);
console.log(
  `Modulo academico: ${cuenta('alumno')} alumnos, ` +
  `${cuenta('usuario')} usuarios, ` +
  `${cuenta('materia')} materias y ` +
  `${cuenta('horario_clase')} clases semanales.`
);
db.close();
