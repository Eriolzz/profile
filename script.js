/* ============================================================
   PORTFOLIO — script.js
   All interactivity: loader, cursor, particles, typing,
   scroll animations, skill bars, counter, slider,
   gallery lightbox, contact form, back-to-top.
   ============================================================ */

'use strict';

/* ============================================================
   UTILITY HELPERS
============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);


/* ============================================================
   1. LOADING SCREEN
============================================================ */
(function initLoader() {
  const loader   = $('#loader');
  const bar      = $('#loaderBar');
  const text     = $('#loaderText');
  const messages = [
    'Loading assets...',
    'Compiling styles...',
    'Injecting personality...',
    'Almost there...',
    'Welcome! 🚀'
  ];
  let progress = 0;
  let msgIdx   = 0;

  const interval = setInterval(() => {
    // Random step between 8–18
    progress += Math.random() * 10 + 8;
    if (progress > 100) progress = 100;

    bar.style.width = progress + '%';

    // Cycle through messages
    const newIdx = Math.floor((progress / 100) * (messages.length - 1));
    if (newIdx !== msgIdx) {
      msgIdx = newIdx;
      text.textContent = messages[msgIdx];
    }

    if (progress >= 100) {
      clearInterval(interval);
      text.textContent = messages[messages.length - 1];
      setTimeout(() => {
        loader.classList.add('hidden');
        // Start hero animations after loader fades
        startHeroAnimations();
      }, 600);
    }
  }, 120);
})();


/* ============================================================
   2. CUSTOM CURSOR
============================================================ */
(function initCursor() {
  const dot  = $('#cursorDot');
  const ring = $('#cursorRing');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;
  let raf;

  on(document, 'mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  // Smooth ring follow
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    raf = requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover effect on interactive elements
  const hoverTargets = 'a, button, .project-card, .gallery__item, .service-card, .tag, .social-btn';
  on(document, 'mouseover', e => {
    if (e.target.closest(hoverTargets)) {
      document.body.classList.add('cursor-hover');
    }
  });
  on(document, 'mouseout', e => {
    if (e.target.closest(hoverTargets)) {
      document.body.classList.remove('cursor-hover');
    }
  });

  // Hide when leaving window
  on(document, 'mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  on(document, 'mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = ''; });
})();


