/* ══════════════════════════════════════════════
   TAKAMI GUIDEBOOK — MAIN JAVASCRIPT
══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initWaterRipple();
  initCursor();
  initNavbar();
  initParallax();
  initReveal();
  initFloatCards();
  initCardExpansion();
  initMagnetic();
  initEngineAccordion();
  initSkillFloats();
  initCounters();
  initPageTransitions();
});

/* ─────────────────────────────────────────
   WATER RIPPLE CURSOR
───────────────────────────────────────── */
function initWaterRipple() {
  const canvas = document.createElement('canvas');
  canvas.id = 'water-canvas';
  canvas.style.cssText = [
    'position:fixed', 'inset:0', 'width:100%', 'height:100%',
    'pointer-events:none', 'z-index:9996', 'opacity:1',
    'mix-blend-mode:screen'
  ].join(';');
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const ripples = [];
  let lastX = 0, lastY = 0;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', e => {
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    if (dx * dx + dy * dy < 400) return;
    lastX = e.clientX; lastY = e.clientY;
    ripples.push({ x: e.clientX, y: e.clientY, r: 0, maxR: 55, alpha: 0.45, speed: 1.8, lw: 1 });
  });

  document.addEventListener('click', e => {
    for (let i = 0; i < 4; i++) {
      ripples.push({
        x: e.clientX, y: e.clientY,
        r: i * 12, maxR: 90 + i * 18,
        alpha: 0.6 - i * 0.08,
        speed: 1.4, lw: 1.2 - i * 0.15
      });
    }
  });

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      rp.r     += rp.speed;
      rp.alpha *= 0.93;
      if (rp.alpha < 0.008 || rp.r > rp.maxR) { ripples.splice(i, 1); continue; }

      ctx.save();
      ctx.translate(rp.x, rp.y);
      ctx.scale(1, 0.42);
      ctx.beginPath();
      ctx.arc(0, 0, rp.r, 0, Math.PI * 2);
      ctx.restore();

      ctx.strokeStyle = `rgba(160, 200, 255, ${rp.alpha})`;
      ctx.lineWidth   = rp.lw;
      ctx.stroke();
    }
    requestAnimationFrame(draw);
  }
  draw();
}

/* ─────────────────────────────────────────
   CUSTOM CURSOR
───────────────────────────────────────── */
function initCursor() {
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  let mx = -200, my = -200;
  let rx = -200, ry = -200;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  function lerp(a, b, t) { return a + (b - a) * t; }
  function tick() {
    rx = lerp(rx, mx, 0.13);
    ry = lerp(ry, my, 0.13);
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(tick);
  }
  tick();

  const interactables = 'a, button, .chapter-card, .principle-card, .engine-layer, .skill-tag, .metric-card, .stat-card, .btn-primary, .btn-ghost, .btn-blue';
  document.querySelectorAll(interactables).forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });

  document.addEventListener('mousedown', () => ring.classList.add('clicking'));
  document.addEventListener('mouseup',   () => ring.classList.remove('clicking'));
}

/* ─────────────────────────────────────────
   NAVBAR SCROLL BEHAVIOR
───────────────────────────────────────── */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const isDarkHeader = !!document.querySelector('.hero, .page-hero');

  function update() {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
      if (isDarkHeader) navbar.classList.remove('dark');
    } else {
      navbar.classList.remove('scrolled');
      if (isDarkHeader) navbar.classList.add('dark');
    }
  }
  if (isDarkHeader) navbar.classList.add('dark');
  window.addEventListener('scroll', update, { passive: true });
  update();

  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });

  const burger = document.querySelector('.nav-hamburger');
  const links  = document.querySelector('.nav-links');
  if (burger && links) {
    burger.addEventListener('click', () => links.classList.toggle('mobile-open'));
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => links.classList.remove('mobile-open'));
    });
  }
}

