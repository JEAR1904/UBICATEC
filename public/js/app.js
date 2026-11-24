import { api } from './api.js';
import * as mapa from './mapa.js';

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

  document.querySelectorAll('.pestana').forEach((boton) =>
    boton.addEventListener('click', () => {
      document.querySelectorAll('.pestana').forEach((b) => b.classList.toggle('activa', b === boton));
      const vista = boton.dataset.vista;
      $('#vista-lugares').hidden = vista !== 'lugares';
      $('#vista-docentes').hidden = vista !== 'docentes';
      if (vista === 'docentes') actualizarDocentes();
    }),
  );

  const enlace = location.hash.match(/^#lugar\/(.+)$/);
  if (enlace) abrirFicha(decodeURIComponent(enlace[1]));
}

iniciar().catch((err) => {
  console.error(err);
  document.body.insertAdjacentHTML('afterbegin', '<p style="padding:1rem;color:#b91c1c">No se pudo cargar UbicaTec. ¿Está corriendo el servidor?</p>');
});
