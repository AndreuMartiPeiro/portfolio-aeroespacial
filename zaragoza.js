/**
 * zaragoza.js — Página interactiva del proyecto
 * "Planificación de la demanda del aeropuerto de Zaragoza".
 * Estructura: carrusel de introducción → diagrama de flujo metodológico
 * (5 pasos con rueda de selección y desplegables "!") → resultados.
 */
(function () {
  const D = typeof ZARAGOZA_DATA !== 'undefined' ? ZARAGOZA_DATA : null;
  if (!D) return;

  const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const MESES_L = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const C = {
    gold: '#f5c518', cyan: '#5ec8e5', coral: '#ff7a59', text: '#e8ecf3',
    muted: '#93a0b5', faint: '#556178', grid: 'rgba(232,236,243,0.07)', bg: '#0a1020'
  };
  const PAX_2025 = 707493;
  const EPS = 1.0718369235500866;
  const SCEN = [
    { key: 'pes', label: 'Pesimista', g: '1,0 %', pax: 923583 },
    { key: 'base', label: 'Base', g: '1,5 %', pax: 1054129 },
    { key: 'opt', label: 'Optimista', g: '2,2 %', pax: 1069258 }
  ];
  const fmt = (n, d = 0) => Number(n).toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d });
  const iso = (y, m) => `${y}-${String(m).padStart(2, '0')}-01`;
  const mlabel = (y, m) => `${MESES[m - 1]} ${y}`;
  const PLOT_CFG = { responsive: true, displaylogo: false, modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d'] };

  // Serie sin pandemia: [año, mes, salidas, llegadas, total, mediaMóvil]
  const S = D.serie;
  const IDX_TOT = D.indices.map(r => r[2]);

  // ---------- utilidades ----------
  function layout(extra) {
    return merge({
      paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
      font: { family: 'Inter, sans-serif', color: C.muted, size: 12 },
      margin: { l: 60, r: 20, t: 20, b: 45 },
      hoverlabel: { bgcolor: '#111a2e', bordercolor: C.gold, font: { color: C.text, family: 'Inter, sans-serif' } },
      legend: { orientation: 'h', y: 1.12, x: 0, font: { color: C.text } },
      xaxis: { gridcolor: C.grid, zeroline: false, linecolor: C.grid },
      yaxis: { gridcolor: C.grid, zeroline: false, linecolor: C.grid, separatethousands: true },
      transition: { duration: 400, easing: 'cubic-in-out' }
    }, extra || {});
  }
  function merge(a, b) {
    for (const k in b) {
      if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k]) a[k] = merge({ ...a[k] }, b[k]);
      else a[k] = b[k];
    }
    return a;
  }
  function plot(el, traces, lay) {
    if (!el) return;
    if (typeof Plotly === 'undefined') { el.innerHTML = '<p class="zp-note">No se pudo cargar Plotly.</p>'; return; }
    Plotly.react(el, traces, layout(lay), PLOT_CFG);
  }
  // Número que se anima desde su valor anterior
  function tween(el, to, dec = 0, suffix = '') {
    const from = parseFloat(el.dataset.v || 0), t0 = performance.now(), dur = 600;
    el.dataset.v = to;
    (function step(t) {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(from + (to - from) * e, dec) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  function seg(name, options, active) {
    return `<div class="zp-seg" data-name="${name}">${options.map(o =>
      `<button type="button" data-value="${o.value}" class="${o.value === active ? 'active' : ''}">${o.label}</button>`).join('')}</div>`;
  }
  function bindSeg(root, name, cb) {
    const s = root.querySelector(`.zp-seg[data-name="${name}"]`);
    s.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      s.querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
      cb(b.dataset.value);
    });
  }
  function info(html) {
    return `<button type="button" class="zp-info-btn" aria-label="Más información" aria-expanded="false">!</button>
      <div class="zp-info"><div class="zp-info-inner">${html}</div></div>`;
  }
  function bindInfo(root) {
    root.querySelectorAll('.zp-info-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const box = btn.parentElement.querySelector('.zp-info');
        const open = !box.classList.contains('open');
        box.classList.toggle('open', open);
        btn.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', open);
        box.style.maxHeight = open ? box.scrollHeight + 'px' : '0px';
      });
    });
  }

  /**
   * Rueda de selección vertical (tipo selector de iOS).
   * items: [{label}], onChange(index)
   */
  function makeWheel(el, items, start, onChange) {
    const H = 40;
    el.classList.add('zp-wheel');
    el.innerHTML = `<button type="button" class="zp-wheel-arrow up" aria-label="Anterior">▲</button>
      <div class="zp-wheel-view"><div class="zp-wheel-list">${items.map((it, i) => `<div class="zp-wheel-item" data-i="${i}">${it.label}</div>`).join('')}</div><div class="zp-wheel-lens"></div></div>
      <button type="button" class="zp-wheel-arrow down" aria-label="Siguiente">▼</button>`;
    const view = el.querySelector('.zp-wheel-view');
    const nodes = [...el.querySelectorAll('.zp-wheel-item')];
    let cur = -1, timer = null, raf = null;
    function paint() {
      const c = view.scrollTop / H;
      nodes.forEach((n, i) => {
        const d = i - c, a = Math.max(-1, Math.min(1, d / 4));
        n.style.transform = `rotateX(${-a * 70}deg) scale(${1 - Math.abs(a) * 0.25})`;
        n.style.opacity = Math.max(0.12, 1 - Math.abs(d) * 0.22);
        n.classList.toggle('sel', Math.round(c) === i);
      });
    }
    function settle() {
      const i = Math.max(0, Math.min(items.length - 1, Math.round(view.scrollTop / H)));
      if (i !== cur) { cur = i; onChange(i); }
    }
    view.addEventListener('scroll', () => {
      cancelAnimationFrame(raf); raf = requestAnimationFrame(paint);
      clearTimeout(timer); timer = setTimeout(settle, 120);
    }, { passive: true });
    const go = i => view.scrollTo({ top: Math.max(0, Math.min(items.length - 1, i)) * H, behavior: 'smooth' });
    nodes.forEach(n => n.addEventListener('click', () => go(+n.dataset.i)));
    el.querySelector('.up').addEventListener('click', () => go(Math.round(view.scrollTop / H) - 1));
    el.querySelector('.down').addEventListener('click', () => go(Math.round(view.scrollTop / H) + 1));
    view.tabIndex = 0;
    view.addEventListener('keydown', e => {
      if (e.key === 'ArrowUp') { e.preventDefault(); go(cur - 1); }
      if (e.key === 'ArrowDown') { e.preventDefault(); go(cur + 1); }
    });
    requestAnimationFrame(() => { view.scrollTop = start * H; paint(); settle(); });
    return { go, get index() { return cur; } };
  }

  // Muestra elementos al hacer scroll
  function reveal(root) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    root.querySelectorAll('.zp-reveal').forEach(n => io.observe(n));
  }

  // ===================== 1. Carrusel de introducción =====================
  const CARDS = [
    {
      k: 'Objetivo', title: '¿Cuántos pasajeros tendrá Zaragoza en 2050?',
      body: 'Planificar la demanda futura del aeropuerto: estimar los pasajeros de <b>2050</b>, cómo se reparten a lo largo del año y qué <b>infraestructura de pista</b> exige la hora más cargada. Se parte de lo ocurrido en el pasado y se relaciona con la evolución de la economía.',
      stat: ['2050', 'horizonte de la previsión']
    },
    {
      k: 'Datos de partida', title: 'Cifras mensuales oficiales de Aena',
      body: 'Aena, gestora del aeropuerto, publica cada mes las <b>salidas</b>, <b>llegadas</b> y <b>pasajeros totales</b> (su suma). Se usan datos mensuales porque la estacionalidad solo se ve con una periodicidad inferior al año. El total de 2025 (707.493) coincide con el balance oficial.',
      stat: ['268', 'meses · ene 2004 – abr 2026']
    },
    {
      k: 'Limpieza', title: 'Fuera la pandemia',
      body: 'Se eliminan los <b>24 meses de 2020 y 2021</b>: en abril de 2020 hubo solo 4 pasajeros y en 2021 la recuperación dio aumentos desproporcionados. Son anomalías que distorsionarían tendencia, estacionalidad y relación con el PIB. No se sustituyen: simplemente se dejan fuera, y el análisis se apoya en <b>244 meses</b>.',
      stat: ['244', 'meses válidos para el análisis']
    }
  ];
  function intro(root) {
    root.innerHTML = `
      <div class="zp-hero-head zp-reveal">
        <div class="zp-board">ZAZ</div>
        <div>
          <p class="zp-eyebrow">Planificación aeroportuaria · Aena 2004 – 2026</p>
          <h1 class="zp-title">Demanda del aeropuerto de Zaragoza</h1>
          <p class="zp-lead">De una serie histórica de pasajeros a una previsión dimensionada para 2050.</p>
        </div>
      </div>
      <div class="zp-deck" tabindex="0" aria-roledescription="carrusel">
        ${CARDS.map((c, i) => `
          <article class="zp-card" data-i="${i}">
            <div class="zp-card-top"><span class="zp-card-k">${String(i + 1).padStart(2, '0')} · ${c.k}</span><span class="zp-card-of">${i + 1}/${CARDS.length}</span></div>
            <h2>${c.title}</h2>
            <p>${c.body}</p>
            <div class="zp-card-stat"><span>${c.stat[0]}</span>${c.stat[1]}</div>
          </article>`).join('')}
      </div>
      <div class="zp-deck-nav">
        <button type="button" class="zp-arrow prev" aria-label="Anterior">←</button>
        <div class="zp-dots">${CARDS.map((_, i) => `<button type="button" data-i="${i}" aria-label="Carta ${i + 1}"></button>`).join('')}</div>
        <button type="button" class="zp-arrow next" aria-label="Siguiente">→</button>
      </div>
      <a href="#zp-flow" class="zp-scroll-hint">Metodología ↓</a>`;
    const cards = [...root.querySelectorAll('.zp-card')], dots = [...root.querySelectorAll('.zp-dots button')];
    let cur = 0;
    function show(n) {
      cur = (n + cards.length) % cards.length;
      cards.forEach((c, i) => {
        const pos = (i - cur + cards.length) % cards.length;
        c.dataset.pos = pos === cards.length - 1 && cards.length > 2 ? 'out' : pos;
      });
      dots.forEach((d, i) => d.classList.toggle('active', i === cur));
    }
    root.querySelector('.next').addEventListener('click', () => show(cur + 1));
    root.querySelector('.prev').addEventListener('click', () => show(cur - 1));
    dots.forEach(d => d.addEventListener('click', () => show(+d.dataset.i)));
    cards.forEach(c => c.addEventListener('click', () => { if (c.dataset.pos !== '0') show(+c.dataset.i); }));
    root.querySelector('.zp-deck').addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') show(cur + 1);
      if (e.key === 'ArrowLeft') show(cur - 1);
    });
    let x0 = null;
    root.querySelector('.zp-deck').addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    root.querySelector('.zp-deck').addEventListener('touchend', e => {
      if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1)); x0 = null;
    });
    root.querySelector('.zp-scroll-hint').addEventListener('click', e => {
      e.preventDefault(); document.getElementById('zp-flow').scrollIntoView({ behavior: 'smooth' });
    });
    show(0);
  }

  // ===================== 2. Diagrama de flujo =====================
  function stepShell(n, title, sheet, lead, infoHTML, body) {
    return `
      <section class="zp-step zp-reveal" id="zp-step-${n}">
        <div class="zp-node"><span>${n}</span></div>
        <div class="zp-step-card">
          <header class="zp-step-head">
            <div>
              <p class="zp-eyebrow">Paso ${n} · hoja ${sheet}</p>
              <h2>${title}</h2>
            </div>
            <div class="zp-info-wrap">${info(infoHTML)}</div>
          </header>
          <p class="zp-step-lead">${lead}</p>
          ${body}
        </div>
      </section>`;
  }

  // ---- Paso 1: media móvil ----
  function step1(root) {
    const valid = [];
    for (let i = 6; i < S.length - 6; i++) valid.push(i);
    const start = valid.findIndex(i => S[i][0] === 2025 && S[i][1] === 1);
    const wheel = root.querySelector('#zp-w1');
    const tbody = root.querySelector('#zp-t1 tbody');
    makeWheel(wheel, valid.map(i => ({ label: mlabel(S[i][0], S[i][1]) })), start, k => {
      const i = valid[k];
      const rows = [];
      let sum = 0;
      for (let j = -6; j <= 6; j++) {
        const r = S[i + j], w = Math.abs(j) === 6 ? 0.5 : 1;
        sum += w * r[4];
        rows.push(`<tr class="${j === 0 ? 'mid' : ''}" style="--d:${(j + 6) * 25}ms"><td>${MESES_L[r[1] - 1]} ${r[0]}</td><td>${fmt(r[4])}</td><td>${fmt(w, 1)}</td><td>${fmt(w * r[4], 1)}</td></tr>`);
      }
      tbody.innerHTML = rows.join('');
      const mm = sum / 12, a = S[i - 6], b = S[i + 6];
      root.querySelector('#zp-r1-range').textContent = `${MESES_L[a[1] - 1]} ${a[0]} → ${MESES_L[b[1] - 1]} ${b[0]}`;
      root.querySelector('#zp-r1-sum').textContent = fmt(sum, 1);
      tween(root.querySelector('#zp-r1-mm'), mm, 2);
      const gap = S.slice(i - 6, i + 7).some((r, q, arr) => q > 0 && r[0] - arr[q - 1][0] > 1);
      root.querySelector('#zp-r1-gap').style.display = gap ? '' : 'none';
      // mini gráfico con la ventana resaltada
      const x = S.map(r => iso(r[0], r[1]));
      plot(root.querySelector('#zp-c1'), [
        { x, y: S.map(r => r[4]), mode: 'lines', name: 'Pasajeros', line: { color: 'rgba(94,200,229,0.55)', width: 1.2 }, hovertemplate: '%{x|%b %Y}: %{y:,.0f}<extra></extra>' },
        { x, y: S.map(r => r[5]), mode: 'lines', name: 'Media móvil', line: { color: C.gold, width: 2.2 }, connectgaps: false, hovertemplate: '%{x|%b %Y}: %{y:,.0f}<extra>MM</extra>' },
        { x: [iso(S[i][0], S[i][1])], y: [mm], mode: 'markers', name: 'Mes elegido', marker: { size: 12, color: C.coral, line: { color: '#fff', width: 2 } }, hoverinfo: 'skip' }
      ], {
        margin: { t: 10, b: 30, l: 50 }, showlegend: false,
        shapes: [{ type: 'rect', x0: iso(a[0], a[1]), x1: iso(b[0], b[1]), yref: 'paper', y0: 0, y1: 1, fillcolor: 'rgba(245,197,24,0.12)', line: { color: C.gold, width: 1 } }],
        xaxis: { range: ['2004-01-01', '2026-05-01'] }
      });
    });
  }

  // ---- Paso 2: estacionalidad ----
  function step2(root) {
    const valid = S.map((r, i) => i).filter(i => S[i][5]);
    const start = valid.findIndex(i => S[i][0] === 2025 && S[i][1] === 1);
    let month = 1;
    function drawMonth(m) {
      month = m;
      const pts = S.filter(r => r[1] === m && r[5]);
      const ys = pts.map(r => r[4] / r[5]);
      const avg = IDX_TOT[m - 1];
      plot(root.querySelector('#zp-c2'), [{
        x: pts.map(r => String(r[0])), y: ys, type: 'bar', marker: { color: ys.map(v => v >= 1 ? C.gold : C.cyan), opacity: 0.85 },
        hovertemplate: `${MESES_L[m - 1]} %{x}<br>Iₜ = <b>%{y:.3f}</b><extra></extra>`
      }], {
        margin: { t: 30, b: 40, l: 45 }, yaxis: { range: [0, 1.8], title: 'Iₜ' }, xaxis: { type: 'category', tickangle: -45 },
        shapes: [
          { type: 'line', xref: 'paper', x0: 0, x1: 1, y0: avg, y1: avg, line: { color: C.coral, width: 2 } },
          { type: 'line', xref: 'paper', x0: 0, x1: 1, y0: 1, y1: 1, line: { color: C.faint, width: 1, dash: 'dot' } }
        ],
        annotations: [{ xref: 'paper', x: 1, y: avg, xanchor: 'right', yanchor: 'bottom', showarrow: false, text: `Iₘ medio de ${MESES_L[m - 1].toLowerCase()} = ${fmt(avg, 3)}`, font: { color: C.coral, size: 12 } }]
      });
      root.querySelector('#zp-r2-n').textContent = pts.length;
      root.querySelectorAll('.zp-chip-m').forEach((c, i) => c.classList.toggle('active', i === m - 1));
    }
    root.querySelector('#zp-chips2').innerHTML = IDX_TOT.map((v, i) =>
      `<button type="button" class="zp-chip-m ${v >= 1 ? 'hi' : 'lo'}" data-m="${i + 1}"><b>${MESES[i]}</b><span>${fmt(v, 2)}</span><i style="--h:${Math.round(v / 1.45 * 100)}%"></i></button>`).join('');
    root.querySelectorAll('.zp-chip-m').forEach(c => c.addEventListener('click', () => drawMonth(+c.dataset.m)));
    makeWheel(root.querySelector('#zp-w2'), valid.map(i => ({ label: mlabel(S[i][0], S[i][1]) })), start, k => {
      const r = S[valid[k]], I = r[4] / r[5];
      root.querySelector('#zp-r2-x').textContent = fmt(r[4]);
      root.querySelector('#zp-r2-mm').textContent = fmt(r[5], 2);
      tween(root.querySelector('#zp-r2-i'), I, 3);
      const pct = Math.round((I - 1) * 100);
      root.querySelector('#zp-r2-txt').innerHTML = `${MESES_L[r[1] - 1]} de ${r[0]} tuvo un <b>${Math.abs(pct)} % ${pct >= 0 ? 'más' : 'menos'}</b> de pasajeros que un mes medio de su entorno.`;
      root.querySelector('#zp-r2-bar').style.setProperty('--v', Math.min(1, I / 1.8));
      if (r[1] !== month) drawMonth(r[1]);
    });
    drawMonth(1);
  }

  // ---- Paso 3: elasticidad ----
  function regression(pts) {
    const n = pts.length, mx = pts.reduce((a, p) => a + p.x, 0) / n, my = pts.reduce((a, p) => a + p.y, 0) / n;
    let sxy = 0, sxx = 0, syy = 0;
    pts.forEach(p => { sxy += (p.x - mx) * (p.y - my); sxx += (p.x - mx) ** 2; syy += (p.y - my) ** 2; });
    const b = sxy / sxx;
    return { b, a: my - b * mx, r2: (sxy * sxy) / (sxx * syy), n };
  }
  function step3(root) {
    const all = D.pib.map(r => ({ x: r[2], y: r[3], lbl: `${r[0]} ${r[1]}`, yr: r[0], partial: r[0] === 2025 && r[1] === 'T4' }));
    let excl = false, sel = all.length - 2;
    function draw() {
      const pts = excl ? all.filter(p => !p.partial) : all;
      const r = regression(pts);
      tween(root.querySelector('#zp-r3-e'), r.b, 2);
      tween(root.querySelector('#zp-r3-r2'), r.r2, 2);
      root.querySelector('#zp-r3-n').textContent = r.n;
      const xs = pts.map(p => p.x), x0 = Math.min(...xs), x1 = Math.max(...xs), s = all[sel];
      const g = [1.0, 1.5, 2.2];
      root.querySelector('#zp-r3-scen').innerHTML = g.map(v => {
        const i = r.b * v / 100, pax = PAX_2025 * Math.pow(1 + i, 25);
        return `<div class="zp-mini"><span>g = ${fmt(v, 1)} %</span><b>i = ${fmt(i * 100, 2)} %</b><em>${fmt(pax)} pax en 2050</em></div>`;
      }).join('');
      plot(root.querySelector('#zp-c3'), [
        { x: pts.map(p => p.x), y: pts.map(p => p.y), text: pts.map(p => p.lbl), mode: 'markers', name: 'Trimestres',
          marker: { size: 8, color: pts.map(p => p.partial ? C.coral : p.yr), colorscale: [[0, '#2d4a6b'], [1, C.cyan]], line: { color: C.bg, width: 1 } },
          hovertemplate: '<b>%{text}</b><br>ln PIB %{x:.3f}<br>ln T %{y:.3f}<extra></extra>' },
        { x: [x0, x1], y: [r.a + r.b * x0, r.a + r.b * x1], mode: 'lines', name: `ε = ${fmt(r.b, 2)}`, line: { color: C.gold, width: 2.5 }, hoverinfo: 'skip' },
        { x: [s.x], y: [s.y], mode: 'markers', marker: { size: 18, color: 'rgba(0,0,0,0)', line: { color: C.coral, width: 3 } }, hoverinfo: 'skip', showlegend: false }
      ], { xaxis: { title: 'ln PIB' }, yaxis: { title: 'ln tráfico trimestral', separatethousands: false }, showlegend: false, margin: { t: 10 } });
    }
    makeWheel(root.querySelector('#zp-w3'), all.map(p => ({ label: p.lbl + (p.partial ? ' *' : '') })), sel, k => {
      sel = k; const p = all[k];
      root.querySelector('#zp-r3-q').textContent = p.lbl;
      root.querySelector('#zp-r3-t').textContent = fmt(Math.exp(p.y));
      root.querySelector('#zp-r3-p').textContent = fmt(Math.exp(p.x), 2);
      root.querySelector('#zp-r3-lnt').textContent = fmt(p.y, 4);
      root.querySelector('#zp-r3-lnp').textContent = fmt(p.x, 4);
      root.querySelector('#zp-r3-warn').style.display = p.partial ? '' : 'none';
      draw();
    });
    root.querySelector('#zp-x3').addEventListener('change', e => { excl = e.target.checked; draw(); });
  }

  // ---- Paso 4: hora punta ----
  function step4(root) {
    let sc = SCEN[1], m = 7;
    function draw() {
      const I = IDX_TOT[m], mmt = sc.pax * I / 12, dmt = mmt / 31, hdp = dmt * 0.11;
      root.querySelector('#zp-r4-m').textContent = MESES_L[m];
      tween(root.querySelector('#zp-r4-pax'), sc.pax);
      root.querySelector('#zp-r4-i').textContent = fmt(I, 5);
      tween(root.querySelector('#zp-r4-mmt'), mmt);
      tween(root.querySelector('#zp-r4-dmt'), dmt);
      tween(root.querySelector('#zp-r4-hdp'), hdp);
      // barras de embudo proporcionales (escala logarítmica para que se vean las tres)
      const lg = v => Math.max(6, Math.log10(v) / Math.log10(sc.pax) * 100);
      root.querySelector('#zp-f-mmt').style.width = lg(mmt) + '%';
      root.querySelector('#zp-f-dmt').style.width = lg(dmt) + '%';
      root.querySelector('#zp-f-hdp').style.width = lg(hdp) + '%';
      const hd = IDX_TOT.map(v => sc.pax * v / 12 / 31 * 0.11);
      plot(root.querySelector('#zp-c4'), [{
        x: MESES, y: hd, type: 'bar', text: hd.map(v => fmt(v)), textposition: 'outside', textfont: { color: C.text, size: 11 },
        marker: { color: hd.map((_, i) => i === m ? C.gold : i === 7 ? 'rgba(255,122,89,0.7)' : 'rgba(94,200,229,0.35)') },
        hovertemplate: '%{x}: <b>%{y:,.0f}</b> pax en la hora punta<extra></extra>'
      }], { yaxis: { title: 'HDP (pax/h)', range: [0, 520] }, margin: { t: 10 } });
      root.querySelector('#zp-r4-design').style.display = m === 7 ? '' : 'none';
    }
    bindSeg(root, 'sc4', v => { sc = SCEN.find(s => s.key === v); draw(); });
    makeWheel(root.querySelector('#zp-w4'), MESES_L.map(l => ({ label: l })), 7, k => { m = k; draw(); });
  }

  // ---- Paso 5: operaciones y pistas ----
  function step5(root) {
    let sc = SCEN[1];
    const $ = id => root.querySelector('#' + id);
    function draw() {
      const ppo = +$('zp-s5-p').value, cap = +$('zp-s5-c').value;
      $('zp-s5-p-o').textContent = fmt(ppo, 1); $('zp-s5-c-o').textContent = cap;
      const hdp = sc.pax * IDX_TOT[7] / 12 / 31 * 0.11, ops = hdp / ppo, use = ops / cap;
      tween($('zp-r5-hdp'), hdp);
      tween($('zp-r5-ops'), ops, 1);
      tween($('zp-r5-use'), use * 100, 1, ' %');
      $('zp-r5-pistas').textContent = fmt(use, 2);
      // pista: una franja de 60 minutos con "cap" huecos; se iluminan las operaciones
      const n = Math.ceil(ops);
      $('zp-runway').innerHTML = Array.from({ length: cap }, (_, i) =>
        `<span class="${i < n ? 'on' : ''}" style="--d:${i * 30}ms">${i < n ? '✈' : ''}</span>`).join('');
    }
    bindSeg(root, 'sc5', v => { sc = SCEN.find(s => s.key === v); draw(); });
    ['zp-s5-p', 'zp-s5-c'].forEach(id => $(id).addEventListener('input', draw));
    $('zp-s5-obs').addEventListener('click', () => { $('zp-s5-p').value = 67.4; draw(); });
    $('zp-s5-ex').addEventListener('click', () => { $('zp-s5-p').value = 85; draw(); });
    draw();
    // pasajeros por operación reales (últimos 40 meses)
    const keys = Object.keys(D.ops).map(k => k.split('-').map(Number)).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const pts = keys.map(([y, m]) => {
      const r = D.completa.find(q => q[0] === y && q[1] === m);
      return r ? { x: iso(y, m), y: (r[2] + r[3]) / D.ops[`${y}-${m}`], ops: D.ops[`${y}-${m}`] } : null;
    }).filter(Boolean);
    plot($('zp-c5'), [
      { x: pts.map(p => p.x), y: pts.map(p => p.y), customdata: pts.map(p => p.ops), mode: 'lines+markers', name: 'Pax / operación real', line: { color: C.cyan, width: 2 }, marker: { size: 5 }, hovertemplate: '%{x|%b %Y}: <b>%{y:.1f}</b> pax/op (%{customdata} ops)<extra></extra>' }
    ], {
      yaxis: { title: 'Pax por operación', range: [40, 100] }, margin: { t: 10 }, showlegend: false,
      shapes: [
        { type: 'line', xref: 'paper', x0: 0, x1: 1, y0: 85, y1: 85, line: { color: C.gold, width: 2, dash: 'dash' } },
        { type: 'line', xref: 'paper', x0: 0, x1: 1, y0: 67.4, y1: 67.4, line: { color: C.coral, width: 1.5, dash: 'dot' } }
      ],
      annotations: [
        { xref: 'paper', x: 0.01, y: 85, xanchor: 'left', yanchor: 'bottom', showarrow: false, text: 'Supuesto del Excel: 85', font: { color: C.gold, size: 11 } },
        { xref: 'paper', x: 0.01, y: 67.4, xanchor: 'left', yanchor: 'top', showarrow: false, text: 'Promedio real: 67,4', font: { color: C.coral, size: 11 } }
      ]
    });
  }

  function flow(root) {
    root.innerHTML = `
      <div class="zp-section-head zp-reveal" id="zp-flow">
        <p class="zp-eyebrow">Cadena de cálculo del Excel</p>
        <h2 class="zp-h2">Diagrama de flujo metodológico</h2>
        <div class="zp-pipeline">
          ${['Tendencia', 'Estacionalidad', 'Elasticidad PIB', 'Hora punta', 'Pistas'].map((t, i) => `<a href="#zp-step-${i + 1}" class="zp-pipe"><span>${i + 1}</span>${t}</a>`).join('<i class="zp-pipe-arrow"></i>')}
        </div>
      </div>
      <div class="zp-flow">
        <div class="zp-flow-line"><div class="zp-flow-progress"></div></div>

        ${stepShell(1, 'Tendencia: media móvil centrada de 12 meses', 'Análisis tendencia',
          'Para cada mes se promedian los 12 meses que lo rodean (6 antes y 6 después, con medio peso en los extremos). Así cada mes del año entra una vez, la estacionalidad se compensa y queda el <b>nivel de fondo</b> de la demanda.',
          `<p><b>Por qué este método.</b> Cada mes del año entra exactamente una vez en la ventana, por lo que el efecto estacional se compensa; y se suavizan las fluctuaciones puntuales de un mes concreto. La media móvil responde a la pregunta de cuántos pasajeros al mes tendría el aeropuerto en un mes medio de ese momento.</p>
           <p><b>Por qué medio peso en los extremos.</b> Con 12 meses el centro cae entre dos meses. Se promedian dos medias de 12 meses desplazadas un mes: el resultado es una ventana de 13 meses donde los extremos pesan la mitad.</p>
           <p><b>Contrapartida.</b> Se pierden seis meses en cada extremo de la serie: no hay valor para ene–jun 2004 ni para nov 2025–abr 2026. La última tendencia disponible es la de octubre de 2025 (59.066 pasajeros/mes).</p>
           <p><b>Uso posterior.</b> La hoja <i>Media móvil total</i> agrupa estos valores por trimestres; esa serie trimestral es la que se compara con el PIB.</p>`,
          `<div class="zp-eq">MM<sub>t</sub> = <sup>1</sup>⁄<sub>12</sub> · [ 0,5·X<sub>t−6</sub> + X<sub>t−5</sub> + … + X<sub>t+5</sub> + 0,5·X<sub>t+6</sub> ]</div>
           <div class="zp-lab">
             <div class="zp-lab-wheel"><p class="zp-lab-cap">Gira para elegir el mes</p><div id="zp-w1"></div></div>
             <div class="zp-lab-main">
               <p class="zp-lab-cap">Ventana: <b id="zp-r1-range"></b></p>
               <div class="zp-table-wrap"><table class="zp-table" id="zp-t1"><thead><tr><th>Mes</th><th>Pasajeros X</th><th>Peso</th><th>Peso · X</th></tr></thead><tbody></tbody></table></div>
               <div class="zp-result"><span>Σ = <b id="zp-r1-sum"></b> &nbsp;÷ 12 =</span><strong id="zp-r1-mm">0</strong><em>pasajeros / mes de tendencia</em></div>
               <p class="zp-note" id="zp-r1-gap">⚠ Esta ventana atraviesa el hueco de la pandemia y mezcla meses de 2019 y 2022 (efecto muy pequeño en los índices).</p>
             </div>
           </div>
           <div class="zp-chart zp-chart-sm" id="zp-c1"></div>`)}

        ${stepShell(2, 'Estacionalidad: índice estacional', 'Promedios',
          'El índice compara cada mes con su nivel de fondo. Un valor de 1 es un mes medio; agosto (1,42) tiene un 42 % más de pasajeros, enero (0,71) un 29 % menos. Al ser un <b>porcentaje</b>, vale igual con 50.000 que con 100.000 pasajeros al mes.',
          `<p><b>Qué es.</b> La estacionalidad es el patrón que se repite cada año por causas de calendario: vacaciones de verano, Navidad, puentes o temporada escolar. En Zaragoza julio y agosto tienen siempre más pasajeros que enero o febrero, crezca o no el aeropuerto ese año.</p>
           <p><b>Por qué se calcula.</b> (1) Para no confundir estacionalidad con cambio real: que agosto de 2025 (73.934) supere a febrero (43.859) no indica crecimiento, sino que es verano. (2) Para repartir una cifra anual entre los meses y conocer el mes más cargado, que condiciona el diseño. (3) Para comparar meses de épocas distintas en igualdad de condiciones.</p>
           <p><b>Cómo se calcula.</b> Se divide cada mes entre su media móvil (Iₜ = Xₜ / MMₜ) y se promedian todos los índices del mismo mes en la hoja <i>Promedios</i>. Si están bien equilibrados, los 12 suman ≈ 12 (aquí 11,97).</p>
           <p><b>Salidas y llegadas.</b> Son casi iguales; enero y junio pesan más en salidas, septiembre y diciembre en llegadas. Como se compensan (50,1 % / 49,9 %), para dimensionar se usa el índice del total.</p>`,
          `<div class="zp-eq">I<sub>t</sub> = X<sub>t</sub> / MM<sub>t</sub> &nbsp;&nbsp;→&nbsp;&nbsp; I<sub>m</sub> = <sup>1</sup>⁄<sub>N</sub> · Σ I<sub>t</sub> &nbsp;&nbsp;·&nbsp;&nbsp; Σ I<sub>m</sub> ≈ 12</div>
           <div class="zp-lab">
             <div class="zp-lab-wheel"><p class="zp-lab-cap">Gira para elegir el mes</p><div id="zp-w2"></div></div>
             <div class="zp-lab-main">
               <div class="zp-calc">
                 <div><span>X<sub>t</sub> pasajeros</span><b id="zp-r2-x"></b></div><i>÷</i>
                 <div><span>MM<sub>t</sub> tendencia</span><b id="zp-r2-mm"></b></div><i>=</i>
                 <div class="hl"><span>I<sub>t</sub></span><b id="zp-r2-i">0</b></div>
               </div>
               <div class="zp-gauge-bar" id="zp-r2-bar"><div></div><span class="mark" style="left:${100 / 1.8}%">1</span></div>
               <p class="zp-lab-txt" id="zp-r2-txt"></p>
               <p class="zp-lab-cap">Ese mes en cada año (<span id="zp-r2-n"></span> años) y su promedio Iₘ:</p>
               <div class="zp-chart zp-chart-xs" id="zp-c2"></div>
             </div>
           </div>
           <p class="zp-lab-cap">Índice medio Iₘ de cada mes (pulsa uno):</p>
           <div class="zp-chips" id="zp-chips2"></div>`)}

        ${stepShell(3, 'Elasticidad del tráfico respecto al PIB', 'PIB',
          'Para prever 2050 hace falta un motivo por el que crezca el tráfico. Se supone que depende de la economía y se mide esa dependencia con la <b>elasticidad ε</b>: cuánto % varía el tráfico cuando el PIB varía un 1 %. Resultado: <b>ε = 1,07</b>.',
          `<p><b>Para qué sirve.</b> Convierte una hipótesis sobre el crecimiento económico, más fácil de plantear, en una hipótesis sobre el tráfico.</p>
           <p><b>Datos.</b> Se enfrenta la media móvil trimestral del tráfico (ya sin estacionalidad) con un índice trimestral del PIB. Se excluyen 2020 y 2021: quedan 78 trimestres.</p>
           <p><b>Por qué logaritmos.</b> Se supone T = A · PIB<sup>ε</sup>. Con logaritmos se convierte en una recta, ln T = ln A + ε · ln PIB, cuya pendiente es la elasticidad (función PENDIENTE de Excel, mínimos cuadrados). En escala logarítmica las distancias son variaciones porcentuales, por eso no influyen las unidades.</p>
           <p><b>Escenarios.</b> La tasa de crecimiento compuesta del PIB (CAGR) entre 91,99 y 128,15 en 21,5 años es 1,55 %, muy próxima al escenario base del 1,5 %. El tráfico crece a i = ε · g, de forma compuesta durante 25 años desde los 707.493 pasajeros de 2025.</p>
           <p><b>Ojo.</b> La nube es muy dispersa (R² bajo): el PIB explica solo una parte; el resto depende de la oferta de las aerolíneas. El punto aislado (2025 T4) solo contiene octubre; sin él, ε = 1,50.</p>`,
          `<div class="zp-eq">ln T = ln A + ε · ln PIB &nbsp;&nbsp;·&nbsp;&nbsp; i = ε · g &nbsp;&nbsp;·&nbsp;&nbsp; PAX<sub>2050</sub> = PAX<sub>2025</sub> · (1 + i)<sup>25</sup></div>
           <div class="zp-lab">
             <div class="zp-lab-wheel"><p class="zp-lab-cap">Gira para elegir el trimestre</p><div id="zp-w3"></div></div>
             <div class="zp-lab-main">
               <div class="zp-calc">
                 <div><span>Trimestre</span><b id="zp-r3-q"></b></div>
                 <div><span>T (pax)</span><b id="zp-r3-t"></b></div>
                 <div><span>PIB</span><b id="zp-r3-p"></b></div>
                 <div><span>ln T</span><b id="zp-r3-lnt"></b></div>
                 <div><span>ln PIB</span><b id="zp-r3-lnp"></b></div>
               </div>
               <p class="zp-note" id="zp-r3-warn">⚠ Trimestre parcial: solo contiene octubre de 2025.</p>
               <label class="zp-check"><input type="checkbox" id="zp-x3"> Excluir 2025 T4 (trimestre parcial)</label>
               <div class="zp-chart" id="zp-c3"></div>
             </div>
           </div>
           <div class="zp-kpis">
             <div class="zp-kpi hl"><b id="zp-r3-e">0</b><span>Elasticidad ε</span></div>
             <div class="zp-kpi"><b id="zp-r3-r2">0</b><span>R²</span></div>
             <div class="zp-kpi"><b id="zp-r3-n">0</b><span>Trimestres</span></div>
           </div>
           <div class="zp-minis" id="zp-r3-scen"></div>`)}

        ${stepShell(4, 'Del tráfico anual a la hora punta', 'HP',
          'Un aeropuerto no se dimensiona para el tráfico medio, sino para su momento más exigente. La hoja HP baja del <b>año al mes</b>, del <b>mes al día</b> y del <b>día a la hora</b> para obtener la hora punta de diseño.',
          `<p><b>Qué es la hora punta y por qué importa.</b> Un aeropuerto no se dimensiona para el tráfico medio, sino para los momentos de mayor demanda. Las instalaciones (mostradores de facturación, controles de seguridad, salas de embarque, cintas de equipaje, puertas de embarque, estacionamiento de aeronaves y accesos) deben absorber a la vez a todos los pasajeros de una misma franja horaria. Si se diseñaran para el promedio anual, se saturarían cada verano; si se diseñaran para el instante más extremo del año, estarían sobredimensionadas casi siempre. La <b>hora punta de diseño</b> es el criterio habitual para equilibrar ambos extremos: el número de pasajeros en la hora más cargada de un día representativo del mes más cargado. Es el dato que convierte una previsión anual en un tamaño de instalaciones y el que alimenta el cálculo de operaciones y pistas.</p>
           <p><b>Por qué se hace en tres pasos.</b> La demanda no se reparte de forma uniforme ni entre los meses, ni entre los días ni entre las horas. Por eso la hoja HP desciende de una escala temporal a otra: del año al mes, del mes al día y del día a la hora. El resultado se calcula para los tres escenarios, de modo que cada magnitud tiene tres columnas, según el crecimiento del PIB supuesto (1,0 %, 1,5 % y 2,2 %).</p>
           <table class="zp-table zp-table-info"><thead><tr><th>Columna</th><th>Qué representa</th><th>Fórmula</th></tr></thead><tbody>
             <tr><td>Índices</td><td>Factor estacional de cada mes</td><td>Hoja Promedios</td></tr>
             <tr><td>MMT</td><td>Pasajeros del mes en 2050</td><td>PAX<sub>2050</sub> · I<sub>m</sub> / 12</td></tr>
             <tr><td>DMT</td><td>Pasajeros de un día medio</td><td>MMT / 31</td></tr>
             <tr><td>HDP</td><td>Pasajeros en la hora punta</td><td>DMT · 0,11</td></tr>
           </tbody></table>
           <p><b>Simplificaciones.</b> Todos los meses se dividen entre 31 días (no afecta al diseño: agosto tiene 31). El 11 % de hora punta es un parámetro supuesto sin fuente, y el resultado es proporcional a él.</p>`,
          `<div class="zp-eq">MMT = PAX<sub>2050</sub> · I<sub>m</sub> / 12 &nbsp;→&nbsp; DMT = MMT / 31 &nbsp;→&nbsp; HDP = DMT · 0,11</div>
           <div class="zp-controls">${seg('sc4', SCEN.map(s => ({ value: s.key, label: `${s.label} · ${s.g}` })), 'base')}</div>
           <div class="zp-lab">
             <div class="zp-lab-wheel"><p class="zp-lab-cap">Gira para elegir el mes</p><div id="zp-w4"></div></div>
             <div class="zp-lab-main">
               <div class="zp-funnel">
                 <div class="zp-f-row"><span class="zp-f-l">Año 2050</span><div class="zp-f-bar" style="width:100%"></div><b id="zp-r4-pax">0</b><em>pax/año</em></div>
                 <div class="zp-f-op">× I<sub>m</sub> (<span id="zp-r4-i"></span>) ÷ 12</div>
                 <div class="zp-f-row"><span class="zp-f-l" id="zp-r4-m"></span><div class="zp-f-bar" id="zp-f-mmt"></div><b id="zp-r4-mmt">0</b><em>pax/mes · MMT</em></div>
                 <div class="zp-f-op">÷ 31 días</div>
                 <div class="zp-f-row"><span class="zp-f-l">Día medio</span><div class="zp-f-bar" id="zp-f-dmt"></div><b id="zp-r4-dmt">0</b><em>pax/día · DMT</em></div>
                 <div class="zp-f-op">× 11 % hora punta</div>
                 <div class="zp-f-row hl"><span class="zp-f-l">Hora punta</span><div class="zp-f-bar" id="zp-f-hdp"></div><b id="zp-r4-hdp">0</b><em>pax/h · HDP</em></div>
               </div>
               <p class="zp-pill" id="zp-r4-design">★ Agosto es el mes de diseño: su HDP se traslada a la hoja Operaciones</p>
             </div>
           </div>
           <div class="zp-chart zp-chart-sm" id="zp-c4"></div>`)}

        ${stepShell(5, 'Operaciones y número de pistas', 'Operaciones',
          'La capacidad de una pista no se mide en pasajeros sino en <b>operaciones por hora</b> (aterrizajes y despegues). Se convierten los pasajeros de la hora punta en operaciones y se comparan con lo que admite una pista.',
          `<p><b>Por qué traducir pasajeros a operaciones.</b> La capacidad de la pista y del control de tránsito aéreo se mide en movimientos de aeronaves por hora. Para saber si la pista actual basta hay que convertir los pasajeros de la hora punta en operaciones, y eso depende de cuántos pasajeros lleva cada avión.</p>
           <p><b>Pasajeros por operación.</b> El Excel supone un avión de 100 plazas con un 85 % de ocupación: 85 pasajeros por operación. La propia hoja lo contrasta con datos reales (pasajeros del mes ÷ operaciones del mes): el promedio de los últimos 40 meses es 67,4, aunque en agosto de 2025 fue 87,1.</p>
           <p><b>Capacidad de pista.</b> Entre 40 y 45 operaciones por hora según la nota del Excel; se toma el valor prudente de 40. Un resultado de pistas inferior a 1 significa que una sola pista, trabajando a una fracción de su capacidad, atiende toda la hora punta.</p>`,
          `<div class="zp-eq">Ops/h = HDP / (100 · 0,85) &nbsp;&nbsp;·&nbsp;&nbsp; Nº pistas = Ops/h / 40</div>
           <div class="zp-controls">${seg('sc5', SCEN.map(s => ({ value: s.key, label: s.label })), 'base')}</div>
           <div class="zp-grid2">
             <div>
               <div class="zp-slider"><div><label for="zp-s5-p">Pasajeros por operación</label><output id="zp-s5-p-o"></output></div><input type="range" id="zp-s5-p" min="55" max="100" step="0.1" value="85"></div>
               <div class="zp-btns"><button type="button" id="zp-s5-ex">Supuesto Excel (85)</button><button type="button" id="zp-s5-obs">Real observado (67,4)</button></div>
               <div class="zp-slider"><div><label for="zp-s5-c">Capacidad de una pista (ops/h)</label><output id="zp-s5-c-o"></output></div><input type="range" id="zp-s5-c" min="30" max="45" step="1" value="40"></div>
               <div class="zp-kpis">
                 <div class="zp-kpi"><b id="zp-r5-hdp">0</b><span>Pax hora punta</span></div>
                 <div class="zp-kpi"><b id="zp-r5-ops">0</b><span>Ops / hora</span></div>
                 <div class="zp-kpi hl"><b id="zp-r5-use">0</b><span>Uso de 1 pista · <span id="zp-r5-pistas"></span> pistas</span></div>
               </div>
             </div>
             <div>
               <p class="zp-lab-cap">Una hora de pista: cada hueco es una operación posible</p>
               <div class="zp-runway" id="zp-runway"></div>
               <p class="zp-verdict">Con <b>una pista basta</b> en cualquier escenario.</p>
             </div>
           </div>
           <p class="zp-lab-cap">Pasajeros por operación reales (hoja Operaciones):</p>
           <div class="zp-chart zp-chart-sm" id="zp-c5"></div>`)}
      </div>`;
    bindInfo(root);
    step1(root); step2(root); step3(root); step4(root); step5(root);
    // barra de progreso del flujo al hacer scroll
    const flowEl = root.querySelector('.zp-flow'), prog = root.querySelector('.zp-flow-progress');
    const onScroll = () => {
      if (!document.body.contains(flowEl)) { window.removeEventListener('scroll', onScroll); return; }
      const r = flowEl.getBoundingClientRect(), vh = window.innerHeight;
      const p = Math.max(0, Math.min(1, (vh * 0.5 - r.top) / r.height));
      prog.style.height = (p * 100) + '%';
      root.querySelectorAll('.zp-step').forEach(s => {
        const b = s.getBoundingClientRect(); s.classList.toggle('active', b.top < vh * 0.5 && b.bottom > vh * 0.3);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    root.querySelectorAll('.zp-pipe').forEach(a => a.addEventListener('click', e => {
      e.preventDefault(); root.querySelector(a.getAttribute('href')).scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
  }

  // ===================== 3. Resultados =====================
  function annualTotals() {
    const by = {};
    D.completa.forEach(([y, , s, l]) => { (by[y] = by[y] || { n: 0, t: 0 }); by[y].n++; by[y].t += s + l; });
    return Object.keys(by).filter(y => by[y].n === 12).map(y => [+y, by[y].t]);
  }
  function results(root) {
    root.innerHTML = `
      <div class="zp-section-head zp-reveal">
        <p class="zp-eyebrow">Resultados</p>
        <h2 class="zp-h2">Lo que dicen los datos</h2>
      </div>
      <div class="zp-panel zp-reveal">
        <div class="zp-panel-head">
          <h3>Pasajeros mensuales 2004 – 2026</h3>
          <div class="zp-controls">
            ${seg('hist', [{ value: 'total', label: 'Total' }, { value: 'split', label: 'Salidas vs llegadas' }, { value: 'share', label: '% salidas' }], 'total')}
            <label class="zp-check"><input type="checkbox" id="zp-covid" checked> 2020-2021</label>
          </div>
        </div>
        <p class="zp-step-lead" id="zp-hist-txt"></p>
        <div class="zp-chart" id="zp-hist"></div>
      </div>
      <div class="zp-panel zp-reveal">
        <div class="zp-panel-head"><h3>Escenarios de demanda en 2050</h3></div>
        <div class="zp-scen">
          ${SCEN.map(s => `<div class="zp-scen-card"><span>${s.label} · PIB ${s.g}</span><b data-to="${s.pax}">0</b><em>+${fmt((s.pax / PAX_2025 - 1) * 100, 1)} % sobre 2025</em><div class="zp-scen-bar"><i style="--w:${s.pax / 1100000 * 100}%"></i></div></div>`).join('')}
        </div>
        <div class="zp-chart" id="zp-proj"></div>
        <p class="zp-note">El escenario optimista del Excel multiplica la elasticidad por la tasa histórica (1,55 %) en lugar del 2,2 % de su etiqueta; con 2,2 % saldrían ≈ 1.267.000 pasajeros.</p>
      </div>
      <div class="zp-panel zp-reveal zp-final">
        <div class="zp-final-grid">
          <div><b>923.583 – 1.069.258</b><span>pasajeros en 2050</span></div>
          <div><b>389 – 450</b><span>pax en la hora punta de agosto</span></div>
          <div><b>4,6 – 5,3</b><span>operaciones por hora</span></div>
          <div class="hl"><b>1 pista</b><span>al 11 – 13 % de su capacidad</span></div>
        </div>
        <div class="zp-callout"><strong>Después del Excel.</strong> En septiembre de 2025 Ryanair anunció un recorte del 45 % de su capacidad en Zaragoza. En agosto de 2026 hubo 63.717 pasajeros (−13,8 % interanual). Los escenarios parten de 2025, así que esta caída es relevante: el tráfico de un aeropuerto regional depende más de las rutas de las aerolíneas que de la economía.</div>
        <div class="zp-downloads">
          <a class="zp-btn" href="data/Informe_demanda_aeropuerto_Zaragoza.pdf" target="_blank" rel="noopener">Informe completo (PDF)</a>
          <a class="zp-btn ghost" href="data/evolucion_trafico_zaragoza.xlsx" download>Excel de trabajo (.xlsx)</a>
        </div>
        <p class="zp-note">Autores: Marc Marzal Català, Héctor Hernández de la Rosa y Andreu Martí Peiró. Fuentes: Aena, Aragón Digital, El Español, Wikipedia.</p>
      </div>`;
    bindInfo(root);

    // Histórico
    let mode = 'total', covid = true;
    const histEl = root.querySelector('#zp-hist'), txt = root.querySelector('#zp-hist-txt');
    const TXT = {
      total: 'Suma de salidas y llegadas: la carga total que soportan terminal, pista y accesos. La línea dorada es la tendencia (media móvil).',
      split: 'Salidas hacia arriba y llegadas hacia abajo: los dos flujos son casi un espejo, con un reparto medio del 50,1 % / 49,9 %. Por eso se analiza el total.',
      share: 'Porcentaje de salidas sobre el total en cada mes. Oscila alrededor del 50 %: se compensan a lo largo del año (más salidas en enero y junio, más llegadas en septiembre y diciembre).'
    };
    function drawHist() {
      txt.textContent = TXT[mode];
      const rows = D.completa.filter(r => covid || (r[0] !== 2020 && r[0] !== 2021));
      const x = rows.map(r => iso(r[0], r[1]));
      let traces, ya;
      if (mode === 'total') {
        const mmK = {}; S.forEach(r => { if (r[5]) mmK[iso(r[0], r[1])] = r[5]; });
        traces = [
          { x, y: rows.map(r => r[2] + r[3]), type: 'bar', name: 'Pasajeros totales', marker: { color: rows.map(r => r[0] === 2020 || r[0] === 2021 ? 'rgba(255,122,89,0.6)' : 'rgba(94,200,229,0.55)') }, hovertemplate: '%{x|%b %Y}: <b>%{y:,.0f}</b><extra></extra>' },
          { x: Object.keys(mmK), y: Object.values(mmK), mode: 'lines', name: 'Tendencia', line: { color: C.gold, width: 3 }, hovertemplate: '%{x|%b %Y}: %{y:,.0f}<extra>Tendencia</extra>' }
        ];
        ya = { title: 'Pasajeros / mes' };
      } else if (mode === 'split') {
        traces = [
          { x, y: rows.map(r => r[2]), type: 'bar', name: 'Salidas ↑', marker: { color: C.gold }, hovertemplate: '%{x|%b %Y}<br>Salidas: <b>%{y:,.0f}</b><extra></extra>' },
          { x, y: rows.map(r => -r[3]), customdata: rows.map(r => r[3]), type: 'bar', name: 'Llegadas ↓', marker: { color: C.cyan }, hovertemplate: '%{x|%b %Y}<br>Llegadas: <b>%{customdata:,.0f}</b><extra></extra>' }
        ];
        ya = { title: 'Salidas (+) / Llegadas (−)', tickvals: [-40000, -20000, 0, 20000, 40000], ticktext: ['40k', '20k', '0', '20k', '40k'] };
      } else {
        const sh = rows.map(r => r[2] / (r[2] + r[3]) * 100);
        traces = [{ x, y: sh, mode: 'lines', fill: 'tonexty', name: '% salidas', line: { color: C.gold, width: 1.5 }, hovertemplate: '%{x|%b %Y}: <b>%{y:.1f} %</b> salidas<extra></extra>' }];
        ya = { title: '% salidas', range: [40, 60], ticksuffix: ' %' };
      }
      plot(histEl, traces, {
        barmode: 'relative', bargap: 0.1, hovermode: 'x unified', yaxis: ya,
        xaxis: { type: 'date', rangeslider: { visible: true, thickness: 0.07, bgcolor: 'rgba(255,255,255,0.02)' } },
        shapes: mode === 'share' ? [{ type: 'line', xref: 'paper', x0: 0, x1: 1, y0: 50, y1: 50, line: { color: C.text, width: 1, dash: 'dot' } }] : []
      });
    }
    bindSeg(root, 'hist', v => { mode = v; drawHist(); });
    root.querySelector('#zp-covid').addEventListener('change', e => { covid = e.target.checked; drawHist(); });
    drawHist();

    // Proyección
    const annual = annualTotals(), yrs = Array.from({ length: 26 }, (_, k) => 2025 + k);
    const cols = [C.cyan, C.gold, C.coral];
    plot(root.querySelector('#zp-proj'), [
      { x: annual.map(a => a[0]), y: annual.map(a => a[1]), name: 'Histórico Aena', mode: 'lines+markers', line: { color: C.muted, width: 2 }, marker: { size: 5 }, hovertemplate: '%{x}: <b>%{y:,.0f}</b><extra>Histórico</extra>' },
      ...SCEN.map((s, k) => {
        const i = Math.pow(s.pax / PAX_2025, 1 / 25) - 1;
        return { x: yrs, y: yrs.map(y => PAX_2025 * Math.pow(1 + i, y - 2025)), name: s.label, mode: 'lines', line: { color: cols[k], width: 2.5 }, hovertemplate: '%{x}: <b>%{y:,.0f}</b><extra>' + s.label + '</extra>' };
      })
    ], {
      hovermode: 'x unified', yaxis: { title: 'Pasajeros / año', rangemode: 'tozero' },
      shapes: [{ type: 'line', xref: 'paper', x0: 0, x1: 1, y0: 1e6, y1: 1e6, line: { color: C.faint, width: 1, dash: 'dash' } }],
      annotations: [{ xref: 'paper', x: 0.01, y: 1e6, text: 'Capacidad de la terminal (2008): 1 M pax/año', showarrow: false, yanchor: 'bottom', xanchor: 'left', font: { size: 10, color: C.muted } }]
    });
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('[data-to]').forEach(b => tween(b, +b.dataset.to));
      io.unobserve(e.target);
    }), { threshold: 0.3 });
    io.observe(root.querySelector('.zp-scen'));
  }

  // ===================== Página completa =====================
  window.ZGZ_PAGE = function (container) {
    container.innerHTML = `
      <div class="zp">
        <div class="zp-intro" id="zp-intro"></div>
        <div id="zp-flow-host"></div>
        <div id="zp-results"></div>
      </div>`;
    intro(container.querySelector('#zp-intro'));
    flow(container.querySelector('#zp-flow-host'));
    results(container.querySelector('#zp-results'));
    reveal(container);
  };
})();
