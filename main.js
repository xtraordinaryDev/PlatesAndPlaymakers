/* ============================================================
   PLATES & PLAYMAKERS — main.js
   Init order:
   1. GSAP.registerPlugin(ScrollTrigger)
   2. Custom cursor
   3. Nav scroll behavior
   4. Page load animation
   5. Hero particle canvas
   6. Hero text stagger reveal
   7. Mission CountUp
   8. Tickets headline letter reveal
   9. Event countdown timer
   10. General fade-up animations
   ============================================================ */

(function () {
  'use strict';

  const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
  const isTouchDevice = () => window.matchMedia('(hover: none)').matches;

  /* ── 1. GSAP REGISTER ───────────────────────────────────── */

  gsap.registerPlugin(ScrollTrigger);
  gsap.ticker.lagSmoothing(0);

  /* ── 3. CUSTOM CURSOR ───────────────────────────────────── */

  if (!isTouchDevice()) {
    const dot  = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');

    let mouseX = -100, mouseY = -100;
    let ringX  = -100, ringY  = -100;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top  = mouseY + 'px';
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.left = ringX + 'px';
      ring.style.top  = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Scale on interactive hover
    const interactives = document.querySelectorAll('a, button, .chef-card, .card, .nav-logo');
    interactives.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        dot.style.transform  = 'translate(-50%, -50%) scale(2)';
        ring.style.width     = '52px';
        ring.style.height    = '52px';
        ring.style.opacity   = '0.25';
      });
      el.addEventListener('mouseleave', () => {
        dot.style.transform  = 'translate(-50%, -50%) scale(1)';
        ring.style.width     = '32px';
        ring.style.height    = '32px';
        ring.style.opacity   = '0.6';
      });
    });
  } else {
    // Hide cursor elements on touch
    const dot  = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (dot)  dot.style.display  = 'none';
    if (ring) ring.style.display = 'none';
  }

  /* ── 4. NAV SCROLL BEHAVIOR ─────────────────────────────── */

  const nav = document.getElementById('nav');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });

  // Active nav link via IntersectionObserver
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navAnchors.forEach((a) => {
            a.classList.toggle('active', a.getAttribute('href') === '#' + id);
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach((s) => sectionObserver.observe(s));

  // Hamburger mobile menu
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
  });

  navLinks.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.textContent = '☰';
    });
  });

  /* ── 5. PAGE LOAD ANIMATION ─────────────────────────────── */

  const overlay = document.getElementById('pageOverlay');

  gsap.to(overlay, {
    opacity: 0,
    duration: 1.2,
    ease: 'power2.inOut',
    delay: 0.2,
    onComplete: () => {
      overlay.style.display = 'none';
    },
  });

  /* ── 6. HERO PARTICLE CANVAS ────────────────────────────── */

  const canvas  = document.getElementById('particles');
  const ctx     = canvas.getContext('2d');
  const PARTICLE_COUNT = isMobile() ? 40 : 80;

  let particles = [];

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x:  randomBetween(0, canvas.width),
        y:  randomBetween(0, canvas.height),
        vx: randomBetween(-0.25, 0.25),
        vy: randomBetween(-0.25, 0.25),
        r:  randomBetween(1, 2.5),
        alpha: randomBetween(0.15, 0.5),
      });
    }
  }

  createParticles();
  window.addEventListener('resize', createParticles, { passive: true });

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap at edges
      if (p.x < 0)              p.x = canvas.width;
      if (p.x > canvas.width)   p.x = 0;
      if (p.y < 0)              p.y = canvas.height;
      if (p.y > canvas.height)  p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(155, 137, 93, ${p.alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(animateParticles);
  }

  animateParticles();

  /* ── 7. HERO TEXT STAGGER REVEAL ────────────────────────── */

  const heroContent = document.querySelector('.hero-content');
  const heroChildren = heroContent.querySelectorAll(
    '.hero-badge-img, .hero-title, .hero-est, .hero-tagline, .hero-date, .cta-btn'
  );

  // Split .hero-tagline into individual characters
  const tagline = document.querySelector('.hero-tagline');
  if (tagline) {
    const text = tagline.textContent;
    tagline.innerHTML = text
      .split('')
      .map((ch) =>
        ch === ' '
          ? '<span class="char" style="display:inline-block;">&nbsp;</span>'
          : `<span class="char" style="display:inline-block; opacity:0; transform:translateY(16px);">${ch}</span>`
      )
      .join('');
  }

  const tl = gsap.timeline({ delay: 0.6 });

  tl.from('.hero-badge-img', { opacity: 0, scale: 0.5, duration: 0.8, ease: 'back.out(1.7)' })
    .from('.hero-title',   { opacity: 0, y: 40,       duration: 0.8, ease: 'power3.out' }, '-=0.4')
    .from('.hero-est',     { opacity: 0, y: 20,       duration: 0.6, ease: 'power2.out' }, '-=0.4')
    .to('.hero-tagline .char', {
        opacity: 1, y: 0, duration: 0.04, stagger: 0.025, ease: 'none',
      }, '-=0.2')
    .from('.hero-date',    { opacity: 0, y: 16,       duration: 0.5, ease: 'power2.out' }, '-=0.1')
    .from('.cta-btn',      { opacity: 0, y: 16,       duration: 0.5, ease: 'power2.out' }, '-=0.2')
    .from('.hero-scroll-hint', { opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.1');

  /* ── 8. MISSION COUNTUP ─────────────────────────────────── */

  const countEl = document.getElementById('count');
  let countStarted = false;

  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !countStarted) {
          countStarted = true;
          const target   = 6;
          const duration = 2000;
          const start    = performance.now();

          function step(now) {
            const elapsed  = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased    = 1 - Math.pow(1 - progress, 3);
            countEl.textContent = (eased * target).toFixed(1);
            if (progress < 1) requestAnimationFrame(step);
          }

          requestAnimationFrame(step);
        }
      });
    },
    { threshold: 0.5 }
  );

  const missionSection = document.getElementById('mission');
  if (missionSection) countObserver.observe(missionSection);

  /* ── 9. CHEFS GRID — no action needed here ──────────────── */
  // Animation handled below in section 12

  /* ── 10. TICKETS HEADLINE LETTER REVEAL ─────────────────── */

  const ticketsHeadline = document.querySelector('.tickets-headline');
  if (ticketsHeadline) {
    const text = ticketsHeadline.textContent;
    // Wrap each word in a nowrap container so the browser never breaks mid-word
    ticketsHeadline.innerHTML = text
      .split(' ')
      .map((word) => {
        const chars = word
          .split('')
          .map((ch) => `<span class="t-char" style="display:inline-block; opacity:0; transform:translateY(20px);">${ch}</span>`)
          .join('');
        return `<span style="display:inline-block; white-space:nowrap;">${chars}</span>`;
      })
      .join('<span class="t-char" style="display:inline-block;">&nbsp;</span>');

    ScrollTrigger.create({
      trigger: '#tickets',
      start: 'top 75%',
      onEnter: () => {
        gsap.to('.tickets-headline .t-char', {
          opacity: 1,
          y: 0,
          duration: 0.05,
          stagger: 0.02,
          ease: 'none',
        });
      },
    });
  }

  /* ── 11. EVENT COUNTDOWN TIMER ──────────────────────────── */

  // July 9, 2026 7:00 PM CST = UTC-6 (CDT) → 2026-07-10T00:00:00Z
  const eventDate = new Date('2026-07-10T00:00:00Z');

  const cdDays  = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMins  = document.getElementById('cd-mins');
  const cdSecs  = document.getElementById('cd-secs');

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function updateCountdown() {
    const now   = new Date();
    const diff  = eventDate - now;

    if (diff <= 0) {
      if (cdDays)  cdDays.textContent  = '00';
      if (cdHours) cdHours.textContent = '00';
      if (cdMins)  cdMins.textContent  = '00';
      if (cdSecs)  cdSecs.textContent  = '00';
      return;
    }

    const totalSecs = Math.floor(diff / 1000);
    const days  = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const mins  = Math.floor((totalSecs % 3600) / 60);
    const secs  = totalSecs % 60;

    if (cdDays)  cdDays.textContent  = pad(days);
    if (cdHours) cdHours.textContent = pad(hours);
    if (cdMins)  cdMins.textContent  = pad(mins);
    if (cdSecs)  cdSecs.textContent  = pad(secs);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ── 12. GENERAL FADE-UP ANIMATIONS ────────────────────── */

  const fadeEls = document.querySelectorAll('.fade-up');

  fadeEls.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
        });
      },
    });
  });

  // Stagger mission cards
  const missionCards = document.querySelectorAll('#mission .card');
  if (missionCards.length) {
    ScrollTrigger.create({
      trigger: '#mission .impact-cards',
      start: 'top 80%',
      onEnter: () => {
        gsap.to(missionCards, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power3.out',
        });
      },
    });
  }

  // Chef cards stagger entrance — all screens
  const chefCards = document.querySelectorAll('.chef-card');
  if (chefCards.length) {
    gsap.set(chefCards, { opacity: 0, y: 36 });
    ScrollTrigger.create({
      trigger: '#chefs',
      start: 'top 78%',
      onEnter: () => {
        gsap.to(chefCards, {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.07,
          ease: 'power3.out',
        });
      },
    });
  }

  /* ── RESIZE HANDLER ─────────────────────────────────────── */

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);
  }, { passive: true });

})();
