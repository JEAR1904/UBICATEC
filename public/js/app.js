import { api } from './api.js';
import * as mapa from './mapa.js';
import { cargarHorario } from './horario.js';

const $ = (sel) => document.querySelector(sel);
const NOMBRE_CATEGORIA = {
  aula: 'Aula',
  laboratorio: 'Laboratorio',
  departamento: 'Departamento',
  oficina: 'Oficina',
  servicio: 'Servicio',
};

let categoriaActual = '';
let origenes = [];

// ---------- Inicio ----------
async function iniciar() {
  mapa.iniciarMapa('mapa');
  const [edificios, espacios, listaOrigenes] = await Promise.all([
    api.edificios(),
    api.espacios(),
    api.origenes(),
  ]);
  origenes = listaOrigenes;
  mapa.dibujarEdificios(edificios);
  mapa.dibujarEspacios(espacios, abrirFicha);
  mostrarLugares(espacios);
  conectarEventos();
}

// ---------- Lugares (RF-03, RF-04) ----------
function mostrarLugares(lista) {
  const ul = $('#resultados');
  ul.innerHTML = '';
  if (!lista.length) {
    ul.innerHTML = '<li><small>Sin resultados</small></li>';
    return;
  }
  for (const e of lista) {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${e.nombre}</strong><small>${e.clave} · ${NOMBRE_CATEGORIA[e.categoria]} · ${e.planta ?? ''}</small>`;
    li.addEventListener('click', () => abrirFicha(e.id));
    ul.appendChild(li);
  }
}

async function actualizarLugares() {
  const texto = $('#buscar-lugar').value;
  let lista = texto ? (await api.buscar(texto)).espacios : await api.espacios();
  if (categoriaActual) lista = lista.filter((e) => e.categoria === categoriaActual);
  mostrarLugares(lista);
}

// ---------- Ficha del lugar (RF-05, RF-06) ----------
async function abrirFicha(id) {
  const e = await api.espacio(id);
  mapa.enfocar(e);
  mapa.limpiarRuta();
  const ficha = $('#ficha');
  ficha.hidden = false;
  ficha.innerHTML = `
    <h2>${e.nombre}</h2>
    <small>${e.clave} · ${NOMBRE_CATEGORIA[e.categoria]} · ${e.edificio_nombre} · ${e.planta ?? ''}</small>
    ${e.foto ? `<img src="/${e.foto}" alt="Foto de ${e.nombre}" loading="lazy" />` : ''}
    <p>${e.descripcion ?? ''}</p>
    <label for="origen">¿Desde dónde vienes?</label>
    <select id="origen">${origenes.map((o) => `<option value="${o.id}">${o.nombre}</option>`).join('')}</select>
    <button id="ver-ruta">Cómo llegar</button>
    <p id="indicaciones"></p>`;
  $('#ver-ruta').addEventListener('click', () => mostrarRuta(e.id));
  history.replaceState(null, '', `#lugar/${e.id}`); // RF-11: enlace directo
}

async function mostrarRuta(id) {
  const origen = $('#origen').value;
  try {
    const ruta = await api.ruta(id, origen);
    mapa.dibujarRuta(ruta);
    $('#indicaciones').textContent = ruta.properties.indicaciones ?? '';
  } catch {
    mapa.limpiarRuta();
    $('#indicaciones').textContent = 'Todavía no hay ruta registrada desde ese punto.';
  }
}

// ---------- Docentes (RF-07) ----------
async function actualizarDocentes() {
  const lista = await api.docentes($('#buscar-docente').value);
  const ul = $('#resultados-docentes');
  ul.innerHTML = '';
  for (const d of lista) {
    const horario = d.horario.map((h) => `${h.dia} ${h.inicio}–${h.fin}`).join(', ') || 'Sin horario';
    const li = document.createElement('li');
    li.innerHTML = `<strong>${d.nombre}</strong><small>${d.departamento} · ${d.espacio_nombre ?? ''}</small><small>${horario}</small>`;
    if (d.espacio) li.addEventListener('click', () => abrirFicha(d.espacio));
    ul.appendChild(li);
  }
  if (!lista.length) ul.innerHTML = '<li><small>Sin resultados</small></li>';
}

// ---------- Eventos ----------
function conectarEventos() {
  $('#buscar-lugar').addEventListener('input', actualizarLugares);
  $('#buscar-docente').addEventListener('input', actualizarDocentes);

  $('#filtros').addEventListener('click', (ev) => {
    const boton = ev.target.closest('.filtro');
    if (!boton) return;
    document.querySelectorAll('.filtro').forEach((b) => b.classList.toggle('activo', b === boton));
    categoriaActual = boton.dataset.categoria;
    actualizarLugares();
  });

  document.querySelectorAll('.pestana[data-vista]').forEach((boton) =>
    boton.addEventListener('click', () => {
      document.querySelectorAll('.pestana[data-vista]').forEach((b) => b.classList.toggle('activa', b === boton));
      const vista = boton.dataset.vista;
      $('#vista-lugares').hidden = vista !== 'lugares';
      $('#vista-docentes').hidden = vista !== 'docentes';
      $('.contenido').hidden = vista === 'horario';
      $('#vista-horario').hidden = vista !== 'horario';
      $('#ficha').hidden = true;

      if (vista === 'horario') {
        cargarHorario();
      } else {
        window.dispatchEvent(new Event('resize'));

        if (vista === 'docentes') actualizarDocentes();
        if (vista === 'lugares') actualizarLugares();
      }
    }),
  );

  const enlace = location.hash.match(/^#lugar\/(.+)$/);
  if (enlace) abrirFicha(decodeURIComponent(enlace[1]));
}

iniciar().catch((err) => {
  console.error(err);
  document.body.insertAdjacentHTML('afterbegin', '<p style="padding:1rem;color:#b91c1c">No se pudo cargar UbicaTec. ¿Está corriendo el servidor?</p>');
});


// ---------- Cerrar sesion ----------
document.querySelector('#btn-logout').addEventListener('click', async () => {
  const boton = document.querySelector('#btn-logout');
  boton.disabled = true;

  try {
    const respuesta = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'same-origin'
    });

    if (!respuesta.ok) {
      throw new Error('No se pudo cerrar la sesión');
    }

    window.location.replace('/login.html');

  } catch (error) {
    alert(error.message);
    boton.disabled = false;
  }
});

// ---------- Perfil del alumno ----------
async function cargarPerfil() {
  try {
    const respuesta = await fetch('/api/auth/perfil', {
      credentials: 'same-origin',
      cache: 'no-store'
    });

    if (respuesta.status === 401) {
      window.location.replace('/login.html');
      return;
    }

    if (!respuesta.ok) {
      throw new Error('No se pudo cargar el perfil');
    }

    const alumno = await respuesta.json();

    document.querySelector('#nombre-alumno').textContent =
      alumno.nombre;

    document.querySelector('#control-alumno').textContent =
      alumno.numero_control;

    document.querySelector('#perfil-usuario').hidden = false;

  } catch (error) {
    console.error(error);
  }
}

cargarPerfil();