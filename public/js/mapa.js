// Mapa con Leaflet (RF-01, RF-02, RF-06). Leaflet se carga en index.html como variable global L.
const CENTRO_ITC = [24.7896, -107.3984]; // aproximado, ajustar con el recorrido
const COLORES = {
  aula: '#2563eb',
  laboratorio: '#16a34a',
  departamento: '#9333ea',
  oficina: '#ea580c',
  servicio: '#0891b2',
};

let mapa;
let capaMarcadores;
let capaRuta;
const marcadores = new Map();

export function iniciarMapa(idContenedor) {
  mapa = L.map(idContenedor).setView(CENTRO_ITC, 18);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
    maxNativeZoom: 19,
    attribution: '&copy; OpenStreetMap',
  }).addTo(mapa);
  capaMarcadores = L.layerGroup().addTo(mapa);
  capaRuta = L.layerGroup().addTo(mapa);
  return mapa;
}

export function dibujarEdificios(geojson) {
  L.geoJSON(geojson, {
    style: { color: '#7a1f3d', weight: 2, fillOpacity: 0.15 },
    onEachFeature: (f, capa) =>
      capa.bindTooltip(f.properties.nombre, { permanent: true, direction: 'center', className: 'etiqueta' }),
  }).addTo(mapa);
}

export function dibujarEspacios(espacios, alElegir) {
  capaMarcadores.clearLayers();
  marcadores.clear();
  for (const e of espacios) {
    const m = L.circleMarker([e.lat, e.lng], {
      radius: 8,
      color: '#fff',
      weight: 2,
      fillColor: COLORES[e.categoria] || '#6b7280',
      fillOpacity: 1,
    })
      .bindTooltip(`${e.clave} · ${e.nombre}`)
      .on('click', () => alElegir(e.id))
      .addTo(capaMarcadores);
    marcadores.set(e.id, m);
  }
}

export function enfocar(espacio) {
  mapa.setView([espacio.lat, espacio.lng], 19);
  marcadores.get(espacio.id)?.openTooltip();
}

export function dibujarRuta(feature) {
  capaRuta.clearLayers();
  if (!feature) return;
  const linea = L.geoJSON(feature, { style: { color: '#dc2626', weight: 5, dashArray: '8 6' } });
  linea.addTo(capaRuta);
  mapa.fitBounds(linea.getBounds(), { padding: [40, 40] });
}

export function limpiarRuta() {
  capaRuta.clearLayers();
}
