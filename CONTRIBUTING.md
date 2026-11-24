# Guía para colaborar

Reglas cortas para que los 4 trabajemos sin pisarnos.

## Ramas

- `main` siempre debe funcionar. **Nadie sube directo a `main`.**
- Cada tarea va en su propia rama, creada desde `main`:

| Tipo | Nombre de rama | Ejemplo |
|---|---|---|
| Función nueva | `feat/<tema>` | `feat/buscador-docentes` |
| Corrección | `fix/<tema>` | `fix/filtro-laboratorios` |
| Datos del campus | `datos/<tema>` | `datos/edificio-f` |
| Documentación | `docs/<tema>` | `docs/manual-usuario` |

```bash
git checkout main
git pull
git checkout -b feat/buscador-docentes
# ...trabajas...
git add .
git commit -m "feat: buscar docentes por departamento"
git push -u origin feat/buscador-docentes
```

## Mensajes de commit

Formato: `tipo: qué hiciste`, en español y en presente.

- `feat: mostrar foto en la ficha del lugar`
- `fix: la búsqueda ignoraba acentos`
- `datos: agregar aulas del edificio F`
- `docs: actualizar README`
- `estilo: ajustar botones en celular`

## Pull requests

1. Abre un Pull Request de tu rama hacia `main` y llena la plantilla.
2. Indica qué requisito cubre (por ejemplo `RF-03`) y la actividad de la EDT.
3. **Otro integrante** lo revisa y lo aprueba antes de hacer merge.
4. Después del merge, borra la rama.

## Antes de pedir revisión

- [ ] `npm run db:crear` y `npm run dev` corren sin errores.
- [ ] Lo probaste en computadora y en modo celular del navegador (F12 → icono de celular).
- [ ] No subiste datos de docentes sin autorización firmada (RNF-03).
- [ ] No subiste contraseñas, claves ni el archivo `db/ubicatec.db`.

## Issues

Usa los **Issues** de GitHub para tareas y errores. Etiquetas sugeridas: `frontend`, `servidor`, `base-de-datos`, `datos`, `documentación`, `bug`, y la prioridad `debe` / `debería` / `podría`.

## Estilo de código

- Nombres de variables y funciones en español, en `camelCase` (`abrirFicha`, `listaEspacios`).
- Indentación de 2 espacios (ya viene en `.editorconfig`).
- Si usas VS Code, instala las extensiones recomendadas que te sugiere al abrir el proyecto.
