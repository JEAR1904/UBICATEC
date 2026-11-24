# Datos del campus

Aquí viven **todos** los datos del mapa, separados del código (RNF-08). El frontend y el backend leen estos mismos archivos.

> ⚠️ Los datos actuales son **de ejemplo**: coordenadas aproximadas y docentes ficticios. Se reemplazan con los del recorrido de validación (EDT 2.2) y las autorizaciones firmadas.

| Archivo | Contenido | Formato |
|---|---|---|
| `edificios.geojson` | Contorno de cada edificio | GeoJSON `Polygon` con `properties.id`, `clave`, `nombre`, `descripcion`, `foto` |
| `espacios.json` | Aulas, laboratorios, oficinas, departamentos, servicios | Lista de objetos (ver abajo) |
| `origenes.json` | Puntos de partida de las rutas (accesos) | Lista `{ id, nombre, lat, lng }` |
| `rutas.geojson` | Camino peatonal de un origen a un espacio | GeoJSON `LineString` con `properties.origen`, `destino`, `indicaciones` |
| `docentes.json` | Docentes **con autorización firmada** y su horario | Lista de objetos (ver abajo) |
| `fotos/` | Fotos de referencia | JPG de 1280 px, máximo 300 KB |

## Cómo dibujar en geojson.io

1. Abre <https://geojson.io>, cambia el mapa base a **Satellite**.
2. Dibuja el edificio con la herramienta de polígono (o la ruta con la de línea).
3. En la tabla de propiedades agrega `id`, `clave`, `nombre`, etc.
4. Copia el JSON y pégalo en el archivo correspondiente.

## Campos de `espacios.json`

```json
{
  "id": "lab-computo",
  "clave": "CC-1",
  "nombre": "Centro de Cómputo",
  "categoria": "laboratorio",
  "edificio": "edif-cc",
  "planta": "Planta baja",
  "lat": 24.7896,
  "lng": -107.3979,
  "descripcion": "Texto corto",
  "foto": "fotos/cc-1.jpg",
  "video": null
}
```

`categoria` solo puede ser: `aula`, `laboratorio`, `departamento`, `oficina`, `servicio`.

## Campos de `docentes.json`

```json
{
  "id": "doc-001",
  "nombre": "Nombre Apellido",
  "departamento": "Sistemas y Computación",
  "espacio": "depto-sistemas",
  "autorizado": true,
  "fechaAutorizacion": "2026-11-20",
  "horario": [{ "dia": "lunes", "inicio": "10:00", "fin": "12:00" }]
}
```

**Regla de privacidad (RNF-03):** nunca agregar correo, teléfono ni ubicación en tiempo real. El sistema solo muestra docentes con `"autorizado": true`.
