// Crea db/ubicatec.db desde cero: aplica esquema.sql y carga los datos de /datos.
// Uso: npm run db:crear   (se puede correr las veces que sea, borra y vuelve a crear)
import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
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
});

cargar();
const cuenta = (t) => db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n;
console.log(
  `Base creada: ${cuenta('edificio')} edificios, ${cuenta('espacio')} espacios, ` +
    `${cuenta('ruta')} rutas, ${cuenta('docente')} docentes.`,
);
db.close();
