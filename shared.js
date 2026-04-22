/* ============================================================
   PLATES & PLAYMAKERS — shared.js
   Common functionality for all sub-pages
   ============================================================ */

(function () {
  'use strict';

  const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
  const isTouchDevice = () => window.matchMedia('(hover: none)').matches;

  /* ── GSAP ─────────────────────────────────────────────────── */

  gsap.registerPlugin(ScrollTrigger);
  gsap.ticker.lagSmoothing(0);

  /* ── CUSTOM CURSOR ────────────────────────────────────────── */

  if (!isTouchDevice()) {
    const dot  = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (dot && ring) {
      let mouseX = -100, mouseY = -100, ringX = -100, ringY = -100;
      document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
        dot.style.left = mouseX + 'px';
        dot.style.top  = mouseY + 'px';
      });
      (function animateRing() {
        ringX += (mouseX - ringX) * 0.12;
        ringY += (mouseY - ringY) * 0.12;
        ring.style.left = ringX + 'px';
        ring.style.top  = ringY + 'px';
        requestAnimationFrame(animateRing);
      })();
      document.querySelectorAll('a, button, .faq-item, .chef-full-card, .sponsor-card, .donate-tier').forEach((el) => {
        el.addEventListener('mouseenter', () => {
          dot.style.transform = 'translate(-50%, -50%) scale(2)';
          ring.style.width = '52px'; ring.style.height = '52px'; ring.style.opacity = '0.25';
        });
        el.addEventListener('mouseleave', () => {
          dot.style.transform = 'translate(-50%, -50%) scale(1)';
          ring.style.width = '32px'; ring.style.height = '32px'; ring.style.opacity = '0.6';
        });
      });
    }
  } else {
    ['cursorDot', 'cursorRing'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  }

  /* ── NAV ──────────────────────────────────────────────────── */

  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  // Mark active nav link based on current page
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === currentPage) a.classList.add('active');
  });

  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      hamburger.textContent = navLinks.classList.contains('open') ? '\u2715' : '\u2630';
    });
    navLinks.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.textContent = '\u2630';
      });
    });
  }

  /* ── PAGE OVERLAY ─────────────────────────────────────────── */

  const overlay = document.getElementById('pageOverlay');
  if (overlay) {
    gsap.to(overlay, {
      opacity: 0, duration: 1.2, ease: 'power2.inOut', delay: 0.2,
      onComplete: () => { overlay.style.display = 'none'; },
    });
  }

  /* ── PAGE HERO REVEAL ─────────────────────────────────────── */

  const heroTl = gsap.timeline({ delay: 0.5 });
  const heroBadge   = document.querySelector('.page-hero-badge');
  const heroEyebrow = document.querySelector('.page-hero-eyebrow');
  const heroTitle   = document.querySelector('.page-hero-title');
  const heroSub     = document.querySelector('.page-hero-sub');

  if (heroBadge)   heroTl.from(heroBadge,   { opacity: 0, scale: 0.5, duration: 0.8, ease: 'back.out(1.7)' });
  if (heroEyebrow) heroTl.from(heroEyebrow, { opacity: 0, y: 16, duration: 0.5, ease: 'power2.out' }, '-=0.4');
  if (heroTitle)   heroTl.from(heroTitle,   { opacity: 0, y: 32, duration: 0.8, ease: 'power3.out' }, '-=0.3');
  if (heroSub)     heroTl.from(heroSub,     { opacity: 0, y: 16, duration: 0.6, ease: 'power2.out' }, '-=0.3');

  /* ── FADE-UP ──────────────────────────────────────────────── */

  document.querySelectorAll('.fade-up').forEach((el) => {
    ScrollTrigger.create({
      trigger: el, start: 'top 88%',
      onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }),
    });
  });

  /* ── STAGGER GRID CHILDREN ────────────────────────────────── */

  document.querySelectorAll('.stagger-grid').forEach((grid) => {
    const children = Array.from(grid.children);
    gsap.set(children, { opacity: 0, y: 24 });
    ScrollTrigger.create({
      trigger: grid, start: 'top 82%',
      onEnter: () => {
        gsap.to(children, { opacity: 1, y: 0, duration: 0.65, stagger: 0.09, ease: 'power3.out' });
      },
    });
  });

  /* ── FAQ ACCORDION ────────────────────────────────────────── */

  document.querySelectorAll('.faq-item').forEach((item) => {
    const question = item.querySelector('.faq-question');
    if (!question) return;
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach((i) => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ── COUNTUP (reusable) ───────────────────────────────────── */

  document.querySelectorAll('[data-countup]').forEach((el) => {
    const target   = parseFloat(el.dataset.countup);
    const prefix   = el.dataset.prefix  || '';
    const suffix   = el.dataset.suffix  || '';
    const duration = parseInt(el.dataset.duration || '2000', 10);
    let started = false;

    ScrollTrigger.create({
      trigger: el, start: 'top 85%',
      onEnter: () => {
        if (started) return;
        started = true;
        const t0 = performance.now();
        (function step(now) {
          const p = Math.min((now - t0) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = eased * target;
          el.textContent = prefix + (target >= 1000
            ? Math.floor(val).toLocaleString('en-US')
            : val.toFixed(0)) + suffix;
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      },
    });
  });

  /* ── RESIZE ───────────────────────────────────────────────── */

  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => ScrollTrigger.refresh(), 200);
  }, { passive: true });

})();
