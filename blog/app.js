/* ============================================================
   INKWELL BLOG — app.js
   ============================================================ */

(() => {
  'use strict';

  /* ── 1. Reading Progress Bar ────────────────────────────── */
  const progressBar = document.getElementById('progress-bar');

  function updateProgress() {
    const scrollTop    = window.scrollY;
    const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
    const progress     = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${Math.min(progress, 100)}%`;
    progressBar.setAttribute('aria-valuenow', Math.round(progress));
  }

  /* ── 2. Sticky Header Shadow ─────────────────────────────── */
  const header = document.getElementById('site-header');

  function updateHeader() {
    header.classList.toggle('scrolled', window.scrollY > 12);
  }

  /* Throttled scroll listener */
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateProgress();
        updateHeader();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  /* Init on load */
  updateProgress();
  updateHeader();

  /* ── 3. Dark / Light Mode Toggle ─────────────────────────── */
  const themeToggle = document.getElementById('theme-toggle');
  const htmlEl      = document.documentElement;
  const STORAGE_KEY = 'inkwell-theme';

  // Detect system preference or saved preference
  function getInitialTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    themeToggle.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    );
    themeToggle.setAttribute('title', theme === 'dark' ? 'Light mode' : 'Dark mode');
    localStorage.setItem(STORAGE_KEY, theme);
  }

  // Apply immediately (avoids flash)
  applyTheme(getInitialTheme());

  themeToggle.addEventListener('click', () => {
    const current = htmlEl.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  // Sync with OS preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  /* ── 4. Mobile Navigation Toggle ────────────────────────── */
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mainNav       = document.getElementById('main-nav');

  mobileMenuBtn.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    mobileMenuBtn.classList.toggle('open', isOpen);
    mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
    mobileMenuBtn.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  });

  // Close nav on outside click
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target) && mainNav.classList.contains('open')) {
      mainNav.classList.remove('open');
      mobileMenuBtn.classList.remove('open');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Close nav on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav.classList.contains('open')) {
      mainNav.classList.remove('open');
      mobileMenuBtn.classList.remove('open');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
      mobileMenuBtn.focus();
    }
  });

  /* ── 5. Category Filter ──────────────────────────────────── */
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const articleGrid = document.getElementById('articles-grid');
  const cards       = Array.from(articleGrid.querySelectorAll('.card'));

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active state + ARIA
      filterBtns.forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-selected', String(b === btn));
      });

      // Show / hide cards with a brief fade
      cards.forEach(card => {
        const category   = card.dataset.category;
        const shouldShow = filter === 'all' || category === filter;

        if (shouldShow) {
          card.classList.remove('hidden');
          card.style.animationName = 'none';
          // Re-trigger animation
          requestAnimationFrame(() => {
            card.style.animationName = '';
            card.style.animation = 'fadeInUp 0.4s ease backwards';
          });
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  /* ── 6. Load More (stub) ─────────────────────────────────── */
  const loadMoreBtn = document.getElementById('load-more-btn');
  let loadCount = 0;

  // Extra article data for "Load More"
  const extraArticles = [
    {
      category: 'culture',
      imgClass: 'card__img--3',
      title: 'The Return of Long-Form Reading in a Short-Attention World',
      excerpt: 'Newsletters, Substack, and serialized fiction are booming. Why people are craving depth again.',
      author: 'NB', authorName: 'Nina Bloom',
      date: 'May 28, 2025', readTime: '5 min read',
    },
    {
      category: 'science',
      imgClass: 'card__img--4',
      title: 'CRISPR 3.0: Gene Editing Gets a Precision Upgrade',
      excerpt: 'Prime editing and base editing promise off-target edits near zero — and that changes everything for medicine.',
      author: 'HO', authorName: 'Hana Okafor',
      date: 'May 25, 2025', readTime: '7 min read',
    },
    {
      category: 'technology',
      imgClass: 'card__img--2',
      title: 'Why Every Startup Is Becoming an AI Company (Whether They Like It or Not)',
      excerpt: 'The pressure to embed LLMs is immense. But the companies winning aren\'t just wrapping APIs — they\'re rethinking products.',
      author: 'CB', authorName: 'Carlo Bianchi',
      date: 'May 22, 2025', readTime: '6 min read',
    },
  ];

  loadMoreBtn.addEventListener('click', () => {
    if (loadCount >= extraArticles.length) {
      loadMoreBtn.textContent = 'No more stories';
      loadMoreBtn.disabled = true;
      return;
    }

    const data    = extraArticles[loadCount];
    const article = createCard(data);
    articleGrid.appendChild(article);
    loadCount++;

    // Trigger animation
    requestAnimationFrame(() => {
      article.style.animation = 'fadeInUp 0.5s ease backwards';
    });

    if (loadCount >= extraArticles.length) {
      loadMoreBtn.textContent = 'You\'re all caught up!';
      loadMoreBtn.disabled = true;
      loadMoreBtn.style.opacity = '0.5';
    }
  });

  function createCard({ category, imgClass, title, excerpt, author, authorName, date, readTime }) {
    const article = document.createElement('article');
    article.className = 'card';
    article.dataset.category = category;

    const catLabel = category.charAt(0).toUpperCase() + category.slice(1);

    article.innerHTML = `
      <a href="#" class="card__img-link" tabindex="-1" aria-hidden="true">
        <div class="card__img ${imgClass}">
          <span class="card__category-badge">${catLabel}</span>
        </div>
      </a>
      <div class="card__body">
        <div class="card__meta">
          <span class="card__category">${catLabel}</span>
          <span class="card__read-time">${readTime}</span>
        </div>
        <h3 class="card__title"><a href="#">${title}</a></h3>
        <p class="card__excerpt">${excerpt}</p>
        <div class="card__footer">
          <div class="author author--sm">
            <div class="author__avatar">${author}</div>
            <span class="author__name">${authorName}</span>
          </div>
          <span class="card__date">${date}</span>
        </div>
      </div>
    `;
    return article;
  }

  /* ── 7. Newsletter Form ──────────────────────────────────── */
  const newsletterForm  = document.querySelector('.newsletter__form');
  const emailInput      = document.getElementById('email-input');

  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRx.test(email)) {
      emailInput.style.borderColor = '#ef4444';
      emailInput.style.boxShadow   = '0 0 0 3px rgba(239,68,68,0.18)';
      emailInput.focus();
      return;
    }

    // Success feedback
    emailInput.value        = '';
    emailInput.placeholder  = '✓ You\'re subscribed!';
    emailInput.classList.add('success');
    emailInput.style.borderColor = '';
    emailInput.style.boxShadow   = '';

    const submitBtn = newsletterForm.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Subscribed!';
    submitBtn.disabled    = true;

    setTimeout(() => {
      emailInput.placeholder = 'your@email.com';
      emailInput.classList.remove('success');
      submitBtn.textContent = 'Subscribe';
      submitBtn.disabled    = false;
    }, 4000);
  });

  /* ── 8. Intersection Observer — Card Reveal ─────────────── */
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    // Only apply to cards below the fold
    cards.forEach((card, i) => {
      if (i >= 3) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        revealObserver.observe(card);
      }
    });
  }

})();