/* ─────────────────────────────────────────
   HERO PARALLAX
───────────────────────────────────────── */
function initParallax() {
  const bg = document.querySelector('.hero-bg');
  if (!bg) return;

  function update() {
    bg.style.transform = `scale(1.12) translateY(${window.scrollY * 0.28}px)`;
  }
  window.addEventListener('scroll', update, { passive: true });
}

/* ─────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────── */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  els.forEach(el => io.observe(el));
}

/* ─────────────────────────────────────────
   FLOATING + TILT CARDS
   Cards bob gently at rest; on hover the bob
   pauses and a 3-D tilt tracks the cursor.
───────────────────────────────────────── */
function initFloatCards() {
  const bobCards = document.querySelectorAll('.chapter-card, .principle-card, .metric-card, .stat-card');

  /* staggered bob via CSS animation – assign delay with JS so cards within
     the same grid phase independently */
  bobCards.forEach((card, i) => {
    const dur   = 3.2 + (i % 5) * 0.35;
    const delay = i * 0.22;
    card.style.animation = `cardBob ${dur}s ease-in-out ${delay}s infinite`;
    card.style.willChange = 'transform';
  });

  /* 3-D tilt on chapter + principle cards */
  const tiltCards = document.querySelectorAll('.chapter-card, .principle-card');
  tiltCards.forEach((card, idx) => {
    card.addEventListener('mousemove', e => {
      card.style.animationPlayState = 'paused';
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `translateY(-12px) rotateX(${-y * 11}deg) rotateY(${x * 11}deg) scale(1.03)`;
      card.style.transition = 'transform 0.08s';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
      setTimeout(() => {
        card.style.transition = '';
        card.style.animationPlayState = '';
      }, 640);
    });
  });
}

