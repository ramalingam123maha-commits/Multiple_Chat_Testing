/* =============================================
   EVENT COUNTDOWN — JAVASCRIPT
   ============================================= */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
     CONFIG — edit these to customise the event
  ───────────────────────────────────────────── */
  const EVENT_CONFIG = {
    title:    'TechSphere 2025',
    subtitle: 'The Future Starts Here',
    // Set your target date/time (ISO 8601 — local time zone implied)
    targetDate: new Date('2025-10-18T09:00:00'),
    shareUrl:   window.location.href,
    shareText:  'Join me at TechSphere 2025 — the biggest tech event of the year! 🚀',
  };

  /* ─────────────────────────────────────────
     PARTICLE SYSTEM
  ───────────────────────────────────────────── */
  const ParticleEngine = (() => {
    const canvas  = document.getElementById('particle-canvas');
    const ctx     = canvas.getContext('2d');
    let particles = [];
    let animId;
    let W, H;

    const PARTICLE_COUNT = window.innerWidth < 600 ? 55 : 110;
    const COLORS = ['#6c63ff', '#43e8d8', '#a855f7', '#ff6584', '#ffffff'];
    const CONNECT_DIST = 140;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    function createParticle() {
      return {
        x:     rand(0, W),
        y:     rand(0, H),
        vx:    rand(-0.35, 0.35),
        vy:    rand(-0.35, 0.35),
        r:     rand(1.2, 3.0),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: rand(0.25, 0.75),
        dAlpha: rand(0.003, 0.008) * (Math.random() < 0.5 ? 1 : -1),
      };
    }

    function init() {
      resize();
      particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
      window.addEventListener('resize', resize);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Draw connecting lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const opacity = (1 - dist / CONNECT_DIST) * 0.18;
            ctx.strokeStyle = `rgba(108,99,255,${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0.1, Math.min(0.9, p.alpha));
        ctx.fillStyle   = p.color;
        ctx.shadowBlur  = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Move
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.dAlpha;

        // Pulse opacity
        if (p.alpha >= 0.8 || p.alpha <= 0.15) p.dAlpha *= -1;

        // Wrap edges
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;
      }

      animId = requestAnimationFrame(draw);
    }

    function start() {
      init();
      draw();
    }

    // Mouse interaction — attract nearby particles
    function onMouseMove(e) {
      const mx = e.clientX;
      const my = e.clientY;
      particles.forEach((p) => {
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120 * 0.04;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
          // clamp speed
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (speed > 1.4) {
            p.vx = (p.vx / speed) * 1.4;
            p.vy = (p.vy / speed) * 1.4;
          }
        }
      });
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    return { start };
  })();

  /* ─────────────────────────────────────────
     COUNTDOWN TIMER
  ───────────────────────────────────────────── */
  const Countdown = (() => {
    const els = {
      days:    document.getElementById('cd-days'),
      hours:   document.getElementById('cd-hours'),
      minutes: document.getElementById('cd-minutes'),
      seconds: document.getElementById('cd-seconds'),
      wrapper: document.getElementById('countdown-wrapper'),
      overMsg: document.getElementById('event-over-msg'),
    };

    let prevValues = { days: -1, hours: -1, minutes: -1, seconds: -1 };
    let intervalId;

    function pad(n) {
      return String(n).padStart(2, '0');
    }

    function flip(el) {
      el.classList.remove('flip');
      // Force reflow
      void el.offsetWidth;
      el.classList.add('flip');
    }

    function update() {
      const now  = new Date();
      const diff = EVENT_CONFIG.targetDate - now;

      if (diff <= 0) {
        // Event has started / passed
        clearInterval(intervalId);
        els.wrapper.classList.add('hidden');
        els.overMsg.classList.remove('hidden');
        return;
      }

      const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours   = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      if (days    !== prevValues.days)    { els.days.textContent    = pad(days);    flip(els.days);    }
      if (hours   !== prevValues.hours)   { els.hours.textContent   = pad(hours);   flip(els.hours);   }
      if (minutes !== prevValues.minutes) { els.minutes.textContent = pad(minutes); flip(els.minutes); }
      if (seconds !== prevValues.seconds) { els.seconds.textContent = pad(seconds); flip(els.seconds); }

      prevValues = { days, hours, minutes, seconds };
    }

    function start() {
      update();
      intervalId = setInterval(update, 1000);
    }

    return { start };
  })();

  /* ─────────────────────────────────────────
     RSVP FORM
  ───────────────────────────────────────────── */
  const RSVPForm = (() => {
    const form    = document.getElementById('rsvp-form');
    const submit  = document.getElementById('rsvp-submit');
    const success = document.getElementById('rsvp-success');

    function showError(field, msg) {
      const input = document.getElementById(`rsvp-${field}`);
      const error = document.getElementById(`error-${field}`);
      input.classList.add('invalid');
      if (error) error.textContent = msg;
    }

    function clearError(field) {
      const input = document.getElementById(`rsvp-${field}`);
      const error = document.getElementById(`error-${field}`);
      input.classList.remove('invalid');
      if (error) error.textContent = '';
    }

    function validate() {
      let valid = true;

      const name   = document.getElementById('rsvp-name').value.trim();
      const email  = document.getElementById('rsvp-email').value.trim();
      const ticket = document.getElementById('rsvp-ticket').value;

      clearError('name');
      clearError('email');
      clearError('ticket');

      if (!name) {
        showError('name', 'Please enter your full name.');
        valid = false;
      } else if (name.length < 2) {
        showError('name', 'Name must be at least 2 characters.');
        valid = false;
      }

      if (!email) {
        showError('email', 'Please enter your email address.');
        valid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('email', 'Please enter a valid email address.');
        valid = false;
      }

      if (!ticket) {
        showError('ticket', 'Please select a ticket type.');
        valid = false;
      }

      return valid;
    }

    // Live validation on blur
    ['name', 'email', 'ticket'].forEach((field) => {
      const el = document.getElementById(`rsvp-${field}`);
      if (!el) return;
      el.addEventListener('blur', () => {
        clearError(field);
        validate();
      });
      el.addEventListener('input', () => clearError(field));
    });

    function onSubmit(e) {
      e.preventDefault();
      if (!validate()) return;

      // Simulate async submission
      submit.disabled    = true;
      submit.textContent = 'Sending…';

      setTimeout(() => {
        form.reset();
        submit.classList.add('hidden');
        success.classList.remove('hidden');
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 1200);
    }

    function init() {
      form.addEventListener('submit', onSubmit);
    }

    return { init };
  })();

  /* ─────────────────────────────────────────
     SOCIAL SHARE
  ───────────────────────────────────────────── */
  const SocialShare = (() => {
    const shareUrl  = encodeURIComponent(EVENT_CONFIG.shareUrl);
    const shareText = encodeURIComponent(EVENT_CONFIG.shareText);

    function buildUrls() {
      return {
        twitter:  `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
        whatsapp: `https://wa.me/?text=${shareText}%20${shareUrl}`,
      };
    }

    function init() {
      const urls = buildUrls();

      document.getElementById('share-twitter').href  = urls.twitter;
      document.getElementById('share-facebook').href = urls.facebook;
      document.getElementById('share-linkedin').href = urls.linkedin;
      document.getElementById('share-whatsapp').href = urls.whatsapp;

      // Copy link button
      const copyBtn   = document.getElementById('share-copy');
      const copyLabel = document.getElementById('copy-label');

      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(EVENT_CONFIG.shareUrl);
          copyLabel.textContent = '✓ Copied!';
          copyBtn.style.color = '#43e8d8';
          copyBtn.style.borderColor = '#43e8d8';
        } catch {
          // Fallback for older browsers
          const ta = document.createElement('textarea');
          ta.value = EVENT_CONFIG.shareUrl;
          ta.style.cssText = 'position:fixed;opacity:0;';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          copyLabel.textContent = '✓ Copied!';
          copyBtn.style.color = '#43e8d8';
          copyBtn.style.borderColor = '#43e8d8';
        }

        setTimeout(() => {
          copyLabel.textContent = 'Copy Link';
          copyBtn.style.color   = '';
          copyBtn.style.borderColor = '';
        }, 2500);
      });
    }

    return { init };
  })();

  /* ─────────────────────────────────────────
     SCROLL REVEAL  (lightweight, no library)
  ───────────────────────────────────────────── */
  const ScrollReveal = (() => {
    const targets = [
      '.detail-card',
      '.schedule-teaser',
      '.rsvp-form',
      '.share-btn',
    ];

    function addStyles() {
      const style = document.createElement('style');
      style.textContent = `
        .sr-hidden {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .sr-visible {
          opacity: 1 !important;
          transform: none !important;
        }
      `;
      document.head.appendChild(style);
    }

    function init() {
      addStyles();

      const elements = [];
      targets.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el, i) => {
          el.classList.add('sr-hidden');
          el.style.transitionDelay = `${i * 80}ms`;
          elements.push(el);
        });
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('sr-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );

      elements.forEach((el) => observer.observe(el));
    }

    return { init };
  })();

  /* ─────────────────────────────────────────
     SMOOTH ANCHOR SCROLL (for btn links)
  ───────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ─────────────────────────────────────────
     BOOT
  ───────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    ParticleEngine.start();
    Countdown.start();
    RSVPForm.init();
    SocialShare.init();
    ScrollReveal.init();
  });

})();
