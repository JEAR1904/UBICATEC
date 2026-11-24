# UbicaTec

Mapa interactivo del **Instituto Tecnológico de Culiacán**. Permite buscar aulas, laboratorios, oficinas y departamentos, verlos en el mapa con su ficha y foto, ver una ruta desde un acceso del campus y consultar docentes que autorizaron publicar su lugar y horario de atención.

Proyecto de la materia **Gestión de Proyectos de Software** · Equipo 4 · BYG INC.

| Rol | Integrante |
|---|---|
| Líder de proyecto | José Ernesto Ayala Rodríguez |
| Equipo | Joel Félix Rubio · Jeylen Isai García Félix · Jesús Daniel Ontiveros Sánchez |

> Estado: **prototipo**. Los datos de `datos/` son de ejemplo (coordenadas aproximadas y docentes ficticios) hasta terminar el recorrido de validación.

## Tecnologías

| Capa | Herramienta |
|---|---|
| Interfaz | HTML + CSS + JavaScript (sin frameworks) |
| Mapa | [Leaflet](https://leafletjs.com/) con mapa base de OpenStreetMap |
| Servidor | Node.js 20+ con Express |
| Base de datos | SQLite (relacional, un solo archivo) con [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) |
| Dibujo del mapa | [geojson.io](https://geojson.io) |

## Cómo correrlo

Requisitos: [Node.js 20 o más nuevo](https://nodejs.org) y Git.

```bash
git clone https://github.com/JEAR1904/UBICATEC.git
cd UBICATEC
npm install          # instala Express, SQLite y Leaflet
npm run db:crear     # crea db/ubicatec.db con el esquema y los datos de /datos
npm run dev          # abre http://localhost:3000
```

`npm run dev` reinicia el servidor solo cada vez que guardas un archivo del servidor. Los cambios en `public/` solo necesitan recargar la página.

Si cambias algo en `datos/` o en `db/esquema.sql`, vuelve a correr `npm run db:crear`.

## Estructura

```
UBICATEC/
├── public/              Interfaz (lo que ve el usuario)
│   ├── index.html
│   ├── css/estilos.css
│   └── js/
│       ├── app.js       Pantallas, buscador, filtros, ficha y docentes
│       ├── mapa.js      Todo lo de Leaflet: edificios, marcadores y rutas
│       └── api.js       Llamadas al servidor
├── server/              Servidor Node + Express
│   ├── index.js         Arranque y archivos estáticos
│   ├── db.js            Conexión a SQLite
│   ├── routes/api.js    Rutas de la API REST
│   └── data/repositorio.js  Consultas SQL
├── db/
│   ├── esquema.sql      Tablas, llaves y restricciones (modelo E-R)
│   └── crear-db.js      Crea la base y carga los datos
├── datos/               Datos del campus en JSON/GeoJSON (fuente para cargar la base)
│   └── fotos/           Fotos de referencia
└── docs/                Documentación técnica del proyecto
```

## API

| Método | Ruta | Para qué | Requisito |
|---|---|---|---|
| GET | `/api/edificios` | Edificios con su contorno (GeoJSON) | RF-01 |
| GET | `/api/espacios?categoria=aula` | Espacios, con filtro opcional | RF-02, RF-04 |
| GET | `/api/espacios/:id` | Ficha de un espacio | RF-05 |
| GET | `/api/espacios/:id/ruta?origen=principal` | Ruta desde un acceso | RF-06, RF-09 |
| GET | `/api/origenes` | Accesos del campus | RF-09 |
| GET | `/api/buscar?q=texto` | Lugares y docentes que coinciden | RF-03 |
| GET | `/api/docentes?q=nombre` | Solo docentes autorizados | RF-07, RNF-03 |

## Documentación

- [Requisitos del prototipo](docs/requisitos.md)
- [Modelo de datos](docs/modelo-datos.md)
- [Cómo capturar los datos del campus](datos/README.md)
- [Guía para colaborar](CONTRIBUTING.md)

## Fuera del alcance

Según el acta de constitución: app nativa Android/iOS, GPS o navegación en tiempo real, ubicación de personas, integración con Ámbar, kioscos o sensores, y datos de docentes sin autorización.
