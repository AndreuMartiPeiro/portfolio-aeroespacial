/**
 * app.js — SPA Router & Rendering Engine
 * Aerospace Portfolio
 */

(function () {
  'use strict';

  // DOM references
  const app = document.getElementById('app');
  const landingView = document.getElementById('landing-view');
  const projectView = document.getElementById('project-view');
  const backBtn = document.getElementById('navbar-back');
  const brandLink = document.getElementById('navbar-brand');

  const navbar = document.getElementById('navbar');
  const progressBar = document.getElementById('scroll-progress');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Paleta de gráficos: mismos valores que los tokens de styles.css
  const CHART = {
    accent: '#e8552b', tertiary: '#8aa1b9', text: '#ededec', muted: '#8e8e93',
    grid: 'rgba(255, 255, 255, 0.07)', surface: '#19191b'
  };
  const pad2 = n => String(n).padStart(2, '0');
  const ARROW_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';

  // ========== Navbar, progreso de lectura y anclas ==========
  function initChrome() {
    let lastY = window.scrollY;
    let ticking = false;

    function onScroll() {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      navbar.classList.toggle('is-scrolled', y > 12);
      // Se oculta al bajar y reaparece al subir
      const hide = y > lastY && y > 240;
      navbar.classList.toggle('is-hidden', hide);
      document.body.classList.toggle('nav-hidden', hide);
      progressBar.style.setProperty('--progress', max > 0 ? Math.min(y / max, 1) : 0);
      lastY = y;
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();

    // Anclas internas (#id) sin interferir con el router (#/…)
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (a) {
        const href = a.getAttribute('href');
        if (href.length > 1 && !href.startsWith('#/')) {
          const target = document.getElementById(href.slice(1));
          if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
          return;
        }
      }
      if (e.target.closest('[data-scroll-top]')) window.scrollTo({ top: 0, behavior: 'smooth' });

      // Desplegables (pasos y subpasos)
      const toggle = e.target.closest('[data-toggle]');
      if (toggle) {
        const card = toggle.parentElement;
        const open = card.classList.toggle('expanded');
        toggle.setAttribute('aria-expanded', open);
      }
    });
    document.addEventListener('keydown', e => {
      const toggle = e.target.closest && e.target.closest('[data-toggle]');
      if (toggle && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle.click(); }
    });
  }

  // ========== Revelado al hacer scroll ==========
  const revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
    : null;

  function observeReveals(root) {
    root.querySelectorAll('.reveal:not(.is-visible)').forEach(el => {
      if (revealObserver && !reducedMotion) revealObserver.observe(el);
      else el.classList.add('is-visible');
    });
  }

  // ========== Render Landing ==========
  function renderLanding() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    grid.innerHTML = '';

    PROJECTS.forEach((project, index) => {
      const card = document.createElement('article');
      card.className = 'project-card reveal';
      card.style.setProperty('--d', `${(index % 2) * 120}ms`);
      card.setAttribute('data-project-id', project.id);
      card.setAttribute('role', 'link');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', project.title);

      const tagsHTML = project.tags.map(t => `<span class="tag">${t}</span>`).join('');
      const done = /complet/i.test(project.status) ? ' is-done' : '';

      card.innerHTML = `
        <div class="project-card-media">
          <img src="${project.image}" alt="${project.title}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'image-placeholder\\'><span class=\\'image-placeholder-icon\\'>—</span><span>Imagen del proyecto</span></div>'" />
          <span class="project-card-status${done}">${project.status}</span>
        </div>
        <div class="project-card-body">
          <span class="project-card-index">${pad2(index + 1)}</span>
          <div>
            <h3 class="project-card-title">${project.title}</h3>
            <p class="project-card-desc">${project.description}</p>
            <div class="project-card-foot">
              <div class="project-card-tags">${tagsHTML}</div>
              <span class="project-card-cta">Ver proyecto ${ARROW_SVG}</span>
            </div>
          </div>
        </div>
      `;

      card.addEventListener('click', () => navigateTo(project.id));
      card.addEventListener('keydown', e => { if (e.key === 'Enter') navigateTo(project.id); });
      grid.appendChild(card);
    });

    observeReveals(grid);
  }

  // Coloca la línea naranja bajo la pestaña activa
  function syncTabIndicator() {
    const tabsEl = document.getElementById('section-tabs');
    const indicator = tabsEl && tabsEl.querySelector('.section-tabs-indicator');
    const active = tabsEl && tabsEl.querySelector('.section-tab.active');
    if (!indicator || !active) return;
    indicator.style.setProperty('--x', `${active.offsetLeft}px`);
    indicator.style.setProperty('--w', `${active.offsetWidth}px`);
  }

  // ========== Render Project ==========
  function renderProject(projectId) {
    const project = PROJECTS.find(p => p.id === projectId);
    if (!project) { navigateTo(''); return; }

    const heroEl = document.getElementById('project-hero');
    const tabsEl = document.getElementById('section-tabs');
    const contentEl = document.getElementById('section-content');

    // Proyectos con página propia (p. ej. Zaragoza): sin hero ni pestañas
    const custom = project.customPage && window.ZGZ_PAGE;
    heroEl.style.display = custom ? 'none' : '';
    tabsEl.style.display = custom ? 'none' : '';
    document.body.classList.toggle('zgz-mode', !!custom);
    if (custom) { window.ZGZ_PAGE(contentEl, project); return; }

    // Hero
    const tagsHTML = project.tags.map(t => `<span class="tag">${t}</span>`).join('');
    const index = PROJECTS.indexOf(project) + 1;
    const mediaHTML = project.image
      ? `<div class="project-hero-media"><img src="${project.image}" alt="${project.title}" /></div>`
      : '';
    heroEl.innerHTML = `
      <div class="project-hero-meta">
        <span class="eyebrow"><span class="dot"></span>Proyecto ${pad2(index)} — ${project.date}</span>
        <span class="eyebrow">${project.status}</span>
      </div>
      <h1><span class="line"><span>${project.title}</span></span></h1>
      <div class="project-hero-row">
        <p class="project-subtitle">${project.subtitle}</p>
        <div class="project-hero-tags">${tagsHTML}</div>
      </div>
      ${mediaHTML}
    `;

    // Tabs con indicador deslizante
    tabsEl.innerHTML = '<span class="section-tabs-indicator" aria-hidden="true"></span>';
    project.sections.forEach((section, i) => {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.setAttribute('role', 'tab');
      tab.className = 'section-tab' + (i === 0 ? ' active' : '');
      const statusHTML = section.status ? `<span class="section-tab-status">${section.status}</span>` : '';
      tab.innerHTML = `<span class="section-tab-icon">${pad2(i + 1)}</span>${section.title}${statusHTML}`;
      tab.addEventListener('click', () => {
        tabsEl.querySelectorAll('.section-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        syncTabIndicator();
        renderSection(section, contentEl);
        // Si las pestañas están fijadas arriba, vuelve al inicio del apartado
        const top = tabsEl.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight;
        if (window.scrollY > top + 1) window.scrollTo({ top, behavior: 'smooth' });
      });
      tabsEl.appendChild(tab);
    });
    requestAnimationFrame(syncTabIndicator);
    if (document.fonts) document.fonts.ready.then(syncTabIndicator);

    // Render first section
    if (project.sections.length > 0) {
      renderSection(project.sections[0], contentEl);
    }
  }

  // ========== Render Section ==========
  function renderSection(section, container) {
    const softwareHTML = section.software.length > 0
      ? `<div class="software-list">${section.software.map(s => `<span class="software-badge">${s}</span>`).join('')}</div>`
      : '';

    const statusHTML = section.status
      ? `<span class="status-badge"><span class="status-badge-dot"></span>${section.status}</span>`
      : '';

    const pdfLink = (href, label, extra) => `
      <a href="${href}" target="_blank" rel="noopener" class="download-box-btn section-pdf-btn${extra}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        ${label}
      </a>`;
    const pdfHTML = section.summaryPdf
      ? `<div class="section-pdf-btns">${pdfLink(section.summaryPdf, 'Resumen (PDF)', '')}${section.summaryPdfEn ? pdfLink(section.summaryPdfEn, 'Summary (EN)', ' ghost') : ''}</div>`
      : '';

    let stepsHTML = '';
    section.steps.forEach((step, i) => {
      // Check if this is the parametric study step with substeps
      if (step.isParametricStudy) {
        stepsHTML += renderParametricStep(step, i);
      } else {
        stepsHTML += renderNormalStep(step, i);
      }
    });

    // Apartado sin pasos publicados todavía: aviso de trabajo en curso
    const bodyHTML = section.steps.length > 0
      ? `<div class="timeline">${stepsHTML}</div>`
      : `<div class="wip-panel">
          <div class="wip-panel-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <h3 class="wip-panel-title">Apartado en desarrollo</h3>
          <p class="wip-panel-text">Este apartado se está desarrollando actualmente. El proceso, las imágenes y los resultados se publicarán aquí en cuanto estén validados.</p>
        </div>`;

    container.innerHTML = `
      <div class="section-content">
        <div class="section-content-header">
          <div class="section-content-title-row">
            <h2 class="section-content-title">${section.title}</h2>
            ${statusHTML}
          </div>
          <p class="section-content-summary">${section.summary}</p>
          <div class="section-content-meta">
            ${softwareHTML}
            ${pdfHTML}
          </div>
        </div>
        ${bodyHTML}
      </div>
    `;

    observeReveals(container);

    // Initialize Plotly charts after DOM is ready
    requestAnimationFrame(() => {
      initializeCharts(container);
    });
  }

  // ========== Render Normal Step ==========
  function renderNormalStep(step, i) {
    let imagesHTML = '';
    if (step.images && step.images.length > 0) {
      imagesHTML = step.images.map(img => `<div class="timeline-card-image"><img src="${img}" alt="${step.title}" loading="lazy" /></div>`).join('');
    } else if (step.image) {
      imagesHTML = `<div class="timeline-card-image"><img src="${step.image}" alt="${step.title}" onerror="this.parentElement.outerHTML='<div class=\\'image-placeholder\\'><span class=\\'image-placeholder-icon\\'>—</span><span>Imagen pendiente</span></div>'" /></div>`;
    }

    const contentHTML = step.contentHTML ? `<div class="custom-html-content">${step.contentHTML}</div>` : '';
    const descHTML = step.description ? `<p class="timeline-card-desc">${step.description}</p>` : '';

    return `
      <div class="timeline-item reveal" style="--d: ${Math.min(i, 5) * 70}ms">
        <div class="timeline-dot"></div>
        <div class="timeline-card expandable-card">
          <div class="timeline-card-header" data-toggle role="button" tabindex="0" aria-expanded="false">
            <div>
              <div class="timeline-step-number">Paso ${pad2(i + 1)}</div>
              <h3 class="timeline-card-title">${step.title}</h3>
            </div>
            <span class="expand-icon-wrapper" aria-hidden="true"></span>
          </div>
          <div class="timeline-card-body collapse">
            <div class="collapse-inner"><div class="timeline-card-content">
            ${descHTML}
            ${contentHTML}
            ${imagesHTML}
            </div></div>
          </div>
        </div>
      </div>
    `;
  }

  // ========== Render Parametric Study Step ==========
  function renderParametricStep(step, i) {
    // Download box
    const downloadHTML = step.downloadFile ? `
      <div class="download-box">
        <div class="download-box-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </div>
        <div class="download-box-content">
          <div class="download-box-title">Datos del Estudio Paramétrico</div>
          <div class="download-box-desc">Archivo Excel exportado de GasTurb con todos los datos del estudio paramétrico (Burner Exit Temperature vs HP Compressor Pressure Ratio).</div>
        </div>
        <a href="${step.downloadFile}" download class="download-box-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Descargar .xlsx
        </a>
      </div>
    ` : '';

    // Substeps with charts
    let substepsHTML = '';
    if (step.substeps) {
      step.substeps.forEach((sub, j) => {
        substepsHTML += `
          <div class="parametric-substep expandable-card">
            <div class="parametric-substep-header" data-toggle role="button" tabindex="0" aria-expanded="false">
              <div>
                <div class="parametric-substep-number">${pad2(j + 1)} / ${pad2(step.substeps.length)}</div>
                <h4 class="parametric-substep-title">${sub.title}</h4>
              </div>
              <span class="expand-icon-wrapper" aria-hidden="true"></span>
            </div>
            <div class="parametric-substep-body collapse">
              <div class="collapse-inner"><div class="parametric-substep-content">
                <p class="parametric-substep-desc">${sub.description}</p>
                <div class="chart-container" id="${sub.chartId}" data-chart-type="${sub.chartType}" data-chart-config="${sub.chartConfig}"></div>
              </div></div>
            </div>
          </div>
        `;
      });
    }

    return `
      <div class="timeline-item reveal" style="--d: ${Math.min(i, 5) * 70}ms">
        <div class="timeline-dot"></div>
        <div class="timeline-card expandable-card">
          <div class="timeline-card-header" data-toggle role="button" tabindex="0" aria-expanded="false">
            <div>
              <div class="timeline-step-number">Paso ${pad2(i + 1)}</div>
              <h3 class="timeline-card-title">${step.title}</h3>
            </div>
            <span class="expand-icon-wrapper" aria-hidden="true"></span>
          </div>
          <div class="timeline-card-body collapse">
            <div class="collapse-inner"><div class="timeline-card-content">
            <p class="timeline-card-desc">${step.description}</p>
            ${downloadHTML}
            <div class="parametric-substeps">
              ${substepsHTML}
            </div>
            </div></div>
          </div>
        </div>
      </div>
    `;
  }

  // ========== Initialize Plotly Charts ==========
  function initializeCharts(container) {
    const chartContainers = container.querySelectorAll('.chart-container');
    chartContainers.forEach(el => {
      const type = el.dataset.chartType;
      const config = el.dataset.chartConfig;

      // Observe when the parent substep is expanded
      const parentSubstep = el.closest('.parametric-substep');
      const parentCard = el.closest('.timeline-card');
      
      // Use a MutationObserver to detect when the chart container becomes visible
      const observer = new MutationObserver(() => {
        if (parentSubstep && parentSubstep.classList.contains('expanded') &&
            parentCard && parentCard.classList.contains('expanded')) {
          if (!el.dataset.initialized) {
            el.dataset.initialized = 'true';
            setTimeout(() => renderChart(el, type, config), 100);
          } else {
            // Resize existing chart
            try { Plotly.Plots.resize(el); } catch(e) {}
          }
        }
      });

      if (parentSubstep) {
        observer.observe(parentSubstep, { attributes: true, attributeFilter: ['class'] });
      }
      if (parentCard) {
        observer.observe(parentCard, { attributes: true, attributeFilter: ['class'] });
      }
    });
  }

  // ========== Render Individual Chart ==========
  function renderChart(el, type, config) {
    if (typeof Plotly === 'undefined' || typeof PARAMETRIC_DATA === 'undefined') {
      el.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">Cargando datos...</p>';
      return;
    }

    const data = PARAMETRIC_DATA;
    const darkLayout = {
      paper_bgcolor: 'rgba(0, 0, 0, 0)',
      plot_bgcolor: 'rgba(0, 0, 0, 0)',
      font: { family: 'Inter, sans-serif', color: CHART.text, size: 12 },
      hoverlabel: { bgcolor: CHART.surface, bordercolor: CHART.accent, font: { family: 'Inter, sans-serif', color: CHART.text } },
      margin: { l: 65, r: 30, t: 50, b: 65 },
      scene: {
        xaxis: { gridcolor: CHART.grid, title: { font: { size: 12 } } },
        yaxis: { gridcolor: CHART.grid, title: { font: { size: 12 } } },
        zaxis: { gridcolor: CHART.grid, title: { font: { size: 12 } } },
        bgcolor: 'rgba(0,0,0,0)'
      },
      modebar: { bgcolor: 'transparent', color: CHART.muted, activecolor: CHART.accent }
    };

    const plotlyConfig = {
      responsive: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['toImage', 'sendDataToCloud'],
      displayModeBar: true
    };

    if (config === 'tsfc') {
      renderSurface3D(el, data, 'TSFC', 'TSFC [g/(kN*s)]', 'Análisis Paramétrico: Consumo Específico (TSFC)',
        [[0, '#26303b'], [0.3, '#4f6378'], [0.55, CHART.tertiary], [0.8, '#d9cfc7'], [1, CHART.accent]],
        darkLayout, plotlyConfig);
    } else if (config === 'thrust') {
      renderSurface3D(el, data, 'Thrust', 'Net Thrust [kN]', 'Análisis Paramétrico: Empuje Neto',
        [[0, '#1f1f22'], [0.3, '#45454a'], [0.6, '#8e8e93'], [0.85, '#c9c9cc'], [1, '#f2f2f0']],
        darkLayout, plotlyConfig);
    } else if (config === 'carpet') {
      renderCarpetPlot(el, data, darkLayout, plotlyConfig);
    }
  }

  // ========== 3D Surface Chart ==========
  function renderSurface3D(el, data, zKey, zLabel, title, colorscale, layout, config) {
    const zData = data[zKey];

    const surface = {
      type: 'surface',
      x: data.TET,
      y: data.PR,
      z: zData,
      colorscale: colorscale,
      colorbar: {
        title: { text: zLabel, side: 'right', font: { size: 11 } },
        thickness: 15,
        len: 0.75,
        tickfont: { size: 10 }
      },
      lighting: { ambient: 0.6, diffuse: 0.7, specular: 0.3, roughness: 0.5 },
      contours: {
        z: { show: true, usecolormap: true, highlightcolor: '#fff', project: { z: false } }
      },
      hovertemplate: 'TET: %{x:.0f} K<br>HP PR: %{y:.2f}<br>' + zLabel + ': %{z:.3f}<extra></extra>'
    };

    // Add design point marker
    const designMarker = {
      type: 'scatter3d',
      x: [data.designPoint.TET],
      y: [data.designPoint.PR],
      z: [zKey === 'TSFC' ? data.designPoint.TSFC : data.designPoint.Thrust],
      mode: 'markers+text',
      marker: { size: 6, color: CHART.accent, symbol: 'diamond', line: { color: '#ffffff', width: 1 } },
      text: ['F107-WR-402'],
      textposition: 'top center',
      textfont: { color: CHART.accent, size: 11, family: 'JetBrains Mono, monospace' },
      hovertemplate: '<b>Punto de Diseño F107</b><br>TET: 1227 K<br>HP PR: 6.06<br>' + zLabel + ': ' +
        (zKey === 'TSFC' ? '22.83' : '2.90') + '<extra></extra>',
      showlegend: false
    };

    const surfaceLayout = {
      ...layout,
      title: { text: title, font: { size: 14, color: CHART.text, family: 'Inter Tight, Inter, sans-serif' }, x: 0.03, xanchor: 'left' },
      scene: {
        ...layout.scene,
        xaxis: { ...layout.scene.xaxis, title: 'Burner Exit Temperature [K]' },
        yaxis: { ...layout.scene.yaxis, title: 'HP Compressor Pressure Ratio' },
        zaxis: { ...layout.scene.zaxis, title: zLabel },
        camera: { eye: { x: -1.5, y: -1.8, z: 0.8 } }
      }
    };

    Plotly.newPlot(el, [surface, designMarker], surfaceLayout, config);
  }

  // ========== 2D Carpet Plot ==========
  function renderCarpetPlot(el, data, layout, config) {
    const traces = [];

    // Lines of constant Temperature (blue)
    for (let j = 0; j < data.TET.length; j++) {
      const xVals = [], yVals = [];
      for (let i = 0; i < data.PR.length; i++) {
        xVals.push(data.Thrust[i][j]);
        yVals.push(data.TSFC[i][j]);
      }
      traces.push({
        type: 'scatter',
        x: xVals,
        y: yVals,
        mode: 'lines',
        line: { color: 'rgba(138, 161, 185, 0.75)', width: 1.2 },
        hovertemplate: `TET = ${data.TET[j].toFixed(0)} K<br>Thrust: %{x:.3f} kN<br>TSFC: %{y:.3f} g/(kN*s)<extra></extra>`,
        showlegend: false
      });
    }

    // Lines of constant Pressure Ratio (dark/white)
    for (let i = 0; i < data.PR.length; i++) {
      const xVals = [], yVals = [];
      for (let j = 0; j < data.TET.length; j++) {
        xVals.push(data.Thrust[i][j]);
        yVals.push(data.TSFC[i][j]);
      }
      traces.push({
        type: 'scatter',
        x: xVals,
        y: yVals,
        mode: 'lines',
        line: { color: 'rgba(237, 237, 236, 0.32)', width: 1 },
        hovertemplate: `HP PR = ${data.PR[i].toFixed(2)}<br>Thrust: %{x:.3f} kN<br>TSFC: %{y:.3f} g/(kN*s)<extra></extra>`,
        showlegend: false
      });
    }

    // Design point
    traces.push({
      type: 'scatter',
      x: [data.designPoint.Thrust],
      y: [data.designPoint.TSFC],
      mode: 'markers+text',
      marker: { size: 13, color: CHART.accent, symbol: 'star', line: { color: '#ffffff', width: 1 } },
      text: ['  F107-WR-402 (Diseño)'],
      textposition: 'middle right',
      textfont: { color: CHART.accent, size: 12, family: 'JetBrains Mono, monospace' },
      hovertemplate: '<b>Punto de Diseño F107</b><br>Thrust: 2.90 kN<br>TSFC: 22.83 g/(kN*s)<br>TET: 1227 K<br>HP PR: 6.06<extra></extra>',
      showlegend: false
    });

    const carpetLayout = {
      ...layout,
      title: { text: 'Carpet Plot: Thrust vs TSFC', font: { size: 14, color: CHART.text, family: 'Inter Tight, Inter, sans-serif' }, x: 0.03, xanchor: 'left' },
      xaxis: {
        title: { text: 'Net Thrust [kN]', font: { size: 12 } },
        gridcolor: CHART.grid,
        zerolinecolor: CHART.grid,
        color: CHART.muted
      },
      yaxis: {
        title: { text: 'Sp. Fuel Consumption [g/(kN*s)]', font: { size: 12 } },
        gridcolor: CHART.grid,
        zerolinecolor: CHART.grid,
        color: CHART.muted
      }
    };

    Plotly.newPlot(el, traces, carpetLayout, config);
  }

  // ========== Navigation ==========
  function navigateTo(projectId) {
    if (projectId) {
      window.location.hash = `#/project/${projectId}`;
    } else {
      window.location.hash = '#/';
    }
  }

  function showRoute() {
    const hash = window.location.hash || '#/';
    const projectMatch = hash.match(/#\/project\/(.+)/);
    const onProject = !!projectMatch;

    landingView.style.display = onProject ? 'none' : 'block';
    projectView.style.display = onProject ? 'block' : 'none';
    projectView.classList.toggle('active', onProject);
    backBtn.classList.toggle('visible', onProject);
    document.body.classList.toggle('on-project', onProject);
    if (onProject) renderProject(projectMatch[1]);
    else document.body.classList.remove('zgz-mode');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // Fundido corto entre vistas (se omite en la primera carga)
  let firstRoute = true;
  function handleRoute() {
    if (firstRoute || reducedMotion) { firstRoute = false; showRoute(); return; }
    app.classList.add('is-leaving');
    setTimeout(() => {
      showRoute();
      requestAnimationFrame(() => app.classList.remove('is-leaving'));
    }, 320);
  }

  // ========== Init ==========
  function init() {
    initChrome();
    renderLanding();
    observeReveals(document);
    handleRoute();

    window.addEventListener('hashchange', handleRoute);

    backBtn.addEventListener('click', () => navigateTo(''));
    brandLink.addEventListener('click', (e) => {
      e.preventDefault();
      if ((window.location.hash || '#/') === '#/') window.scrollTo({ top: 0, behavior: 'smooth' });
      else navigateTo('');
    });
    window.addEventListener('resize', syncTabIndicator);

    // Update stats
    const statProjects = document.getElementById('stat-projects');
    if (statProjects) statProjects.textContent = PROJECTS.length;
    const statSections = document.getElementById('stat-sections');
    if (statSections) {
      const total = PROJECTS.reduce((sum, p) => sum + p.sections.length, 0);
      statSections.textContent = total;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
