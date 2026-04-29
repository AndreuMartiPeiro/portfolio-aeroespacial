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
      const imageHTML = step.image
        ? `<div class="timeline-card-image"><img src="${step.image}" alt="${step.title}" onerror="this.parentElement.outerHTML='<div class=\\'image-placeholder\\'><span class=\\'image-placeholder-icon\\'>—</span><span>Imagen pendiente</span></div>'" /></div>`
        : '';

      stepsHTML += `
        <div class="timeline-item" style="animation-delay: ${0.1 + i * 0.1}s">
          <div class="timeline-dot"></div>
          <div class="timeline-card">
            <div class="timeline-card-body">
              <div class="timeline-step-number">Paso ${i + 1}</div>
              <h3 class="timeline-card-title">${step.title}</h3>
              <p class="timeline-card-desc">${step.description}</p>
            </div>
            ${imageHTML}
          </div>
        </div>
      `;
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
