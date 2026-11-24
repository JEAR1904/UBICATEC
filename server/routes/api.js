import { Router } from 'express';
import * as repo from '../data/repositorio.js';

const router = Router();

router.get('/edificios', (_req, res) => res.json(repo.edificios()));

router.get('/espacios', (req, res) => res.json(repo.espacios({ categoria: req.query.categoria })));

router.get('/espacios/:id', (req, res) => {
  const e = repo.espacio(req.params.id);
  return e ? res.json(e) : res.status(404).json({ error: 'Espacio no encontrado' });
});

router.get('/espacios/:id/ruta', (req, res) => {
  const r = repo.ruta(req.params.id, req.query.origen);
  return r ? res.json(r) : res.status(404).json({ error: 'Ruta no disponible' });
});

router.get('/origenes', (_req, res) => res.json(repo.origenes()));

router.get('/buscar', (req, res) => res.json(repo.buscar(req.query.q || '')));

router.get('/docentes', (req, res) => res.json(repo.docentes({ q: req.query.q })));

export default router;
