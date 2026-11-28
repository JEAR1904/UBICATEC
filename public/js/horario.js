const DIAS = [
  ['lunes', 'Lunes'],
  ['martes', 'Martes'],
  ['miercoles', 'Miércoles'],
  ['jueves', 'Jueves'],
  ['viernes', 'Viernes'],
  ['sabado', 'Sábado']
];

const COLORES = [
  '#fff3b2',
  '#f5b5ce',
  '#b0ded9',
  '#afe1f5',
  '#daebc6',
  '#dfc8ed',
  '#ffd9b3',
  '#c7d2fe',
  '#fecaca'
];

const $ = (sel) => document.querySelector(sel);

function minutos(hora) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

function formatoHora(valor) {
  const h = String(Math.floor(valor / 60)).padStart(2, '0');
  const m = String(valor % 60).padStart(2, '0');
  return `${h}:${m}`;
}

async function consultar(ruta) {
  const respuesta = await fetch('/api/auth/' + ruta, {
    credentials: 'same-origin',
    cache: 'no-store'
  });

  if (respuesta.status === 401) {
    window.location.replace('/login.html');
    throw new Error('Sesión expirada');
  }

  if (!respuesta.ok) {
    throw new Error('No se pudo consultar el horario');
  }

  return respuesta.json();
}

function mostrarResumen(clases) {
  const materias = new Set(clases.map(c => c.materia));

  const horas = clases.reduce(
    (total, c) => total + minutos(c.fin) - minutos(c.inicio),
    0
  ) / 60;

  const indicadores = [
    [materias.size, 'Materias'],
    [clases.length, 'Clases semanales'],
    [horas + ' h', 'Horas semanales']
  ];

  const resumen = $('#horario-resumen');
  resumen.replaceChildren();

  for (const [valor, etiqueta] of indicadores) {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'horario-indicador';

    const numero = document.createElement('strong');
    numero.textContent = valor;

    const texto = document.createElement('span');
    texto.textContent = etiqueta;

    tarjeta.append(numero, texto);
    resumen.appendChild(tarjeta);
  }
}

function mostrarTabla(clases) {
  const contenedor = $('#horario-tabla');
  contenedor.replaceChildren();

  const dias = DIAS.filter(
    ([id]) => id !== 'sabado' || clases.some(c => c.dia === id)
  );

  const materias = [...new Set(
    clases.map(c => c.materia)
  )].sort();

  const colores = new Map(
    materias.map((m, i) => [m, COLORES[i % COLORES.length]])
  );

  const inicio = Math.min(...clases.map(c => minutos(c.inicio)));
  const fin = Math.max(...clases.map(c => minutos(c.fin)));

  const tabla = document.createElement('table');
  tabla.className = 'tabla-horario';

  const encabezado = tabla.createTHead().insertRow();

  for (const titulo of ['Hora', ...dias.map(d => d[1])]) {
    const th = document.createElement('th');
    th.textContent = titulo;
    encabezado.appendChild(th);
  }

  const cuerpo = tabla.createTBody();

  for (let hora = inicio; hora < fin; hora += 60) {
    const fila = cuerpo.insertRow();

    const celdaHora = fila.insertCell();
    celdaHora.className = 'horario-hora';
    celdaHora.textContent = formatoHora(hora);

    for (const [dia] of dias) {
      const clase = clases.find(c =>
        c.dia === dia &&
        minutos(c.inicio) <= hora &&
        minutos(c.fin) > hora
      );

      // La celda ya esta cubierta por una clase de varias horas.
      if (clase && minutos(clase.inicio) < hora) {
        continue;
      }

      const celda = fila.insertCell();

      if (!clase) continue;

      celda.rowSpan = Math.ceil(
        (minutos(clase.fin) - minutos(clase.inicio)) / 60
      );

      const bloque = document.createElement('div');
      bloque.className = 'horario-clase';
      bloque.style.backgroundColor = colores.get(clase.materia);

      const nombre = document.createElement('strong');
      nombre.textContent = clase.materia;

      const aula = document.createElement('span');
      aula.textContent = 'Aula: ' + clase.aula;

      const horario = document.createElement('small');
      horario.textContent = clase.inicio + ' - ' + clase.fin;

      bloque.append(nombre, aula, horario);
      celda.appendChild(bloque);
    }
  }

  contenedor.appendChild(tabla);
}

export async function cargarHorario() {
  const mensaje = $('#horario-mensaje');
  const tabla = $('#horario-tabla');

  mensaje.hidden = true;
  tabla.hidden = true;
  tabla.replaceChildren();
  $('#horario-resumen').replaceChildren();

  try {
    const [alumno, clases] = await Promise.all([
      consultar('perfil'),
      consultar('horario')
    ]);

    $('#horario-alumno').textContent =
      alumno.nombre + ' | ' + alumno.carrera;

    mostrarResumen(clases);

    if (!clases.length) {
      mensaje.textContent = 'Horario pendiente de registrar.';
      mensaje.hidden = false;
      return;
    }

    mostrarTabla(clases);
    tabla.hidden = false;

  } catch (error) {
    mensaje.textContent = error.message;
    mensaje.hidden = false;
    console.error(error);
  }
}