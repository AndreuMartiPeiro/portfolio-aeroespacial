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

  // ========== Stars Background ==========
  function initStars() {
    const canvas = document.getElementById('stars-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let stars = [];
    const STAR_COUNT = 200;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createStars() {
      stars = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.3,
          speed: Math.random() * 0.3 + 0.05,
          opacity: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinkleOffset: Math.random() * Math.PI * 2
        });
      }
    }

    let time = 0;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.016;
      stars.forEach(s => {
        const twinkle = 0.5 + 0.5 * Math.sin(time * s.twinkleSpeed * 60 + s.twinkleOffset);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230, 225, 215, ${s.opacity * twinkle})`;
        ctx.fill();
        s.y -= s.speed;
        if (s.y < -5) {
          s.y = canvas.height + 5;
          s.x = Math.random() * canvas.width;
        }
      });
      requestAnimationFrame(draw);
    }

    resize();
    createStars();
    draw();
    window.addEventListener('resize', () => { resize(); createStars(); });
  }

  // ========== Render Landing ==========
  function renderLanding() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    grid.innerHTML = '';

    PROJECTS.forEach((project, index) => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.style.animationDelay = `${0.1 + index * 0.1}s`;
      card.setAttribute('data-project-id', project.id);

      const tagsHTML = project.tags.map(t => `<span class="tag">${t}</span>`).join('');

      card.innerHTML = `
        <div class="project-card-image">
          <img src="${project.image}" alt="${project.title}" onerror="this.parentElement.innerHTML='<div class=\\'image-placeholder\\'><span class=\\'image-placeholder-icon\\'>—</span><span>Imagen del proyecto</span></div>'" />
          <span class="project-card-status">${project.status}</span>
        </div>
        <div class="project-card-body">
          <h3 class="project-card-title">${project.title}</h3>
          <p class="project-card-desc">${project.description}</p>
          <div class="project-card-tags">${tagsHTML}</div>
        </div>
        <div class="project-card-footer">
          <span class="project-card-date">${project.date}</span>
          <span class="project-card-arrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </span>
        </div>
      `;

      card.addEventListener('click', () => navigateTo(project.id));
      grid.appendChild(card);
    });
  }

  // ========== Render Project ==========
  function renderProject(projectId) {
    const project = PROJECTS.find(p => p.id === projectId);
    if (!project) { navigateTo(''); return; }

    const heroEl = document.getElementById('project-hero');
    const tabsEl = document.getElementById('section-tabs');
    const contentEl = document.getElementById('section-content');

    // Hero
    const tagsHTML = project.tags.map(t => `<span class="tag">${t}</span>`).join('');
    heroEl.innerHTML = `
      <h1>${project.title}</h1>
      <p class="project-subtitle">${project.subtitle}</p>
      <div class="project-hero-tags">${tagsHTML}</div>
    `;

    // Tabs
    tabsEl.innerHTML = '';
    project.sections.forEach((section, i) => {
      const tab = document.createElement('button');
      tab.className = 'section-tab' + (i === 0 ? ' active' : '');
      tab.innerHTML = `<span class="section-tab-icon">${i + 1}</span> ${section.title}`;
      tab.addEventListener('click', () => {
        tabsEl.querySelectorAll('.section-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderSection(section, contentEl);
      });
      tabsEl.appendChild(tab);
    });

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

    let stepsHTML = '';
    section.steps.forEach((step, i) => {
      // Check if this is the parametric study step with substeps
      if (step.isParametricStudy) {
        stepsHTML += renderParametricStep(step, i);
      } else {
        stepsHTML += renderNormalStep(step, i);
      }
    });

    container.innerHTML = `
      <div class="section-content">
        <div class="section-content-header">
          <h2 class="section-content-title">${section.title}</h2>
          <p class="section-content-summary">${section.summary}</p>
          ${softwareHTML}
        </div>
        <div class="timeline">
          ${stepsHTML}
        </div>
      </div>
    `;

    // Re-trigger animations
    container.querySelectorAll('.timeline-item').forEach(item => {
      item.style.opacity = '0';
      requestAnimationFrame(() => { item.style.opacity = ''; });
    });

    // Initialize Plotly charts after DOM is ready
    requestAnimationFrame(() => {
      initializeCharts(container);
    });
  }

  // ========== Render Normal Step ==========
  function renderNormalStep(step, i) {
    let imagesHTML = '';
    if (step.images && step.images.length > 0) {
      imagesHTML = step.images.map(img => `<div class="timeline-card-image" style="margin-top: 1rem;"><img src="${img}" alt="${step.title}" /></div>`).join('');
    } else if (step.image) {
      imagesHTML = `<div class="timeline-card-image" style="margin-top: 1rem;"><img src="${step.image}" alt="${step.title}" onerror="this.parentElement.outerHTML='<div class=\\'image-placeholder\\'><span class=\\'image-placeholder-icon\\'>—</span><span>Imagen pendiente</span></div>'" /></div>`;
    }

    const contentHTML = step.contentHTML ? `<div class="custom-html-content">${step.contentHTML}</div>` : '';
    const descHTML = step.description ? `<p class="timeline-card-desc">${step.description}</p>` : '';

    return `
      <div class="timeline-item" style="animation-delay: ${0.1 + i * 0.1}s">
        <div class="timeline-dot"></div>
        <div class="timeline-card expandable-card">
          <div class="timeline-card-header" onclick="this.parentElement.classList.toggle('expanded')">
            <div>
              <div class="timeline-step-number">Paso ${i + 1}</div>
              <h3 class="timeline-card-title" style="margin-bottom: 0;">${step.title}</h3>
            </div>
            <div class="expand-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="expand-icon"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
          <div class="timeline-card-body">
            ${descHTML}
            ${contentHTML}
            ${imagesHTML}
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
            <div class="parametric-substep-header" onclick="this.parentElement.classList.toggle('expanded')">
              <div>
                <div class="parametric-substep-number">${j + 1} de ${step.substeps.length}</div>
                <h4 class="parametric-substep-title">${sub.title}</h4>
              </div>
              <div class="expand-icon-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="expand-icon"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
            <div class="parametric-substep-body">
              <p class="parametric-substep-desc">${sub.description}</p>
              <div class="chart-container" id="${sub.chartId}" data-chart-type="${sub.chartType}" data-chart-config="${sub.chartConfig}"></div>
            </div>
          </div>
        `;
      });
    }

    return `
      <div class="timeline-item" style="animation-delay: ${0.1 + i * 0.1}s">
        <div class="timeline-dot"></div>
        <div class="timeline-card expandable-card">
          <div class="timeline-card-header" onclick="this.parentElement.classList.toggle('expanded')">
            <div>
              <div class="timeline-step-number">Paso ${i + 1}</div>
              <h3 class="timeline-card-title" style="margin-bottom: 0;">${step.title}</h3>
            </div>
            <div class="expand-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="expand-icon"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
          <div class="timeline-card-body">
            <p class="timeline-card-desc">${step.description}</p>
            ${downloadHTML}
            <div class="parametric-substeps">
              ${substepsHTML}
            </div>
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
      paper_bgcolor: 'rgba(13, 13, 13, 0)',
      plot_bgcolor: 'rgba(26, 26, 26, 0.3)',
      font: { family: 'Inter, sans-serif', color: '#e0ddd9', size: 12 },
      margin: { l: 65, r: 30, t: 50, b: 65 },
      scene: {
        xaxis: { gridcolor: 'rgba(199,91,57,0.15)', title: { font: { size: 12 } } },
        yaxis: { gridcolor: 'rgba(199,91,57,0.15)', title: { font: { size: 12 } } },
        zaxis: { gridcolor: 'rgba(199,91,57,0.15)', title: { font: { size: 12 } } },
        bgcolor: 'rgba(13,13,13,0)'
      },
      modebar: { bgcolor: 'transparent', color: '#9a9590', activecolor: '#c75b39' }
    };

    const plotlyConfig = {
      responsive: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['toImage', 'sendDataToCloud'],
      displayModeBar: true
    };

    if (config === 'tsfc') {
      renderSurface3D(el, data, 'TSFC', 'TSFC [g/(kN*s)]', 'Análisis Paramétrico: Consumo Específico (TSFC)',
        [[0, '#0d47a1'], [0.25, '#1976d2'], [0.5, '#4fc3f7'], [0.75, '#fff176'], [1, '#e53935']],
        darkLayout, plotlyConfig);
    } else if (config === 'thrust') {
      renderSurface3D(el, data, 'Thrust', 'Net Thrust [kN]', 'Análisis Paramétrico: Empuje Neto',
        [[0, '#b71c1c'], [0.25, '#e65100'], [0.5, '#ff8f00'], [0.75, '#fdd835'], [1, '#fff9c4']],
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
      marker: { size: 6, color: '#ff1744', symbol: 'diamond' },
      text: ['F107-WR-402'],
      textposition: 'top center',
      textfont: { color: '#ff1744', size: 11, family: 'Inter' },
      hovertemplate: '<b>Punto de Diseño F107</b><br>TET: 1227 K<br>HP PR: 6.06<br>' + zLabel + ': ' +
        (zKey === 'TSFC' ? '22.83' : '2.90') + '<extra></extra>',
      showlegend: false
    };

    const surfaceLayout = {
      ...layout,
      title: { text: title, font: { size: 14, color: '#e0ddd9' }, x: 0.5 },
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
        line: { color: 'rgba(25, 118, 210, 0.6)', width: 1.2 },
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
        line: { color: 'rgba(224, 221, 217, 0.4)', width: 1 },
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
      marker: { size: 12, color: '#ff1744', symbol: 'star' },
      text: ['  F107-WR-402 (Diseño)'],
      textposition: 'middle right',
      textfont: { color: '#ff1744', size: 12, family: 'Inter, sans-serif' },
      hovertemplate: '<b>Punto de Diseño F107</b><br>Thrust: 2.90 kN<br>TSFC: 22.83 g/(kN*s)<br>TET: 1227 K<br>HP PR: 6.06<extra></extra>',
      showlegend: false
    });

    const carpetLayout = {
      ...layout,
      title: { text: 'Carpet Plot: Thrust vs TSFC', font: { size: 14, color: '#e0ddd9' }, x: 0.5 },
      xaxis: {
        title: { text: 'Net Thrust [kN]', font: { size: 12 } },
        gridcolor: 'rgba(199,91,57,0.12)',
        zerolinecolor: 'rgba(199,91,57,0.2)',
        color: '#e0ddd9'
      },
      yaxis: {
        title: { text: 'Sp. Fuel Consumption [g/(kN*s)]', font: { size: 12 } },
        gridcolor: 'rgba(199,91,57,0.12)',
        zerolinecolor: 'rgba(199,91,57,0.2)',
        color: '#e0ddd9'
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

  function handleRoute() {
    const hash = window.location.hash || '#/';
    const projectMatch = hash.match(/#\/project\/(.+)/);

    if (projectMatch) {
      const projectId = projectMatch[1];
      landingView.style.display = 'none';
      projectView.style.display = 'block';
      projectView.classList.add('active');
      backBtn.classList.add('visible');
      renderProject(projectId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      landingView.style.display = 'block';
      projectView.style.display = 'none';
      projectView.classList.remove('active');
      backBtn.classList.remove('visible');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // ========== Init ==========
  function init() {
    initStars();
    renderLanding();
    handleRoute();

    window.addEventListener('hashchange', handleRoute);

    backBtn.addEventListener('click', () => navigateTo(''));
    brandLink.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('');
    });

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
