# Guía de estilo — Portfolio Aeroespacial

Referencia visual del portfolio. Cualquier apartado, proyecto o componente nuevo
debe seguir estas reglas para que la web siga siendo coherente.

**Idea general:** estética editorial y sobria, propia de un diseñador gráfico.
Fondo grafito, tipografía grande y ajustada, líneas finas de 1 px, mucho aire
y un único color de acento. El movimiento es suave y corto: acompaña, no decora.

---

## 1. Color

Todos los colores están definidos como tokens en `:root` (`styles.css`).
**No escribas colores sueltos (hex/rgba) en componentes nuevos:** usa siempre los tokens.

| Papel | Token | Valor | Uso |
|---|---|---|---|
| Principal | `--gray-950 … --gray-50` | `#0d0d0e` → `#f7f7f6` | Fondos, texto, líneas. El 90 % de la página. |
| Secundario (acento) | `--accent` | `#e8552b` naranja-rojo | Solo para lo importante: CTA, elemento activo, cifra clave, punto de estado. |
| | `--accent-hover` / `--accent-deep` | `#ff6b3d` / `#b8401f` | Hover y variante oscura. |
| | `--accent-soft` / `--accent-line` | rgba 12 % / 40 % | Fondos y bordes tintados. |
| | `--on-accent` | `#111112` | Texto sobre fondo naranja (más contraste que el blanco). |
| Terciario | `--tertiary` | `#8aa1b9` azul acero | Datos e información secundaria: software, series secundarias de gráficos, estado «Completado». |
| | `--tertiary-soft` / `--tertiary-line` | rgba 12 % / 40 % | Fondos y bordes. |

Roles semánticos (úsalos antes que los grises directos):

- Fondos: `--bg`, `--bg-raised` (tarjetas), `--bg-elevated` (cabeceras de tabla, menús), `--bg-sunken` (cajas hundidas).
- Texto: `--text` (principal), `--text-2` (secundario), `--text-3` (etiquetas, metadatos).
- Líneas: `--line` (separadores), `--line-strong` (bordes de botón/tarjeta en hover).

**Regla de proporción:** grises ≈ 90 %, acento ≤ 7 %, terciario ≤ 3 %.
Si una pantalla tiene más de 2–3 elementos naranjas a la vez, sobra alguno.

### Gráficos (Plotly)

Usan los mismos valores: `CHART` en `app.js` y `C` en `zaragoza.js`.
Serie principal → acento; serie secundaria → terciario; resto → grises.
Fondo transparente y rejilla `rgba(255,255,255,0.07)`.

---

## 2. Tipografía

| Token | Fuente | Uso |
|---|---|---|
| `--font-display` | Inter Tight 500 | Títulos. Interletraje negativo (−0.02 a −0.045 em). |
| `--font-body` | Inter 400/500 | Texto corrido. |
| `--font-mono` | JetBrains Mono | Etiquetas en MAYÚSCULAS, números de índice (01, 02…), cifras y tags. |
| `--font-serif` | Instrument Serif *itálica* | Solo para resaltar **una palabra** en un titular grande (p. ej. *aeroespacial*). Nunca en párrafos. |

Escala: `--fs-2xs` (11 px) · `--fs-xs` · `--fs-sm` · `--fs-base` · `--fs-md` · `--fs-lg` · `--fs-xl` · `--fs-2xl` · `--fs-3xl` (portada).
Los títulos usan peso 500, no negrita: el tamaño marca la jerarquía.

Patrón de etiqueta (eyebrow): `<span class="eyebrow">Texto</span>`; con punto naranja animado: `<span class="eyebrow"><span class="dot"></span>Texto</span>`.

---

## 3. Espaciado, layout y forma

