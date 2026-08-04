/* ============================================================
   MEME GENERATOR — app.js
   ============================================================ */

(() => {
  'use strict';

  const canvas      = document.getElementById('meme-canvas');
  const ctx         = canvas.getContext('2d');
  const placeholder = document.getElementById('canvas-placeholder');

  const fileInput   = document.getElementById('file-input');
  const uploadZone  = document.getElementById('upload-zone');
  const galleryEl   = document.getElementById('template-gallery');

  const topTextEl    = document.getElementById('top-text');
  const topSizeEl    = document.getElementById('top-size');
  const topSizeVal   = document.getElementById('top-size-val');
  const topColorEl   = document.getElementById('top-color');

  const bottomTextEl  = document.getElementById('bottom-text');
  const bottomSizeEl  = document.getElementById('bottom-size');
  const bottomSizeVal = document.getElementById('bottom-size-val');
  const bottomColorEl = document.getElementById('bottom-color');

  const downloadBtn = document.getElementById('download-btn');
  const resetBtn    = document.getElementById('reset-btn');

  const MAX_DIMENSION = 800;

  /** Currently loaded background: an HTMLImageElement, or null (no image yet) */
  let backgroundImage = null;

  /* ── 1. Procedurally-drawn starter templates ─────────────
     No external meme assets are bundled, so a handful of
     colorful canvas-generated backgrounds are offered as
     ready-to-use starting points alongside "upload your own". */
  const templates = [
    {
      name: 'Sunset',
      draw(c, w, h) {
        const g = c.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, '#ff9a56');
        g.addColorStop(1, '#ff6a88');
        c.fillStyle = g;
        c.fillRect(0, 0, w, h);
      },
    },
    {
      name: 'Ocean',
      draw(c, w, h) {
        const g = c.createLinearGradient(0, 0, w, h);
        g.addColorStop(0, '#2193b0');
        g.addColorStop(1, '#6dd5ed');
        c.fillStyle = g;
        c.fillRect(0, 0, w, h);
      },
    },
    {
      name: 'Night Sky',
      draw(c, w, h) {
        const g = c.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, '#0f2027');
        g.addColorStop(1, '#2c5364');
        c.fillStyle = g;
        c.fillRect(0, 0, w, h);
        c.fillStyle = 'rgba(255,255,255,0.8)';
        for (let i = 0; i < 40; i++) {
          const x = Math.random() * w;
          const y = Math.random() * h * 0.7;
          const r = Math.random() * 1.6 + 0.4;
          c.beginPath();
          c.arc(x, y, r, 0, Math.PI * 2);
          c.fill();
        }
      },
    },
    {
      name: 'Retro Grid',
      draw(c, w, h) {
        c.fillStyle = '#1a0033';
        c.fillRect(0, 0, w, h);
        c.strokeStyle = '#ff2e88';
        c.lineWidth = Math.max(1, w * 0.004);
        const step = w / 12;
        for (let x = 0; x <= w; x += step) {
          c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke();
        }
        for (let y = 0; y <= h; y += step) {
          c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke();
        }
      },
    },
    {
      name: 'Bold Yellow',
      draw(c, w, h) {
        c.fillStyle = '#ffd400';
        c.fillRect(0, 0, w, h);
        c.fillStyle = 'rgba(0,0,0,0.08)';
        c.fillRect(0, h * 0.55, w, h * 0.45);
      },
    },
    {
      name: 'Mint',
      draw(c, w, h) {
        const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
        g.addColorStop(0, '#a8ff78');
        g.addColorStop(1, '#78ffd6');
        c.fillStyle = g;
        c.fillRect(0, 0, w, h);
      },
    },
  ];

  /* Tracks which template's draw function is currently used as the
     canvas background, so redraw() can re-paint it before re-adding
     text on every keystroke / slider change. */
  let activeTemplateDraw = null;

  /* Render a small thumbnail + register click handler for each template */
  templates.forEach((tpl) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'template-btn';
    btn.setAttribute('role', 'listitem');
    btn.setAttribute('aria-label', `Use ${tpl.name} template`);

    const thumb = document.createElement('canvas');
    thumb.width = 120;
    thumb.height = 120;
    tpl.draw(thumb.getContext('2d'), 120, 120);

    const label = document.createElement('span');
    label.className = 'template-btn__label';
    label.textContent = tpl.name;

    btn.appendChild(thumb);
    btn.appendChild(label);
    galleryEl.appendChild(btn);

    btn.addEventListener('click', () => {
      setActiveTemplateButton(btn);
      backgroundImage = null;
      activeTemplateDraw = tpl.draw;
      canvas.width = 600;
      canvas.height = 600;
      onBackgroundReady();
    });
  });

  function setActiveTemplateButton(activeBtn) {
    galleryEl.querySelectorAll('.template-btn').forEach((b) => {
      b.classList.toggle('active', b === activeBtn);
    });
  }

  /* ── 2. Image upload (file picker + drag & drop) ─────────── */
  uploadZone.addEventListener('click', (e) => {
    // Avoid double-triggering when the inner <input> itself was clicked
    if (e.target !== fileInput) fileInput.click();
  });

  uploadZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files && fileInput.files[0];
    if (file) loadImageFile(file);
  });

  ['dragenter', 'dragover'].forEach((evt) => {
    uploadZone.addEventListener(evt, (e) => {
      e.preventDefault();
      uploadZone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach((evt) => {
    uploadZone.addEventListener(evt, (e) => {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
    });
  });

  uploadZone.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) loadImageFile(file);
  });

  function loadImageFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setActiveTemplateButton(null);
        backgroundImage = img;

        let w = img.naturalWidth;
        let h = img.naturalHeight;
        const scale = Math.min(1, MAX_DIMENSION / Math.max(w, h));
        w = Math.round(w * scale);
        h = Math.round(h * scale);

        canvas.width = w;
        canvas.height = h;
        onBackgroundReady();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  /* ── 3. Text rendering ────────────────────────────────────── */
  function wrapLines(text, maxWidth, fontSize) {
    ctx.font = `700 ${fontSize}px 'Anton', Impact, sans-serif`;
    const words = text.trim().split(/\s+/).filter(Boolean);
    const lines = [];
    let current = '';

    words.forEach((word) => {
      const attempt = current ? `${current} ${word}` : word;
      if (ctx.measureText(attempt).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = attempt;
      }
    });
    if (current) lines.push(current);
    return lines;
  }

  function drawCaption(text, fontSize, color, position) {
    if (!text.trim()) return;

    const padding   = canvas.width * 0.04;
    const maxWidth  = canvas.width - padding * 2;
    const lines     = wrapLines(text.toUpperCase(), maxWidth, fontSize);
    const lineHeight = fontSize * 1.15;

    ctx.font = `700 ${fontSize}px 'Anton', Impact, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(2, fontSize * 0.08);
    ctx.lineJoin = 'round';

    const x = canvas.width / 2;
    let y;
    if (position === 'top') {
      ctx.textBaseline = 'top';
      y = padding;
    } else {
      ctx.textBaseline = 'bottom';
      y = canvas.height - padding;
    }

    lines.forEach((line, i) => {
      const lineY = position === 'top'
        ? y + i * lineHeight
        : y - (lines.length - 1 - i) * lineHeight;
      ctx.strokeText(line, x, lineY);
      ctx.fillText(line, x, lineY);
    });
  }

  function redraw() {
    if (!backgroundImage && !activeTemplateDraw) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    } else {
      activeTemplateDraw(ctx, canvas.width, canvas.height);
    }

    drawCaption(topTextEl.value, Number(topSizeEl.value), topColorEl.value, 'top');
    drawCaption(bottomTextEl.value, Number(bottomSizeEl.value), bottomColorEl.value, 'bottom');
  }

  function onBackgroundReady() {
    placeholder.style.display = 'none';
    downloadBtn.disabled = false;
    redraw();
  }

  /* ── 4. Live control bindings ─────────────────────────────── */
  function bindLiveInput(input, output, suffix = 'px') {
    const update = () => {
      if (output) output.textContent = `${input.value}${suffix}`;
      redraw();
    };
    input.addEventListener('input', update);
    update();
  }

  [topTextEl, bottomTextEl, topColorEl, bottomColorEl].forEach((el) => {
    el.addEventListener('input', redraw);
  });
  bindLiveInput(topSizeEl, topSizeVal);
  bindLiveInput(bottomSizeEl, bottomSizeVal);

  /* ── 5. Download ───────────────────────────────────────────── */
  downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  /* ── 6. Reset ──────────────────────────────────────────────── */
  resetBtn.addEventListener('click', () => {
    backgroundImage = null;
    activeTemplateDraw = null;
    canvas.width = 600;
    canvas.height = 600;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fileInput.value = '';
    topTextEl.value = '';
    bottomTextEl.value = '';
    topSizeEl.value = 48;
    bottomSizeEl.value = 48;
    topColorEl.value = '#ffffff';
    bottomColorEl.value = '#ffffff';
    topSizeVal.textContent = '48px';
    bottomSizeVal.textContent = '48px';
    setActiveTemplateButton(null);
    placeholder.style.display = 'block';
    downloadBtn.disabled = true;
  });

})();
