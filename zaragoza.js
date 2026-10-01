/**
 * zaragoza.js — Secciones interactivas del proyecto
 * "Planificación de la demanda del aeropuerto de Zaragoza".
 * Cada función recibe un contenedor y pinta su contenido + gráficos Plotly.
 */
(function () {
  const D = typeof ZARAGOZA_DATA !== 'undefined' ? ZARAGOZA_DATA : null;
  const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const MESES_L = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const C = {
    accent: '#c75b39', green: '#8a9a5b', sand: '#d9b26f', text: '#e0ddd9',
    muted: '#9a9590', faint: '#6b6560', grid: 'rgba(224,221,217,0.07)'
  };
  const PAX_2025 = 707493;
  const fmt = (n, d = 0) => Number(n).toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d });
  const iso = (y, m) => `${y}-${String(m).padStart(2, '0')}-01`;
  const PLOT_CFG = { responsive: true, displaylogo: false, modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d'] };

  function layout(extra) {
    const base = {
      paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
      font: { family: 'Inter, sans-serif', color: C.muted, size: 12 },
      margin: { l: 60, r: 20, t: 20, b: 50 },
      hoverlabel: { bgcolor: '#1a1a1a', bordercolor: C.accent, font: { color: C.text, family: 'Inter, sans-serif' } },
      legend: { orientation: 'h', y: 1.1, x: 0, font: { color: C.text } },
      xaxis: { gridcolor: C.grid, zeroline: false, linecolor: C.grid },
      yaxis: { gridcolor: C.grid, zeroline: false, linecolor: C.grid, separatethousands: true }
    };
    return deepMerge(base, extra || {});
  }
  function deepMerge(a, b) {
    for (const k in b) {
      if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k]) a[k] = deepMerge({ ...a[k] }, b[k]);
      else a[k] = b[k];
    }
    return a;
  }
  function plot(el, traces, lay) {
    if (typeof Plotly === 'undefined') { el.innerHTML = '<p class="zgz-note">No se pudo cargar Plotly.</p>'; return; }
    Plotly.react(el, traces, layout(lay), PLOT_CFG);
  }
  function kpis(items) {
    return `<div class="zgz-kpis">${items.map(k => `
      <div class="zgz-kpi">
        <div class="zgz-kpi-value" data-count="${k.value}" data-dec="${k.dec || 0}">${k.prefix || ''}${fmt(k.value, k.dec || 0)}${k.suffix || ''}</div>
        <div class="zgz-kpi-label">${k.label}</div>
        ${k.sub ? `<div class="zgz-kpi-sub">${k.sub}</div>` : ''}
      </div>`).join('')}</div>`;
  }
  // Animación de conteo en las tarjetas de cifras clave
  function animateCounts(root) {
    root.querySelectorAll('[data-count]').forEach(el => {
      const target = parseFloat(el.dataset.count), dec = +el.dataset.dec;
      const txt = el.textContent, num = fmt(target, dec);
      const [pre, suf] = [txt.slice(0, txt.indexOf(num)), txt.slice(txt.indexOf(num) + num.length)];
      const t0 = performance.now(), dur = 1100;
      (function step(t) {
        const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = pre + fmt(target * e, dec) + suf;
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }
  function segmented(name, options, active) {
    return `<div class="zgz-seg" data-name="${name}">${options.map(o =>
      `<button type="button" data-value="${o.value}" class="${o.value === active ? 'active' : ''}">${o.label}</button>`).join('')}</div>`;
  }
  function bindSeg(root, name, cb) {
    const seg = root.querySelector(`.zgz-seg[data-name="${name}"]`);
    seg.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      seg.querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
      cb(b.dataset.value);
    });
  }
  function card(title, desc, body) {
    return `<div class="zgz-card">${title ? `<h3 class="zgz-card-title">${title}</h3>` : ''}${desc ? `<p class="zgz-card-desc">${desc}</p>` : ''}${body}</div>`;
  }

  // Totales anuales (años completos) a partir de la serie completa
  function annualTotals() {
    const by = {};
    D.completa.forEach(([y, , s, l]) => { (by[y] = by[y] || { n: 0, t: 0 }); by[y].n++; by[y].t += s + l; });
    return Object.keys(by).filter(y => by[y].n === 12).map(y => [+y, by[y].t]);
  }

  // ===================== 1. Evolución histórica =====================
  function historico(el) {
    const annual = annualTotals();
    const peak = annual.reduce((a, b) => (b[1] > a[1] ? b : a));
    el.innerHTML = `
      ${kpis([
        { value: PAX_2025, label: 'Pasajeros en 2025', sub: 'Coincide con el balance de Aena' },
        { value: 268, label: 'Meses de datos Aena', sub: 'Enero 2004 – abril 2026' },
        { value: peak[1], label: `Récord anual (${peak[0]})`, sub: 'Máximo de la serie' },
        { value: 50.1, dec: 1, suffix: ' %', label: 'Salidas sobre el total', sub: '49,9 % llegadas: flujos equilibrados' }
      ])}
      ${card('Pasajeros mensuales 2004 – 2026',
        'Activa o desactiva cada serie, incluye los meses de la pandemia o superpón la tendencia (media móvil centrada de 12 meses). Arrastra sobre el gráfico o usa el selector inferior para hacer zoom.',
        `<div class="zgz-controls">
          ${segmented('serie', [{ value: 'total', label: 'Total' }, { value: 'split', label: 'Salidas / Llegadas' }], 'total')}
          <label class="zgz-check"><input type="checkbox" id="zgz-covid" checked> Mostrar 2020-2021</label>
          <label class="zgz-check"><input type="checkbox" id="zgz-mm" checked> Tendencia (media móvil)</label>
        </div>
        <div class="chart-container zgz-chart" id="zgz-hist"></div>`)}
      ${card('Pasajeros por año', 'Haz clic en una barra para ver ese año en el gráfico mensual.', '<div class="chart-container zgz-chart zgz-chart-sm" id="zgz-annual"></div>')}
      <div class="zgz-callout">
        <strong>¿Por qué se excluye la pandemia?</strong> En abril de 2020 el aeropuerto registró solo 4 pasajeros, y en 2021 la recuperación produjo crecimientos desproporcionados sobre una base mínima. Esos 24 meses se dejan fuera de la tendencia, la estacionalidad y la regresión con el PIB, de modo que el análisis central se apoya en 244 meses.
      </div>`;
    animateCounts(el);

    const st = { serie: 'total', covid: true, mm: true };
    const mm = {};
    D.serie.forEach(r => { if (r[5]) mm[iso(r[0], r[1])] = r[5]; });
    const histEl = el.querySelector('#zgz-hist');

    function draw() {
      const rows = D.completa.filter(r => st.covid || (r[0] !== 2020 && r[0] !== 2021));
      const x = rows.map(r => iso(r[0], r[1]));
      const gap = { connectgaps: false };
      // Inserta un hueco visual donde se quitan 2020-2021
      const withGap = arr => { if (st.covid) return [x, arr]; const xi = [], yi = []; x.forEach((d, i) => { if (d === '2022-01-01') { xi.push('2020-06-01'); yi.push(null); } xi.push(d); yi.push(arr[i]); }); return [xi, yi]; };
      const traces = [];
      if (st.serie === 'total') {
        const [xx, yy] = withGap(rows.map(r => r[2] + r[3]));
        traces.push({ x: xx, y: yy, name: 'Pasajeros totales', type: 'scatter', mode: 'lines', line: { color: C.accent, width: 1.6 }, fill: 'tozeroy', fillcolor: 'rgba(199,91,57,0.12)', hovertemplate: '%{x|%b %Y}<br><b>%{y:,.0f}</b> pasajeros<extra></extra>', ...gap });
      } else {
        const [x1, y1] = withGap(rows.map(r => r[2]));
        const [x2, y2] = withGap(rows.map(r => r[3]));
        traces.push({ x: x1, y: y1, name: 'Salidas', mode: 'lines', line: { color: C.accent, width: 1.5 }, hovertemplate: '%{x|%b %Y}<br>Salidas: <b>%{y:,.0f}</b><extra></extra>', ...gap });
        traces.push({ x: x2, y: y2, name: 'Llegadas', mode: 'lines', line: { color: C.green, width: 1.5 }, hovertemplate: '%{x|%b %Y}<br>Llegadas: <b>%{y:,.0f}</b><extra></extra>', ...gap });
      }
      if (st.mm) {
        const keys = Object.keys(mm).sort();
        const ym = keys.map(k => st.serie === 'total' ? mm[k] : mm[k] / 2);
        const xi = [], yi = [];
        keys.forEach((k, i) => { if (k === '2022-01-01') { xi.push('2020-06-01'); yi.push(null); } xi.push(k); yi.push(ym[i]); });
        traces.push({ x: xi, y: yi, name: st.serie === 'total' ? 'Tendencia (MM 12)' : 'Tendencia por sentido', mode: 'lines', line: { color: C.text, width: 2.5, dash: 'dot' }, connectgaps: false, hovertemplate: '%{x|%b %Y}<br>Tendencia: <b>%{y:,.0f}</b><extra></extra>' });
      }
      const shapes = [], annotations = [];
      const ev = [['2008-03-01', 'Nueva terminal (Expo 2008)'], ['2011-05-01', 'Máx. tendencia: 62.731/mes'], ['2025-09-01', 'Ryanair −45 % capacidad']];
      ev.forEach(([d, t], i) => {
        shapes.push({ type: 'line', x0: d, x1: d, yref: 'paper', y0: 0, y1: 1, line: { color: C.faint, width: 1, dash: 'dot' } });
        annotations.push({ x: d, yref: 'paper', y: 1 - i * 0.07, text: t, showarrow: false, xanchor: i === 2 ? 'right' : 'left', font: { size: 10, color: C.muted }, bgcolor: 'rgba(13,13,13,0.7)' });
      });
      if (st.covid) {
        shapes.push({ type: 'rect', x0: '2020-01-01', x1: '2021-12-31', yref: 'paper', y0: 0, y1: 1, fillcolor: 'rgba(199,91,57,0.08)', line: { width: 0 } });
        annotations.push({ x: '2021-01-01', yref: 'paper', y: 0.5, text: 'Pandemia<br>(excluida)', showarrow: false, font: { size: 10, color: C.accent } });
      }
      plot(histEl, traces, {
        shapes, annotations, hovermode: 'x unified', margin: { b: 30 },
        xaxis: { type: 'date', rangeslider: { visible: true, thickness: 0.08, bgcolor: 'rgba(255,255,255,0.02)' }, range: histEl._range },
        yaxis: { title: 'Pasajeros / mes' }
      });
    }
    bindSeg(el, 'serie', v => { st.serie = v; draw(); });
    el.querySelector('#zgz-covid').addEventListener('change', e => { st.covid = e.target.checked; draw(); });
    el.querySelector('#zgz-mm').addEventListener('change', e => { st.mm = e.target.checked; draw(); });
    draw();

    const anEl = el.querySelector('#zgz-annual');
    plot(anEl, [{
      x: annual.map(a => a[0]), y: annual.map(a => a[1]), type: 'bar',
      marker: { color: annual.map(a => (a[0] === 2020 || a[0] === 2021) ? C.faint : a[0] === peak[0] ? C.sand : C.accent), opacity: 0.9 },
      hovertemplate: '%{x}: <b>%{y:,.0f}</b> pasajeros<extra></extra>'
    }], { xaxis: { dtick: 2 }, yaxis: { title: 'Pasajeros / año' }, margin: { t: 10 } });
    if (anEl.on) anEl.on('plotly_click', ev => {
      const y = ev.points[0].x;
      Plotly.relayout(histEl, { 'xaxis.range': [`${y - 1}-12-15`, `${y + 1}-01-15`] });
      histEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  // ===================== 2. Estacionalidad =====================
  function estacionalidad(el) {
    el.innerHTML = `
      ${kpis([
        { value: 1.42, dec: 2, label: 'Índice de agosto', sub: '+42 % sobre un mes medio' },
        { value: 0.71, dec: 2, label: 'Índice de enero', sub: '−29 % bajo un mes medio' },
        { value: 2, suffix: '×', label: 'Pico frente a valle', sub: 'Agosto duplica a enero' },
        { value: 11.97, dec: 2, label: 'Suma de los 12 índices', sub: 'Control: debe ser ≈ 12' }
      ])}
      ${card('Índice estacional medio por mes',
        'I = pasajeros del mes / media móvil. Un valor de 1 es un mes medio. Los colores agrupan la temporada alta, media y baja.',
        `<div class="zgz-controls">${segmented('flujo', [{ value: '2', label: 'Total' }, { value: '0', label: 'Salidas' }, { value: '1', label: 'Llegadas' }, { value: 'cmp', label: 'Comparar' }], '2')}</div>
         <div class="chart-container zgz-chart" id="zgz-idx"></div>`)}
      ${card('Mapa de calor: pasajeros por mes y año',
        'Cada celda es un mes. Se aprecia el mismo patrón de verano año tras año, los cambios de nivel del aeropuerto y el hundimiento de la pandemia.',
        `<div class="zgz-controls">${segmented('heat', [{ value: 'abs', label: 'Pasajeros' }, { value: 'rel', label: 'Relativo a la media del año' }], 'abs')}</div>
         <div class="chart-container zgz-chart" id="zgz-heat"></div>`)}
      <div class="zgz-callout"><strong>Salidas frente a llegadas.</strong> Enero y junio pesan más en las salidas; septiembre y diciembre en las llegadas (regreso de vacaciones y fiestas). A lo largo del año ambos flujos se compensan, así que el dimensionamiento se hace con el índice del total.</div>`;
    animateCounts(el);

    const season = i => [6, 7, 8].includes(i) ? C.accent : [0, 1, 10].includes(i) ? '#5d6b7a' : C.sand;
    const idxEl = el.querySelector('#zgz-idx');
    function drawIdx(v) {
      let traces;
      if (v === 'cmp') {
        traces = [
          { x: MESES, y: D.indices.map(r => r[0]), name: 'Salidas', type: 'bar', marker: { color: C.accent } },
          { x: MESES, y: D.indices.map(r => r[1]), name: 'Llegadas', type: 'bar', marker: { color: C.green } }
        ];
        traces.forEach(t => t.hovertemplate = '%{x}: <b>%{y:.3f}</b><extra>%{fullData.name}</extra>');
      } else {
        const y = D.indices.map(r => r[+v]);
        traces = [{
          x: MESES, y, type: 'bar', marker: { color: y.map((_, i) => season(i)) },
          text: y.map(t => (t >= 1 ? '+' : '−') + Math.abs(Math.round((t - 1) * 100)) + '%'), textposition: 'outside', textfont: { color: C.text, size: 11 },
          customdata: MESES_L, hovertemplate: '%{customdata}<br>Índice <b>%{y:.3f}</b><extra></extra>', showlegend: false
        }];
      }
      plot(idxEl, traces, {
        barmode: 'group', yaxis: { range: [0, 1.6], title: 'Índice estacional' },
        shapes: [{ type: 'line', xref: 'paper', x0: 0, x1: 1, y0: 1, y1: 1, line: { color: C.text, width: 1, dash: 'dash' } }],
        annotations: [{ xref: 'paper', x: 1, y: 1, text: 'Mes medio', showarrow: false, xanchor: 'right', yanchor: 'bottom', font: { size: 10, color: C.muted } }]
      });
    }
    bindSeg(el, 'flujo', drawIdx); drawIdx('2');

    const years = [...new Set(D.completa.map(r => r[0]))];
    const heatEl = el.querySelector('#zgz-heat');
    function drawHeat(v) {
      const z = years.map(y => MESES.map((_, m) => { const r = D.completa.find(q => q[0] === y && q[1] === m + 1); return r ? r[2] + r[3] : null; }));
      let zz = z;
      if (v === 'rel') zz = z.map(row => { const vals = row.filter(x => x != null); if (vals.length < 12) return row.map(() => null); const avg = vals.reduce((a, b) => a + b, 0) / 12; return row.map(x => x / avg); });
      plot(heatEl, [{
        type: 'heatmap', x: MESES, y: years, z: zz, xgap: 2, ygap: 2,
        colorscale: v === 'rel' ? [[0, '#2b3440'], [0.5, '#1a1a1a'], [1, C.accent]] : [[0, '#141414'], [0.4, '#5a2a1c'], [0.8, C.accent], [1, '#f0c27b']],
        zmid: v === 'rel' ? 1 : undefined,
        hovertemplate: v === 'rel' ? '%{x} %{y}<br><b>%{z:.2f}</b> × media del año<extra></extra>' : '%{x} %{y}<br><b>%{z:,.0f}</b> pasajeros<extra></extra>',
        colorbar: { tickfont: { color: C.muted }, outlinewidth: 0, thickness: 10 }
      }], { yaxis: { autorange: 'reversed', dtick: 1 }, margin: { l: 50 } });
    }
    bindSeg(el, 'heat', drawHeat); drawHeat('abs');
  }

  // ===================== 3. Relación con el PIB =====================
  function regression(pts) {
    const n = pts.length, mx = pts.reduce((a, p) => a + p.x, 0) / n, my = pts.reduce((a, p) => a + p.y, 0) / n;
    let sxy = 0, sxx = 0, syy = 0;
    pts.forEach(p => { sxy += (p.x - mx) * (p.y - my); sxx += (p.x - mx) ** 2; syy += (p.y - my) ** 2; });
    const b = sxy / sxx;
    return { b, a: my - b * mx, r2: (sxy * sxy) / (sxx * syy), n };
  }
  function pib(el) {
    el.innerHTML = `
      <div class="zgz-formula">ln T = ln A + ε · ln PIB &nbsp;→&nbsp; <span>ε = % de variación del tráfico por cada 1 % de PIB</span></div>
      ${card('Tráfico frente a PIB (escala logarítmica)',
        'Cada punto es un trimestre (78, sin la pandemia). El eje vertical usa la media móvil trimestral, ya sin estacionalidad. La pendiente de la recta es la elasticidad. Prueba a quitar el trimestre incompleto de 2025, que solo contiene octubre.',
        `<div class="zgz-controls">
           <label class="zgz-check"><input type="checkbox" id="zgz-partial"> Excluir 2025 T4 (trimestre parcial)</label>
         </div>
         <div class="zgz-kpis zgz-kpis-inline" id="zgz-reg"></div>
         <div class="chart-container zgz-chart" id="zgz-scatter"></div>`)}
      <div class="zgz-grid2">
        ${card('Tasa de crecimiento del PIB', '', `<div class="zgz-big">1,55 %<small> anual</small></div><p class="zgz-card-desc">CAGR entre 2004 T3 (91,99) y 2025 T4 (128,15) a lo largo de 21,5 años. Justifica el escenario base del 1,5 %.</p>`)}
        ${card('Lectura', '', `<p class="zgz-card-desc">Con ε = 1,07 el tráfico crece algo más deprisa que la economía. Pero la nube es muy dispersa (R² bajo): el PIB explica solo una parte de la variación. El resto depende sobre todo de las rutas que deciden las aerolíneas, en especial Ryanair.</p>`)}
      </div>`;
    const all = D.pib.map(r => ({ x: r[2], y: r[3], lbl: `${r[0]} ${r[1]}`, yr: r[0], partial: r[0] === 2025 && r[1] === 'T4' }));
    const sc = el.querySelector('#zgz-scatter'), regEl = el.querySelector('#zgz-reg');
    function draw(excl) {
      const pts = excl ? all.filter(p => !p.partial) : all;
      const r = regression(pts);
      regEl.innerHTML = `
        <div class="zgz-kpi"><div class="zgz-kpi-value">${fmt(r.b, 2)}</div><div class="zgz-kpi-label">Elasticidad ε</div></div>
        <div class="zgz-kpi"><div class="zgz-kpi-value">${fmt(r.r2, 2)}</div><div class="zgz-kpi-label">R²</div></div>
        <div class="zgz-kpi"><div class="zgz-kpi-value">${r.n}</div><div class="zgz-kpi-label">Trimestres</div></div>`;
      const xs = pts.map(p => p.x), x0 = Math.min(...xs), x1 = Math.max(...xs);
      const main = pts.filter(p => !p.partial), par = pts.filter(p => p.partial);
      plot(sc, [
        { x: main.map(p => p.x), y: main.map(p => p.y), text: main.map(p => p.lbl), mode: 'markers', name: 'Trimestres', type: 'scatter',
          marker: { size: 9, color: main.map(p => p.yr), colorscale: [[0, '#5d6b7a'], [1, C.accent]], line: { color: '#0d0d0d', width: 1 }, colorbar: { title: { text: 'Año', font: { color: C.muted } }, thickness: 10, outlinewidth: 0, tickfont: { color: C.muted } } },
          hovertemplate: '<b>%{text}</b><br>ln PIB %{x:.3f}<br>ln T %{y:.3f}<extra></extra>' },
        ...(par.length ? [{ x: par.map(p => p.x), y: par.map(p => p.y), mode: 'markers+text', text: ['2025 T4 (solo octubre)'], textposition: 'top left', textfont: { color: C.accent, size: 10 }, name: 'Trimestre parcial', marker: { size: 13, symbol: 'x', color: C.accent }, hovertemplate: '2025 T4 (parcial)<extra></extra>' }] : []),
        { x: [x0, x1], y: [r.a + r.b * x0, r.a + r.b * x1], mode: 'lines', name: `Ajuste (ε = ${fmt(r.b, 2)})`, line: { color: C.text, width: 2, dash: 'dash' }, hoverinfo: 'skip' }
      ], { xaxis: { title: 'ln PIB' }, yaxis: { title: 'ln tráfico trimestral', separatethousands: false } });
    }
    el.querySelector('#zgz-partial').addEventListener('change', e => draw(e.target.checked));
    draw(false);
  }

  // ===================== 4. Simulador de escenarios 2050 =====================
  const PRESETS = {
    pes: { g: 1.0, e: 1.0718, label: 'Pesimista' },
    base: { g: 1.5, e: 1.0718, label: 'Base' },
    opt: { g: 2.2, e: 1.0718, label: 'Optimista' },
    alt: { g: 1.5, e: 1.50, label: 'ε sin trimestre parcial' }
  };
  function prevision(el) {
    const slider = (id, label, min, max, step, val, unit) => `
      <div class="zgz-slider">
        <div class="zgz-slider-top"><label for="${id}">${label}</label><output id="${id}-out">${val}${unit}</output></div>
        <input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}" data-unit="${unit}">
      </div>`;
    el.innerHTML = `
      <div class="zgz-sim">
        <aside class="zgz-sim-panel">
          <h3 class="zgz-card-title">Hipótesis</h3>
          <div class="zgz-presets">${Object.entries(PRESETS).map(([k, p]) => `<button type="button" data-preset="${k}" class="${k === 'base' ? 'active' : ''}">${p.label}</button>`).join('')}</div>
          ${slider('zgz-g', 'Crecimiento del PIB (g)', 0, 3.5, 0.1, 1.5, ' %')}
          ${slider('zgz-e', 'Elasticidad (ε)', 0.5, 2, 0.0001, 1.0718, '')}
          <h4 class="zgz-sim-sub">Dimensionamiento</h4>
          ${slider('zgz-hp', 'Hora punta / día', 8, 15, 0.5, 11, ' %')}
          ${slider('zgz-pax', 'Pasajeros por operación', 60, 100, 0.1, 85, '')}
          ${slider('zgz-cap', 'Capacidad de pista (ops/h)', 30, 50, 1, 40, '')}
          <p class="zgz-note">85 pax/op = avión de 100 plazas al 85 %. El promedio real de los últimos 40 meses es 67,4.</p>
        </aside>
        <div class="zgz-sim-out">
          <div class="zgz-kpis" id="zgz-out"></div>
          <div class="zgz-chain" id="zgz-chain"></div>
          ${card('Proyección de pasajeros anuales hasta 2050', 'Histórico de Aena y proyección compuesta desde 2025: PAX₂₀₅₀ = 707.493 · (1 + ε·g)²⁵. Las líneas finas son los tres escenarios del Excel.', '<div class="chart-container zgz-chart" id="zgz-proj"></div>')}
          <div class="zgz-grid2">
            ${card('Reparto mensual en 2050', 'MMT = PAX₂₀₅₀ · Iₘ / 12. Agosto es el mes de diseño.', '<div class="chart-container zgz-chart zgz-chart-sm" id="zgz-month"></div>')}
            ${card('Uso de una pista en la hora punta', 'Operaciones por hora frente a la capacidad de una sola pista.', '<div class="chart-container zgz-chart zgz-chart-sm" id="zgz-gauge"></div>')}
          </div>
        </div>
      </div>`;

    const $ = id => el.querySelector('#' + id);
    const ids = ['zgz-g', 'zgz-e', 'zgz-hp', 'zgz-pax', 'zgz-cap'];
    const annual = annualTotals();
    const scen = { Pesimista: 923583, Base: 1054129, Optimista: 1069258 };

    function compute() {
      const v = {}; ids.forEach(id => { v[id] = parseFloat($(id).value); $(id + '-out').textContent = fmt(v[id], id === 'zgz-e' ? 2 : (id === 'zgz-cap' ? 0 : 1)).replace(/,0$/, '') + $(id).dataset.unit; });
      const i = v['zgz-e'] * v['zgz-g'] / 100;
      const pax = PAX_2025 * Math.pow(1 + i, 25);
      const mmt = D.indices.map(r => pax * r[2] / 12);
      const dmt = mmt[7] / 31, hdp = dmt * v['zgz-hp'] / 100;
      const ops = hdp / v['zgz-pax'], use = ops / v['zgz-cap'];
      return { v, i, pax, mmt, dmt, hdp, ops, use };
    }
    function render() {
      const r = compute();
      $('zgz-out').innerHTML = `
        <div class="zgz-kpi zgz-kpi-hl"><div class="zgz-kpi-value">${fmt(r.pax)}</div><div class="zgz-kpi-label">Pasajeros en 2050</div><div class="zgz-kpi-sub">${r.pax >= PAX_2025 ? '+' : ''}${fmt((r.pax / PAX_2025 - 1) * 100, 1)} % frente a 2025</div></div>
        <div class="zgz-kpi"><div class="zgz-kpi-value">${fmt(r.i * 100, 2)} %</div><div class="zgz-kpi-label">Crecimiento anual del tráfico</div><div class="zgz-kpi-sub">i = ε · g</div></div>
        <div class="zgz-kpi"><div class="zgz-kpi-value">${fmt(r.hdp)}</div><div class="zgz-kpi-label">Pasajeros en hora punta</div><div class="zgz-kpi-sub">Día medio de agosto</div></div>
        <div class="zgz-kpi"><div class="zgz-kpi-value">${fmt(r.ops, 1)}</div><div class="zgz-kpi-label">Operaciones / hora</div><div class="zgz-kpi-sub">${r.use < 1 ? 'Basta con una pista' : 'Se necesita más de una pista'}</div></div>`;
      $('zgz-chain').innerHTML = [
        ['Año 2050', fmt(r.pax), 'pax'], ['Agosto (× 1,424 / 12)', fmt(r.mmt[7]), 'pax/mes'], ['Día medio (÷ 31)', fmt(r.dmt), 'pax/día'],
        [`Hora punta (× ${fmt(r.v['zgz-hp'], 1)} %)`, fmt(r.hdp), 'pax/h'], [`Operaciones (÷ ${fmt(r.v['zgz-pax'], 1)})`, fmt(r.ops, 1), 'ops/h'], [`Pistas (÷ ${r.v['zgz-cap']})`, fmt(r.use, 2), 'pistas']
      ].map(([l, n, u]) => `<div class="zgz-chain-step"><span class="zgz-chain-l">${l}</span><span class="zgz-chain-n">${n}</span><span class="zgz-chain-u">${u}</span></div>`).join('<span class="zgz-chain-arrow">→</span>');

      const yrs = Array.from({ length: 26 }, (_, k) => 2025 + k);
      const traces = [
        { x: annual.map(a => a[0]), y: annual.map(a => a[1]), name: 'Histórico (Aena)', mode: 'lines+markers', line: { color: C.muted, width: 2 }, marker: { size: 5 }, hovertemplate: '%{x}: <b>%{y:,.0f}</b><extra>Histórico</extra>' },
        ...Object.entries(scen).map(([n, p]) => {
          const ii = Math.pow(p / PAX_2025, 1 / 25) - 1;
          return { x: yrs, y: yrs.map(y => PAX_2025 * Math.pow(1 + ii, y - 2025)), name: `Excel · ${n}`, mode: 'lines', line: { color: C.faint, width: 1, dash: 'dot' }, hovertemplate: '%{x}: %{y:,.0f}<extra>' + n + '</extra>', showlegend: false };
        }),
        { x: yrs, y: yrs.map(y => PAX_2025 * Math.pow(1 + r.i, y - 2025)), name: 'Tu escenario', mode: 'lines', line: { color: C.accent, width: 3 }, fill: 'tozeroy', fillcolor: 'rgba(199,91,57,0.08)', hovertemplate: '%{x}: <b>%{y:,.0f}</b><extra>Tu escenario</extra>' }
      ];
      plot($('zgz-proj'), traces, {
        hovermode: 'x unified', yaxis: { title: 'Pasajeros / año', rangemode: 'tozero' },
        shapes: [{ type: 'line', xref: 'paper', x0: 0, x1: 1, y0: 1e6, y1: 1e6, line: { color: C.green, width: 1.5, dash: 'dash' } }],
        annotations: [{ xref: 'paper', x: 0.01, y: 1e6, text: 'Capacidad de la terminal: 1 M pax/año', showarrow: false, yanchor: 'bottom', xanchor: 'left', font: { size: 10, color: C.green } }]
      });
      plot($('zgz-month'), [{
        x: MESES, y: r.mmt, type: 'bar', marker: { color: r.mmt.map((_, k) => k === 7 ? C.accent : 'rgba(199,91,57,0.35)') },
        hovertemplate: '%{x} 2050: <b>%{y:,.0f}</b> pax<extra></extra>'
      }], { yaxis: { title: 'Pasajeros / mes' }, margin: { t: 10, l: 60 } });
      plot($('zgz-gauge'), [{
        type: 'indicator', mode: 'gauge+number', value: r.use * 100,
        number: { suffix: ' %', valueformat: '.1f', font: { color: C.text, size: 40 } },
        gauge: {
          axis: { range: [0, 100], tickcolor: C.muted, ticksuffix: '%' }, bar: { color: C.accent, thickness: 0.3 }, bgcolor: 'rgba(255,255,255,0.03)', borderwidth: 0,
          steps: [{ range: [0, 60], color: 'rgba(138,154,91,0.15)' }, { range: [60, 85], color: 'rgba(217,178,111,0.15)' }, { range: [85, 100], color: 'rgba(199,91,57,0.2)' }]
        }
      }], { margin: { t: 30, b: 10, l: 30, r: 30 } });
    }
    ids.forEach(id => $(id).addEventListener('input', () => { el.querySelectorAll('.zgz-presets button').forEach(b => b.classList.remove('active')); render(); }));
    el.querySelector('.zgz-presets').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      const p = PRESETS[b.dataset.preset];
      $('zgz-g').value = p.g; $('zgz-e').value = p.e;
      el.querySelectorAll('.zgz-presets button').forEach(x => x.classList.toggle('active', x === b));
      render();
    });
    render();
  }

  // ===================== 5. Conclusiones =====================
  function conclusiones(el) {
    const obs = [
      ['Trimestre parcial en la elasticidad', 'El punto de 2025 T4 solo contiene octubre y reduce la elasticidad. Sin él, ε = 1,50 (en vez de 1,07) y los escenarios darían 1,03, 1,24 y 1,60 millones de pasajeros en 2050. Aun así, R² es solo 0,11–0,22.'],
      ['Escenario optimista', 'La etiqueta dice 2,2 %, pero la fórmula usa la tasa histórica de 1,55 %. Por eso el resultado (1.069.258) es casi igual al base. Con el 2,2 % real saldrían unos 1.267.000 pasajeros.'],
      ['Parámetros de la hora punta', 'El 11 % no tiene fuente y todos los meses se dividen entre 31 días. Con los 67,4 pax/op observados se obtienen 5,8–6,7 ops/h: la conclusión de una pista no cambia.'],
      ['Datos de 2019', 'El Excel suma 344.978 pasajeros en 2019, cifra cercana a los internacionales (345.301), no al total publicado (467.774). El mínimo de tendencia de 2019 podría estar infravalorado.'],
      ['Índice del PIB', 'Sin fuente, ámbito ni año base indicados, y aparentemente no desestacionalizado.'],
      ['Variación interanual', 'La columna de la primera hoja usa valores absolutos en parte de los meses y muestra algunas caídas como aumentos.']
    ];
    el.innerHTML = `
      <div class="zgz-steps">
        ${[
          ['01', 'Tendencia y estacionalidad', 'La media móvil y el índice estacional separan el nivel de fondo de la demanda de su patrón anual.'],
          ['02', 'Elasticidad', 'ε = 1,07 relaciona el tráfico con el PIB y permite proyectar con escenarios económicos.'],
          ['03', 'Escenarios 2050', 'Entre 923.000 y 1.069.000 pasajeros anuales (+30 % a +51 % sobre 2025).'],
          ['04', 'Hora punta', '389 – 450 pasajeros por hora en un día medio de agosto.'],
          ['05', 'Pistas', '4,6 – 5,3 operaciones por hora: el 11–13 % de una pista. Con una pista basta.']
        ].map(([n, t, d]) => `<div class="zgz-step"><span class="zgz-step-n">${n}</span><h4>${t}</h4><p>${d}</p></div>`).join('')}
      </div>
      <div class="zgz-callout zgz-callout-warn"><strong>Después del Excel.</strong> En septiembre de 2025 Ryanair anunció un recorte del 45 % de su capacidad en Zaragoza. En agosto de 2026 el aeropuerto tuvo 63.717 pasajeros (−13,8 % interanual). Los escenarios parten de 2025, así que esta caída es relevante: el tráfico de un aeropuerto regional depende más de las rutas de las aerolíneas que de la economía.</div>
      ${card('Revisión crítica de los datos y cálculos', 'Puntos detectados al repetir las fórmulas del Excel. Despliega cada uno.',
        `<div class="zgz-acc">${obs.map(([t, d]) => `<details><summary>${t}</summary><p>${d}</p></details>`).join('')}</div>`)}
      <div class="zgz-downloads">
        <a class="download-box-btn" href="data/Informe_demanda_aeropuerto_Zaragoza.pdf" target="_blank" rel="noopener">Informe completo (PDF)</a>
        <a class="download-box-btn" href="data/evolucion_trafico_zaragoza.xlsx" download>Excel de trabajo (.xlsx)</a>
      </div>
      <p class="zgz-note">Fuentes: Aena (2026); Aragón Digital (2020, 2025); El Español (2026); Wikipedia. Autores: Marc Marzal Català, Héctor Hernández de la Rosa y Andreu Martí Peiró.</p>`;
  }

  window.ZGZ_SECTIONS = D ? { historico, estacionalidad, pib, prevision, conclusiones } : {};
})();