/* ─────────────────────────────────────────
   GOOEY CARD EXPANSION
   Click a chapter card or principle card →
   it expands with elastic spring to near-fullscreen.
───────────────────────────────────────── */
function initCardExpansion() {
  /* backdrop */
  const backdrop = document.createElement('div');
  backdrop.id = 'expand-backdrop';
  backdrop.style.cssText = [
    'position:fixed', 'inset:0',
    'background:rgba(6,14,107,0.55)',
    'backdrop-filter:blur(8px)',
    '-webkit-backdrop-filter:blur(8px)',
    'z-index:8000', 'display:none', 'opacity:0',
    'transition:opacity 0.4s ease',
    'cursor:pointer'
  ].join(';');
  document.body.appendChild(backdrop);

  /* expansion panel */
  const panel = document.createElement('div');
  panel.id = 'expand-panel';
  panel.style.cssText = [
    'position:fixed', 'z-index:8001',
    'display:none', 'overflow-y:auto',
    'background:var(--white)',
    'border-radius:28px',
    'box-shadow:0 40px 120px rgba(6,14,107,0.35),0 8px 32px rgba(6,14,107,0.15)',
    'will-change:left,top,width,height,border-radius',
    'cursor:default'
  ].join(';');
  document.body.appendChild(panel);

  /* close button */
  const closeBtn = document.createElement('button');
  closeBtn.id = 'expand-close';
  closeBtn.innerHTML = '✕';
  closeBtn.style.cssText = [
    'position:fixed', 'z-index:8002',
    'display:none', 'align-items:center', 'justify-content:center',
    'top:28px', 'right:28px',
    'width:48px', 'height:48px',
    'border-radius:50%',
    'border:1.5px solid rgba(20,32,168,0.18)',
    'background:rgba(255,255,255,0.95)',
    'backdrop-filter:blur(10px)',
    'cursor:pointer',
    'font-size:18px', 'line-height:1',
    'color:var(--text-primary)',
    'box-shadow:0 4px 20px rgba(0,0,0,0.12)',
    'transition:background 0.25s,transform 0.4s cubic-bezier(0.34,1.56,0.64,1),border-color 0.25s,color 0.25s',
    'opacity:0'
  ].join(';');
  document.body.appendChild(closeBtn);

  let activeCard = null;

  /* ── open ── */
  function openCard(card) {
    if (activeCard) return;
    activeCard = card;

    const rect = card.getBoundingClientRect();

    /* Build inner content — clone card and make hidden elements visible */
    panel.innerHTML = '';
    const inner = document.createElement('div');
    inner.className = 'expand-inner';

    /* different content structure per card type */
    if (card.classList.contains('chapter-card')) {
      const bgDiv  = card.querySelector('.card-bg');
      const num    = card.querySelector('.card-num')?.textContent  || '';
      const title  = card.querySelector('.card-title')?.innerHTML  || '';
      const desc   = card.querySelector('.card-desc')?.textContent || '';
      const href   = card.getAttribute('href') || '#';
      const bgStyle = bgDiv ? bgDiv.style.backgroundImage : '';

      inner.innerHTML = `
        <div class="exp-hero" style="background-image:${bgStyle};background-size:cover;background-position:center;">
          <div class="exp-hero-overlay"></div>
          <div class="exp-hero-content">
            <p class="exp-num">${num}</p>
            <h2 class="exp-title">${title}</h2>
          </div>
        </div>
        <div class="exp-body">
          <p class="exp-desc">${desc}</p>
          <a href="${href}" class="btn-blue exp-cta">Read Chapter →</a>
        </div>
      `;
    } else {
      /* principle card / generic */
      inner.innerHTML = card.innerHTML;
      inner.querySelectorAll('.card-desc, .p-text').forEach(el => {
        el.style.opacity  = '1';
        el.style.transform = 'none';
      });
    }

    panel.appendChild(inner);

    /* position at card coords */
    Object.assign(panel.style, {
      display:      'block',
      left:         rect.left + 'px',
      top:          rect.top  + 'px',
      width:        rect.width  + 'px',
      height:       rect.height + 'px',
      borderRadius: '28px',
      transition:   'none',
    });

    backdrop.style.display = 'block';
    closeBtn.style.display = 'flex';

    /* after one frame → animate to fullscreen */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const spring = '0.65s cubic-bezier(0.34,1.56,0.64,1)';
        Object.assign(panel.style, {
          transition:   `left ${spring}, top ${spring}, width ${spring}, height ${spring}, border-radius 0.5s ${spring}`,
          left:         '3vw',
          top:          '3vh',
          width:        '94vw',
          height:       '94vh',
          borderRadius: '24px',
        });

        backdrop.style.opacity = '1';
        closeBtn.style.opacity = '1';
        closeBtn.style.transition = 'opacity 0.35s 0.3s, background 0.25s, transform 0.4s cubic-bezier(0.34,1.56,0.64,1), border-color 0.25s, color 0.25s';
      });
    });

    card.classList.add('card-is-open');
    document.body.style.overflow = 'hidden';
  }

  /* ── close ── */
  function closeCard() {
    if (!activeCard) return;
    const card = activeCard;
    const rect = card.getBoundingClientRect();

    const snap = '0.5s cubic-bezier(0.76,0,0.24,1)';
    Object.assign(panel.style, {
      transition:   `left ${snap}, top ${snap}, width ${snap}, height ${snap}, border-radius 0.4s ${snap}`,
      left:         rect.left + 'px',
      top:          rect.top  + 'px',
      width:        rect.width  + 'px',
      height:       rect.height + 'px',
      borderRadius: '28px',
    });

    backdrop.style.transition = 'opacity 0.35s';
    backdrop.style.opacity    = '0';
    closeBtn.style.opacity    = '0';

    setTimeout(() => {
      panel.style.display    = 'none';
      backdrop.style.display = 'none';
      closeBtn.style.display = 'none';
      card.classList.remove('card-is-open');
      activeCard = null;
      document.body.style.overflow = '';
    }, 520);
  }

  /* close button hover glow */
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.background   = 'var(--blue-deep)';
    closeBtn.style.color        = 'white';
    closeBtn.style.borderColor  = 'var(--blue-deep)';
    closeBtn.style.transform    = 'rotate(90deg) scale(1.1)';
  });
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.background   = 'rgba(255,255,255,0.95)';
    closeBtn.style.color        = 'var(--text-primary)';
    closeBtn.style.borderColor  = 'rgba(20,32,168,0.18)';
    closeBtn.style.transform    = '';
  });

  /* wire clicks */
  document.querySelectorAll('.chapter-card, .principle-card').forEach(card => {
    card.addEventListener('click', e => {
      e.preventDefault();
      openCard(card);
    });
  });

  closeBtn.addEventListener('click', closeCard);
  backdrop.addEventListener('click', closeCard);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCard(); });
}

