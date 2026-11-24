# Requisitos del prototipo

Resumen del documento de requisitos del equipo. Fuentes: Acta de Constitución v1, EDT del equipo 4, lista de 36 actividades y Reporte de Gestión de la Calidad.

## Funcionales

| ID | Requisito | Prioridad | Estado |
|---|---|---|---|
| RF-01 | Mapa del campus con edificios delimitados y etiquetados; acercar, alejar y desplazar | Debe | Base hecha |
| RF-02 | Marcadores de aulas, laboratorios, departamentos y oficinas con color por categoría | Debe | Base hecha |
| RF-03 | Buscar por nombre o clave, sin distinguir acentos ni mayúsculas | Debe | Base hecha |
| RF-04 | Filtrar por categoría | Debe | Base hecha |
| RF-05 | Al elegir un lugar, centrar el mapa y abrir su ficha (nombre, clave, edificio, planta, descripción, foto) | Debe | Base hecha |
| RF-06 | Ruta dibujada desde un acceso hasta el lugar, con foto de referencia | Debe | Base hecha |
| RF-07 | Consultar docentes autorizados: departamento, lugar y horario, con "ver en el mapa" | Debe | Base hecha |
| RF-08 | Adaptado a computadora, tableta y celular | Debe | Base hecha |
| RF-09 | Elegir el punto de origen de la ruta | Debería | Base hecha |
| RF-10 | Video corto de orientación en la ficha | Debería | Pendiente |
| RF-11 | Enlace directo a un lugar (`#lugar/aula-f12`) | Podría | Base hecha |
| RF-12 | Panel de administración | Podría | Fuera del prototipo |

"Base hecha" significa que el código ya existe con datos de ejemplo; falta probarlo con datos reales.

## No funcionales

| ID | Requisito | Meta |
|---|---|---|
| RNF-01 | Funciona en Chrome, Edge, Firefox y Safari sin instalar nada | 360 px a 1920 px sin scroll horizontal |
| RNF-02 | Carga rápida con datos móviles | ≤ 3 s en 4G; búsqueda ≤ 0.5 s; fotos ≤ 300 KB |
| RNF-03 | Solo docentes con autorización; nunca correo, teléfono ni ubicación en tiempo real | 0 datos no autorizados |
| RNF-04 | Cada lugar coincide con el recorrido de validación | ≥ 95 % correctas |
| RNF-05 | Un estudiante encuentra un lugar sin ayuda | ≥ 85 % sin ayuda; ≤ 60 s; SUS ≥ 70 |
| RNF-06 | Interfaz en español, botones de al menos 44 px | Contraste AA |
| RNF-07 | Costo cero | $0 |
| RNF-08 | Repositorio con README y datos separados del código | Otro integrante lo levanta en ≤ 15 min |