- Contenedor: `.container` (máx. `--container` = 1240 px, márgenes laterales `--gutter`).
- Espaciado: `--space-2xs` (4 px) → `--space-4xl` (128 px). Entre secciones: `--space-4xl`.
- Radios contenidos: `--radius-sm` 4 px, `--radius-md` 8 px (tarjetas, imágenes), `--radius-pill` (botones, tags).
- Bordes siempre de 1 px con `--line` / `--line-strong`. Sin sombras de color ni brillos («glow»).
- Numeración editorial: `01`, `02`… en mono (`pad2()` en `app.js`).

---

## 4. Movimiento

Tokens: `--ease-out` (expo, por defecto), `--ease-in-out` (transiciones de vista);
duraciones `--dur-1` 160 ms (color/hover), `--dur-2` 320 ms (UI), `--dur-3` 600 ms (desplegables), `--dur-4` 1000 ms (revelados).

| Efecto | Cómo usarlo |
|---|---|
| Revelado al hacer scroll | Añade la clase `reveal` a cualquier bloque. Retardo opcional: `style="--d: 120ms"`. Si el bloque se crea por JS, llama a `observeReveals(contenedor)`. |
| Titular línea a línea | `<h1><span class="line"><span>Texto</span></span></h1>` (ya en portada y cabecera de proyecto). |
| Imagen con máscara | `.project-hero-media` (recorte de abajo arriba + ligero zoom de asentamiento). |
| Desplegable | Cabecera con `data-toggle` + cuerpo `.collapse > .collapse-inner`; el padre lleva `.expandable-card`. La altura se anima sola. |
| Hover de tarjeta | Imagen de gris a color + zoom 4 %, flecha que avanza, índice que pasa a naranja. |
| Navbar | Se vuelve opaca al hacer scroll, se oculta al bajar y reaparece al subir. Barra de progreso naranja de 1 px. |
| Cambio de vista | Fundido de 320 ms entre portada y proyecto (`#app.is-leaving`). |

Reglas:
- Solo se animan `opacity`, `transform`, `clip-path` y colores. Nada de rebotes, giros 3D ni partículas.
- Desplazamientos pequeños (≤ 28 px) y un único efecto por elemento.
- Todo respeta `prefers-reduced-motion` (se desactiva automáticamente).

---

## 5. Componentes disponibles

`eyebrow` · `tag` · `btn` / `btn ghost` · `link-underline` · `section` + `section-head` ·
`project-card` · `status-badge` · `software-badge` · `timeline` · `download-box` ·
`wip-panel` · `table-responsive` (tablas dentro de `custom-html-content`) · `chart-container`.

---

## 6. Recetas

### Añadir un apartado nuevo en la portada (p. ej. «Sobre mí», «Experiencia», «Contacto»)

1. En `index.html`, dentro de `#landing-view` y antes del `<footer>`, copia la plantilla comentada que hay bajo la sección de proyectos:

   ```html
   <section class="section" id="sobre-mi">
     <div class="container">
       <header class="section-head reveal">
         <span class="section-index">02</span>
         <div>
           <span class="eyebrow">Etiqueta corta</span>
           <h2 class="section-title">Título del apartado</h2>
         </div>
         <p class="section-intro">Una o dos frases de introducción.</p>
       </header>
       <!-- contenido; añade class="reveal" a cada bloque -->
     </div>
   </section>
   ```

2. Numera `section-index` de forma correlativa (01 Proyectos, 02…, 03…).
3. Añade el enlace en `.navbar-links`: `<a href="#sobre-mi" class="link-underline">Sobre mí</a>`.
   Los enlaces `#id` hacen scroll suave sin interferir con el router (`#/project/…`).
4. Para estilos propios, añade un bloque nuevo en `styles.css` usando solo tokens.

### Añadir un proyecto

Añade un objeto al array `PROJECTS` en `projects.js` (mismo formato que los existentes).
La tarjeta, la cabecera con imagen, las pestañas y los pasos se generan solos con este estilo.
Para estado, usa «En progreso» (punto naranja) o «Completado» (punto azul acero).

### Cuando se cambien CSS/JS

Sube el parámetro de versión `?v=AAAAMMDD` de los `<link>`/`<script>` en `index.html`
para que el navegador no use la versión en caché.