/* ─────────────────────────────────────────
   MAGNETIC BUTTONS
───────────────────────────────────────── */
function initMagnetic() {
  const btns = document.querySelectorAll('.btn-primary, .btn-blue');

  btns.forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) * 0.28;
      const dy = (e.clientY - cy) * 0.28;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
      btn.style.transition = 'transform 0.1s';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform  = '';
      btn.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
    });
  });
}

/* ─────────────────────────────────────────
   ACCORDION — ENGINE LAYERS
───────────────────────────────────────── */
function initEngineAccordion() {
  const layers = document.querySelectorAll('.engine-layer');
  if (!layers.length) return;

  layers[0].classList.add('open');

  layers.forEach(layer => {
    const header = layer.querySelector('.engine-layer-header');
    if (!header) return;
    header.addEventListener('click', () => {
      const isOpen = layer.classList.contains('open');
      layers.forEach(l => l.classList.remove('open'));
      if (!isOpen) layer.classList.add('open');
    });
  });
}

/* ─────────────────────────────────────────
   FLOATING SKILL TAGS
───────────────────────────────────────── */
function initSkillFloats() {
  const tags = document.querySelectorAll('.skill-tag');
  tags.forEach((tag, i) => {
    const duration = 2.4 + (i % 4) * 0.6;
    const delay    = i * 0.22;
    tag.style.animation = `floatSkill ${duration}s ease-in-out ${delay}s infinite`;
  });
}

/* ─────────────────────────────────────────
   COUNTER ANIMATION
───────────────────────────────────────── */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el  = e.target;
      const end = parseFloat(el.dataset.count);
      const dur = 1800;
      const start = performance.now();

      function step(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Number.isInteger(end)
          ? Math.round(end * eased)
          : (end * eased).toFixed(1);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      io.unobserve(el);
    });
  }, { threshold: 0.6 });

  counters.forEach(c => io.observe(c));
}

/* ─────────────────────────────────────────
   PAGE TRANSITIONS (overlay wipe)
───────────────────────────────────────── */
function initPageTransitions() {
  const overlay = document.querySelector('.page-transition');
  if (!overlay) return;

  window.addEventListener('load', () => {
    overlay.style.transition = 'transform 0.65s cubic-bezier(0.76,0,0.24,1)';
    overlay.style.transformOrigin = 'top';
    overlay.style.transform = 'scaleY(0)';
  });

  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

    a.addEventListener('click', ev => {
      ev.preventDefault();
      overlay.style.transition = 'transform 0.5s cubic-bezier(0.76,0,0.24,1)';
      overlay.style.transformOrigin = 'bottom';
      overlay.style.transform = 'scaleY(1)';
      setTimeout(() => { window.location.href = href; }, 520);
    });
  });
}

/* ─────────────────────────────────────────
   TEXT SPLIT HOVER (chapter headings)
───────────────────────────────────────── */
document.querySelectorAll('.split-hover').forEach(el => {
  const text = el.textContent;
  el.innerHTML = text.split('').map(c =>
    `<span class="char">${c === ' ' ? '&nbsp;' : c}</span>`
  ).join('');
});
