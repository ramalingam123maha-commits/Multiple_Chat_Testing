/* ================================================================
   LUMINARY GALLERY — gallery.js
   ================================================================ */

(function () {
    'use strict';

    /* ──────────────────────────────────────────────────────────
       1. MASONRY ITEMS & LIGHTBOX DATA
    ─────────────────────────────────────────────────────────── */
    const grid        = document.getElementById('masonryGrid');
    const noResults   = document.getElementById('noResults');
    const items       = Array.from(document.querySelectorAll('.masonry-item'));

    /* Build a flat, indexed data array that mirrors the DOM order */
    const artworks = items.map((item, i) => ({
        index    : i,
        category : item.dataset.category,
        title    : item.dataset.title,
        artist   : item.dataset.artist,
        year     : item.dataset.year,
        medium   : item.dataset.medium,
        src      : item.querySelector('img').src,
        alt      : item.querySelector('img').alt,
        el       : item,
    }));

    /* ──────────────────────────────────────────────────────────
       2. CATEGORY FILTER
    ─────────────────────────────────────────────────────────── */
    const filterBtns   = document.querySelectorAll('.filter-btn');
    let   activeFilter = 'all';

    function applyFilter(filter) {
        activeFilter = filter;

        /* Update button state */
        filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        let visible = 0;

        items.forEach(item => {
            const match = filter === 'all' || item.dataset.category === filter;

            if (match) {
                item.classList.remove('hidden');
                item.style.animationDelay = (visible * 0.07) + 's';
                item.style.animation = 'none';
                /* Force reflow so animation restarts */
                void item.offsetWidth;
                item.style.animation = '';
                visible++;
            } else {
                item.classList.add('hidden');
            }
        });

        noResults.hidden = visible > 0;
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
    });

    /* ──────────────────────────────────────────────────────────
       3. LIGHTBOX
    ─────────────────────────────────────────────────────────── */
    const lightbox        = document.getElementById('lightbox');
    const lightboxOverlay = document.getElementById('lightboxOverlay');
    const lbImg           = document.getElementById('lbImg');
    const lbCategory      = document.getElementById('lbCategory');
    const lbTitle         = document.getElementById('lbTitle');
    const lbArtist        = document.getElementById('lbArtist');
    const lbYear          = document.getElementById('lbYear');
    const lbMedium        = document.getElementById('lbMedium');
    const lbClose         = document.getElementById('lbClose');
    const lbPrev          = document.getElementById('lbPrev');
    const lbNext          = document.getElementById('lbNext');

    let currentIndex      = -1;   /* index into *visible* artworks */

    /* Visible artworks (respects current filter) */
    function getVisible() {
        return artworks.filter(a => activeFilter === 'all' || a.category === activeFilter);
    }

    function openLightbox(artwork) {
        const visible   = getVisible();
        currentIndex    = visible.findIndex(a => a.index === artwork.index);

        populateLightbox(artwork);
        lightbox.hidden = false;
        lightbox.classList.add('open');
        lightboxOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        lbClose.focus();

        /* Prev / Next availability */
        updateNavBtns(visible);
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        lightboxOverlay.classList.remove('open');

        /* Wait for fade-out transition before hiding */
        setTimeout(() => {
            lightbox.hidden = true;
            document.body.style.overflow = '';
        }, 350);
    }

    function populateLightbox(artwork) {
        /* Swap image with a quick fade */
        lbImg.style.opacity = '0';
        lbImg.src            = artwork.src;
        lbImg.alt            = artwork.alt;
        lbImg.onload         = () => { lbImg.style.transition = 'opacity .35s'; lbImg.style.opacity = '1'; };

        lbCategory.textContent = capitalise(artwork.category);
        lbTitle.textContent    = artwork.title;
        lbArtist.textContent   = artwork.artist;
        lbYear.textContent     = artwork.year;
        lbMedium.textContent   = artwork.medium;
    }

    function navigate(dir) {
        const visible = getVisible();
        if (!visible.length) return;
        currentIndex  = (currentIndex + dir + visible.length) % visible.length;
        populateLightbox(visible[currentIndex]);
        updateNavBtns(visible);
    }

    function updateNavBtns(visible) {
        lbPrev.disabled = visible.length <= 1;
        lbNext.disabled = visible.length <= 1;
    }

    /* Open on zoom-button click */
    document.querySelectorAll('.overlay-zoom').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const item    = btn.closest('.masonry-item');
            const artwork = artworks.find(a => a.el === item);
            if (artwork) openLightbox(artwork);
        });
    });

    /* Also open when clicking anywhere on the image wrap */
    document.querySelectorAll('.art-img-wrap').forEach(wrap => {
        wrap.addEventListener('click', () => {
            const item    = wrap.closest('.masonry-item');
            const artwork = artworks.find(a => a.el === item);
            if (artwork) openLightbox(artwork);
        });
    });

    lbClose.addEventListener('click', closeLightbox);
    lightboxOverlay.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', () => navigate(-1));
    lbNext.addEventListener('click', () => navigate(1));

    /* Keyboard navigation */
    document.addEventListener('keydown', e => {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape')     closeLightbox();
        if (e.key === 'ArrowLeft')  navigate(-1);
        if (e.key === 'ArrowRight') navigate(1);
    });

    /* Touch / swipe support for lightbox */
    let touchStartX = 0;
    lightbox.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend',   e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50) navigate(dx < 0 ? 1 : -1);
    });

    /* ──────────────────────────────────────────────────────────
       4. ARTIST "View X" buttons → filter + scroll to gallery
    ─────────────────────────────────────────────────────────── */
    document.querySelectorAll('.artist-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            applyFilter(btn.dataset.filter);
            document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
        });
    });

    /* ──────────────────────────────────────────────────────────
       5. CONTACT FORM
    ─────────────────────────────────────────────────────────── */
    const contactForm  = document.getElementById('contactForm');
    const formSuccess  = document.getElementById('formSuccess');

    contactForm && contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        let valid = true;

        const fields = contactForm.querySelectorAll('[required]');
        fields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                valid = false;
            } else {
                field.classList.remove('error');
            }
        });

        if (!valid) return;

        /* Simulate async send */
        const submitBtn      = contactForm.querySelector('[type="submit"]');
        submitBtn.disabled   = true;
        submitBtn.textContent = 'Sending…';

        setTimeout(() => {
            contactForm.reset();
            formSuccess.hidden   = false;
            submitBtn.disabled   = false;
            submitBtn.textContent = 'Send Message';
            setTimeout(() => { formSuccess.hidden = true; }, 5000);
        }, 1200);
    });

    /* Remove error state on input */
    contactForm && contactForm.querySelectorAll('[required]').forEach(field => {
        field.addEventListener('input', () => field.classList.remove('error'));
    });

    /* ──────────────────────────────────────────────────────────
       6. ANIMATED STAT COUNTERS (IntersectionObserver)
    ─────────────────────────────────────────────────────────── */
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');

    function animateCounter(el) {
        const target   = parseInt(el.dataset.target, 10);
        const duration = 1600;
        const step     = 16;
        const steps    = duration / step;
        const inc      = target / steps;
        let   current  = 0;

        const timer = setInterval(() => {
            current += inc;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = Math.floor(current);
        }, step);
    }

    const counterObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.counted) {
                entry.target.dataset.counted = '1';
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));

    /* ──────────────────────────────────────────────────────────
       7. SCROLL-REVEAL (IntersectionObserver)
    ─────────────────────────────────────────────────────────── */
    const revealEls = document.querySelectorAll('.artist-card, .stat-item');

    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealEls.forEach(el => {
        el.style.animationPlayState = 'paused';
        revealObserver.observe(el);
    });

    /* ──────────────────────────────────────────────────────────
       8. NAVBAR MOBILE TOGGLE
    ─────────────────────────────────────────────────────────── */
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks  = document.querySelector('.nav-links');

    navToggle && navToggle.addEventListener('click', () => {
        const open = navLinks.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', open);
    });

    /* Close menu on link click */
    navLinks && navLinks.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => navLinks.classList.remove('open'));
    });

    /* ──────────────────────────────────────────────────────────
       9. NAVBAR SCROLL SHRINK
    ─────────────────────────────────────────────────────────── */
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        navbar.style.boxShadow = window.scrollY > 40
            ? '0 4px 30px rgba(0,0,0,.4)'
            : 'none';
    }, { passive: true });

    /* ──────────────────────────────────────────────────────────
       HELPERS
    ─────────────────────────────────────────────────────────── */
    function capitalise(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

})();
