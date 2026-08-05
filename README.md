# Vega Fotografía

Archivo fotográfico de San Rafael, Mendoza · 1965 — 2025.

Sitio web del archivo: una base de 6.549 registros que se puede buscar por
apellido, nombre o año, y las sesiones que ya fueron digitalizadas.

## Qué hay acá

| Archivo | Qué es |
|---|---|
| `index.html` | La portada: historia, buscador, sesiones, contacto |
| `sesion.html` | La página de cada sesión (se abre con `?id=…`) |
| `estilo.css` | Los estilos de toda la web |
| `app.js` | El buscador y la portada |
| `sesion.js` | La galería y el visor de fotos |
| `datos/clientes.js` | Los 6.549 registros del archivo |
| `datos/sesiones.js` | Las sesiones digitalizadas y sus fotos |
| `fotos/` | Las fotos ya preparadas para la web |

## Cómo se actualiza

Esta carpeta **no se edita a mano**. Se genera desde el archivo original
con el script `actualizar.ps1` que está en la carpeta de arriba.

1. Agregar, borrar o girar fotos en `Archivo Clientes\…`
2. Ejecutar `actualizar.ps1`
3. Ejecutar `publicar.ps1` para que los cambios se vean online
