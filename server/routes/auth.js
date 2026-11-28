import { Router } from 'express';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import * as repo from '../data/repositorio.js';

const router = Router();
const sesiones = new Map();
const DURACION = 8 * 60 * 60 * 1000;
const COOKIE = 'ubicatec_session';

function obtenerToken(req) {
  const cookies = (req.headers.cookie || '').split(';');
  const cookie = cookies
    .map(c => c.trim())
    .find(c => c.startsWith(COOKIE + '='));

  return cookie ? cookie.slice(COOKIE.length + 1) : null;
}

function verificarPassword(password, almacenado) {
  const [salt, hash] = almacenado.split(':');
  const esperado = Buffer.from(hash, 'hex');
  const recibido = scryptSync(password, salt, 64);

  return esperado.length === recibido.length &&
    timingSafeEqual(esperado, recibido);
}

function autenticar(req, res, next) {
  const token = obtenerToken(req);
  const sesion = sesiones.get(token);

  if (!sesion || sesion.expira <= Date.now()) {
    sesiones.delete(token);
    return res.status(401).json({
      error: 'Debes iniciar sesión'
    });
  }

  req.alumnoId = sesion.alumnoId;
  next();
}

router.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

router.post('/login', (req, res) => {
  const { numero_control, password } = req.body || {};

  if (
    typeof numero_control !== 'string' ||
    typeof password !== 'string' ||
    !numero_control.trim() ||
    !password ||
    password.length > 128
  ) {
    return res.status(400).json({
      error: 'Ingresa tu número de control y contraseña'
    });
  }

  const usuario = repo.usuarioPorControl(
    numero_control.trim()
  );

  if (
    !usuario ||
    !usuario.activo ||
    !verificarPassword(password, usuario.password_hash)
  ) {
    return res.status(401).json({
      error: 'Número de control o contraseña incorrectos'
    });
  }

  for (const [clave, sesion] of sesiones) {
    if (sesion.expira <= Date.now()) {
      sesiones.delete(clave);
    }
  }

  sesiones.delete(obtenerToken(req));

  const token = randomBytes(32).toString('hex');

  sesiones.set(token, {
    alumnoId: usuario.alumno_id,
    expira: Date.now() + DURACION
  });

  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: req.secure,
    maxAge: DURACION,
    path: '/'
  });

  return res.json({
    mensaje: 'Sesión iniciada',
    alumno: repo.perfilAlumno(usuario.alumno_id)
  });
});

router.get('/perfil', autenticar, (req, res) => {
  res.json(repo.perfilAlumno(req.alumnoId));
});

router.get('/horario', autenticar, (req, res) => {
  res.json(repo.horarioAlumno(req.alumnoId));
});

router.post('/logout', (req, res) => {
  sesiones.delete(obtenerToken(req));
  res.clearCookie(COOKIE, {
    httpOnly: true,
    sameSite: 'strict',
    secure: req.secure,
    path: '/'
  });

  res.json({ mensaje: 'Sesión cerrada' });
});

export function protegerPagina(req, res, next) {
  const token = obtenerToken(req);
  const sesion = sesiones.get(token);

  res.set('Cache-Control', 'no-store');

  if (!sesion || sesion.expira <= Date.now()) {
    sesiones.delete(token);
    return res.redirect('/login.html');
  }

  next();
}

export default router;