/* ============================================================
   3. NAVBAR — scroll style + hamburger
============================================================ */
(function initNavbar() {
  const nav       = $('#navbar');
  const hamburger = $('#hamburger');
  const navLinks  = $('#navLinks');

  // Scrolled style
  on(window, 'scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Hamburger toggle
  on(hamburger, 'click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close on link click
  $$('.nav__link').forEach(link => {
    on(link, 'click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  // Active link highlight on scroll
  const sections = $$('section[id], div[id]');
  on(window, 'scroll', () => {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    $$('.nav__link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }, { passive: true });
})();


/* ============================================================
   4. PARTICLE CANVAS (Hero background)
============================================================ */
(function initParticles() {
  const canvas = $('#heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Resize handler
  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  on(window, 'resize', resize, { passive: true });

  // Particle factory
  const PARTICLE_COUNT = window.innerWidth < 768 ? 40 : 80;
  const particles = [];

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x  = Math.random() * canvas.width;
      this.y  = init ? Math.random() * canvas.height : canvas.height + 10;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = -(Math.random() * 0.6 + 0.2);
      this.size   = Math.random() * 2 + 0.5;
      this.alpha  = Math.random() * 0.5 + 0.1;
      this.color  = Math.random() > 0.5 ? '6,182,212' : '139,92,246';
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= 0.0008;
      if (this.y < -10 || this.alpha <= 0) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  // Connection lines between nearby particles
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(6,182,212,${0.06 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();


/* ============================================================
   5. TYPING EFFECT
============================================================ */
function startHeroAnimations() {
  const el    = $('#typingText');
  if (!el) return;

  const roles = [
    'Frontend Developer',
    'UI / UX Craftsman',
    'Performance Advocate',
    'Web Experience Builder',
  ];
  let roleIdx = 0;
  let charIdx = 0;
  let deleting = false;
  const SPEED_TYPE = 70;
  const SPEED_DEL  = 35;
  const PAUSE_FULL = 2000;
  const PAUSE_EMPTY = 400;

  function type() {
    const current = roles[roleIdx];
    if (deleting) {
      el.textContent = current.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        roleIdx  = (roleIdx + 1) % roles.length;
        setTimeout(type, PAUSE_EMPTY);
        return;
      }
      setTimeout(type, SPEED_DEL);
    } else {
      el.textContent = current.slice(0, ++charIdx);
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(type, PAUSE_FULL);
        return;
      }
      setTimeout(type, SPEED_TYPE);
    }
  }
  setTimeout(type, 600);
}


/* ============================================================
   6. FADE-IN ON SCROLL (IntersectionObserver)
============================================================ */
(function initFadeIn() {
  const items = $$('.fade-in');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      // Stagger delay based on index among siblings
      const siblings = $$('.fade-in', entry.target.parentElement);
      const delay    = siblings.indexOf(entry.target) * 80;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  items.forEach(item => observer.observe(item));
})();


/* ============================================================
   7. SKILL BAR ANIMATION
============================================================ */
(function initSkillBars() {
  const bars = $$('.skill-bar__fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('animate');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  bars.forEach(bar => observer.observe(bar));
})();


/* ============================================================
   8. COUNTER ANIMATION (Stats section)
============================================================ */
(function initCounters() {
  const nums = $$('.stat-item__num');
  if (!nums.length) return;

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target);
    const duration = 1800;
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  nums.forEach(n => observer.observe(n));
})();


/* ============================================================
   9. TESTIMONIALS SLIDER
============================================================ */
(function initSlider() {
  const track   = $('#sliderTrack');
  const dotsWrap = $('#sliderDots');
  if (!track) return;

  const slides  = $$('.testimonial-card', track);
  let current   = 0;
  let autoTimer;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'slider__dot' + (i === 0 ? ' active' : '');
    on(dot, 'click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function goTo(idx) {
    current = (idx + slides.length) % slides.length;
    track.style.transform = `translateX(calc(-${current * 100}% - ${current * 1.5}rem))`;
    $$('.slider__dot', dotsWrap).forEach((d, i) => d.classList.toggle('active', i === current));
    resetAuto();
  }

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  on($('#sliderPrev'), 'click', () => goTo(current - 1));
  on($('#sliderNext'), 'click', () => goTo(current + 1));

  // Touch / swipe support
  let touchStartX = 0;
  on(track, 'touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  on(track, 'touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
  });

  resetAuto();
})();


/* ============================================================
   10. GALLERY LIGHTBOX
============================================================ */
(function initLightbox() {
  const items   = $$('.gallery__item');
  const lightbox = $('#lightbox');
  const img     = $('#lightboxImg');
  const closeBtn = $('#lightboxClose');
  const prevBtn  = $('#lightboxPrev');
  const nextBtn  = $('#lightboxNext');
  if (!lightbox) return;

  const srcs = items.map(item => item.dataset.src);
  let current = 0;

  function open(idx) {
    current = idx;
    img.src = srcs[current];
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
  function prev() { current = (current - 1 + srcs.length) % srcs.length; img.src = srcs[current]; }
  function next() { current = (current + 1) % srcs.length; img.src = srcs[current]; }

  items.forEach((item, i) => on(item, 'click', () => open(i)));
  on(closeBtn, 'click', close);
  on(prevBtn,  'click', prev);
  on(nextBtn,  'click', next);
  on(lightbox, 'click', e => { if (e.target === lightbox) close(); });
  on(document, 'keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft')   prev();
    if (e.key === 'ArrowRight')  next();
  });
})();


/* ============================================================
   11. CONTACT FORM VALIDATION
============================================================ */
(function initContactForm() {
  const form    = $('#contactForm');
  if (!form) return;

  const fields = {
    formName:    { el: $('#formName'),    err: $('#nameError'),    label: 'Name',    min: 2 },
    formEmail:   { el: $('#formEmail'),   err: $('#emailError'),   label: 'Email',   type: 'email' },
    formSubject: { el: $('#formSubject'), err: $('#subjectError'), label: 'Subject', min: 3 },
    formMessage: { el: $('#formMessage'), err: $('#messageError'), label: 'Message', min: 10 },
  };

  function validate(field) {
    const { el, err, label, min, type } = field;
    const val = el.value.trim();
    let msg = '';

    if (!val) {
      msg = `${label} is required.`;
    } else if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      msg = 'Please enter a valid email.';
    } else if (min && val.length < min) {
      msg = `${label} must be at least ${min} characters.`;
    }

    err.textContent = msg;
    el.closest('.form-group').classList.toggle('error', !!msg);
    return !msg;
  }

  // Live validation on blur
  Object.values(fields).forEach(f => on(f.el, 'blur', () => validate(f)));

  on(form, 'submit', e => {
    e.preventDefault();
    const valid = Object.values(fields).map(f => validate(f)).every(Boolean);
    if (!valid) return;

    const btn  = $('#submitBtn');
    const succ = $('#formSuccess');

    // Simulate async send
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

    setTimeout(() => {
      btn.style.display = 'none';
      succ.classList.add('show');
      form.reset();
      // Re-show button after 5s
      setTimeout(() => {
        btn.style.display = '';
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> <span>Send Message</span>';
        succ.classList.remove('show');
      }, 5000);
    }, 1500);
  });
})();


/* ============================================================
   12. BUTTON RIPPLE EFFECT
============================================================ */
(function initRipple() {
  on(document, 'click', e => {
    const btn = e.target.closest('.btn');
    if (!btn) return;

    const rect   = btn.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height);
    const x      = e.clientX - rect.left - size / 2;
    const y      = e.clientY - rect.top  - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
    btn.appendChild(ripple);
    on(ripple, 'animationend', () => ripple.remove());
  });
})();


/* ============================================================
   13. BACK TO TOP
============================================================ */
(function initBTT() {
  const btt = $('#btt');
  if (!btt) return;

  on(window, 'scroll', () => {
    btt.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });

  on(btt, 'click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ============================================================
   14. SUBTLE PARALLAX (Hero grid & section backgrounds)
============================================================ */
(function initParallax() {
  const grid = $('.hero__grid');
  if (!grid) return;

  let ticking = false;
  on(window, 'scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      grid.style.transform = `translateY(${scrollY * 0.3}px)`;
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
})();


/* ============================================================
   15. SECTION NAV ACTIVE STATE (smooth highlight)
============================================================ */
(function initActiveNav() {
  // Adds a neon underline to the matching nav link
  const style = document.createElement('style');
  style.textContent = `.nav__link.active { color: var(--text-hi); }
    .nav__link.active::after { width: 100%; }`;
  document.head.appendChild(style);
})();


/* ============================================================
   16. KEYBOARD NAVIGATION ACCESSIBILITY
============================================================ */
(function initA11y() {
  // Show focus outline only on keyboard nav
  on(document, 'keydown', e => {
    if (e.key === 'Tab') document.body.classList.add('keyboard-nav');
  });
  on(document, 'mousedown', () => {
    document.body.classList.remove('keyboard-nav');
  });

  const focusStyle = document.createElement('style');
  focusStyle.textContent = `
    .keyboard-nav :focus-visible {
      outline: 2px solid var(--cyan);
      outline-offset: 3px;
      border-radius: 4px;
    }`;
  document.head.appendChild(focusStyle);
})();


/* ============================================================
   17. MOBILE — prevent scroll when nav is open
============================================================ */
(function initMobileNav() {
  const hamburger = $('#hamburger');
  const navLinks  = $('#navLinks');
  if (!hamburger) return;

  const observer = new MutationObserver(() => {
    document.body.style.overflow =
      navLinks.classList.contains('open') ? 'hidden' : '';
  });
  observer.observe(navLinks, { attributes: true, attributeFilter: ['class'] });
})();


/* ============================================================
   INIT COMPLETE — log to console for dev pride :)
============================================================ */
console.log(
  '%c AN Portfolio v1.0 %c Built with pure HTML, CSS & JS — no frameworks.',
  'background: linear-gradient(90deg,#06b6d4,#8b5cf6); color:#fff; padding:4px 8px; border-radius:4px; font-weight:bold;',
  'color:#94a3b8; padding:4px 0;'
);
