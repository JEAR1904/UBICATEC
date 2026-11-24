import Database from 'better-sqlite3';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const archivo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../db/ubicatec.db');

if (!existsSync(archivo)) {
  console.error('No existe la base de datos. Corre primero: npm run db:crear');
  process.exit(1);
}

const db = new Database(archivo, { readonly: true });
db.pragma('foreign_keys = ON');

export default db;
