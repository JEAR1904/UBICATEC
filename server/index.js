import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import api from './routes/api.js';
import auth, { protegerPagina } from './routes/auth.js';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/auth', auth);
app.use('/api', api);
app.use('/vendor/leaflet', express.static(path.join(raiz, 'node_modules/leaflet/dist')));
app.use('/fotos', express.static(path.join(raiz, 'datos/fotos')));
app.get(['/', '/index.html'], protegerPagina, (_req, res) => {
  res.sendFile(path.join(raiz, 'public/index.html'));
});

app.use(express.static(path.join(raiz, 'public')));

app.use((_req, res) => res.status(404).json({ error: 'No encontrado' }));

app.listen(PORT, () => {
  console.log(`UbicaTec corriendo en http://localhost:${PORT}`);
});
