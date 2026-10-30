# Portfolio Aeroespacial — instrucciones para Claude

Web estática (HTML + CSS + JS sin build) publicada desde la raíz del repo.

- `index.html` — estructura (navbar, portada, vista de proyecto).
- `styles.css` — sistema de diseño (tokens en `:root`) + estilos de la página de Zaragoza (`.zp-*`).
- `app.js` — router por hash (`#/project/<id>`), render de tarjetas/pestañas/pasos, gráficos Plotly y efectos (revelado, navbar, transiciones).
- `projects.js` — datos de los proyectos. `zaragoza.js` / `zaragoza-data.js` — página interactiva propia.

## Estilo visual (obligatorio)

**Antes de cualquier cambio visual, lee `DESIGN.md` y síguelo.** En resumen:

- Grises como color principal, naranja-rojo `--accent` como secundario y azul acero `--tertiary` como terciario. Usa siempre los tokens de `:root`; nunca colores sueltos.
- Inter Tight (títulos, peso 500, interletraje negativo), Inter (texto), JetBrains Mono (etiquetas, cifras), Instrument Serif itálica solo para resaltar una palabra en un titular.
- Líneas de 1 px, radios pequeños, sin brillos ni sombras de color, nada «futurista».
- Animaciones con los tokens `--ease-*` / `--dur-*`; bloques nuevos con la clase `reveal`; respetar `prefers-reduced-motion`.
- Apartados nuevos: plantilla `section` + `section-head` (ver «Recetas» en `DESIGN.md`).
- Tras cambiar CSS/JS, actualiza el `?v=` de `index.html`.
