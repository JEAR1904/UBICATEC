# Modelo de datos

Base de datos relacional en SQLite. El esquema completo está en [`db/esquema.sql`](../db/esquema.sql) (EDT 4.2 y 4.3).

```mermaid
erDiagram
    EDIFICIO ||--o{ ESPACIO : contiene
    ESPACIO  ||--o{ RUTA : "es destino de"
    ORIGEN   ||--o{ RUTA : "es inicio de"
    ESPACIO  ||--o{ DOCENTE : "atiende en"
    DOCENTE  ||--o{ HORARIO_ATENCION : tiene

    EDIFICIO { text id PK
               text clave UK
               text nombre
               text descripcion
               text poligono
               text foto }
    ESPACIO  { text id PK
               text clave UK
               text nombre
               text categoria
               text edificio_id FK
               text planta
               real lat
               real lng
               text descripcion
               text foto
               text video }
    ORIGEN   { text id PK
               text nombre
               real lat
               real lng }
    RUTA     { text id PK
               text origen_id FK
               text espacio_id FK
               text linea
               text indicaciones }
    DOCENTE  { text id PK
               text nombre
               text departamento
               text espacio_id FK
               int autorizado
               text fecha_autorizacion }
    HORARIO_ATENCION { int id PK
               text docente_id FK
               text dia
               text hora_inicio
               text hora_fin }
```

## Reglas importantes

- `espacio.categoria` solo acepta `aula`, `laboratorio`, `departamento`, `oficina` o `servicio`.
- Un docente no puede tener `autorizado = 1` sin `fecha_autorizacion` (restricción `CHECK`).
- La API consulta docentes **solo** a través de la vista `docente_publico`, que filtra `autorizado = 1` (RNF-03).
- Los contornos y rutas se guardan como texto GeoJSON, dibujados en geojson.io.

## Cómo se llena

Los datos se capturan en `datos/*.json` y `datos/*.geojson` (ver [datos/README.md](../datos/README.md)) y `npm run db:crear` los inserta en la base. Así los cambios de datos se revisan en GitHub como cualquier otro cambio.
