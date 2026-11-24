// Todas las llamadas al servidor. Si cambia una ruta de la API, solo se cambia aquí.
async function pedir(ruta) {
  const res = await fetch(`/api${ruta}`);
  if (!res.ok) throw new Error(`Error ${res.status} en ${ruta}`);
  return res.json();
}

export const api = {
  edificios: () => pedir('/edificios'),
  espacios: (categoria = '') => pedir(`/espacios${categoria ? `?categoria=${categoria}` : ''}`),
  espacio: (id) => pedir(`/espacios/${encodeURIComponent(id)}`),
  ruta: (id, origen) => pedir(`/espacios/${encodeURIComponent(id)}/ruta?origen=${origen}`),
  origenes: () => pedir('/origenes'),
  buscar: (q) => pedir(`/buscar?q=${encodeURIComponent(q)}`),
  docentes: (q = '') => pedir(`/docentes?q=${encodeURIComponent(q)}`),
};
