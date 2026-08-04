/* ============================================================
   Secure Password Generator — app.js
   Uses crypto.getRandomValues() for cryptographic randomness
   ============================================================ */

'use strict';

// ─── Character Sets ───────────────────────────────────────────
const CHARSET = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers:   '0123456789',
  symbols:   '!@#$%^&*()-_=+[]{}|;:,.<>?/~`',
  ambiguous: /[0Ol1I]/g,
};

// ─── State ────────────────────────────────────────────────────
let currentPassword = '';
let history = JSON.parse(localStorage.getItem('pwgen_history') || '[]');

// ─── DOM Refs ─────────────────────────────────────────────────
const $ = id => document.getElementById(id);

const passwordText    = $('passwordText');
const strengthBar     = $('strengthBar');
const strengthText    = $('strengthText');
const lengthSlider    = $('lengthSlider');
const lengthNumber    = $('lengthNumber');
const useUppercase    = $('useUppercase');
const useLowercase    = $('useLowercase');
const useNumbers      = $('useNumbers');
const useSymbols      = $('useSymbols');
const excludeAmbig    = $('excludeAmbiguous');
const noRepeat        = $('noRepeat');
const generateBtn     = $('generateBtn');
const refreshBtn      = $('refreshBtn');
const copyBtn         = $('copyBtn');
const iconCopy        = copyBtn.querySelector('.icon-copy');
const iconCheck       = copyBtn.querySelector('.icon-check');
const copyLabel       = copyBtn.querySelector('.copy-label');
const clearHistoryBtn = $('clearHistoryBtn');
const historyList     = $('historyList');
const historyEmpty    = $('historyEmpty');

// Toggle cards
const toggleCards = {
  uppercase: $('toggleUppercase'),
  lowercase: $('toggleLowercase'),
  numbers:   $('toggleNumbers'),
  symbols:   $('toggleSymbols'),
};

// ─── Cryptographic Random Integer ─────────────────────────────
function cryptoRandInt(max) {
  const arr = new Uint32Array(1);
  // Rejection sampling to avoid modulo bias
  const limit = Math.floor(0xFFFFFFFF / max) * max;
  let v;
  do {
    crypto.getRandomValues(arr);
    v = arr[0];
  } while (v >= limit);
  return v % max;
}

// ─── Password Generation ──────────────────────────────────────
function generatePassword() {
  const length       = clampLength(parseInt(lengthNumber.value, 10));
  const incUpper     = useUppercase.checked;
  const incLower     = useLowercase.checked;
  const incNums      = useNumbers.checked;
  const incSymbols   = useSymbols.checked;
  const noAmbiguous  = excludeAmbig.checked;
  const noRepeats    = noRepeat.checked;

  // Guard: need at least one charset
  if (!incUpper && !incLower && !incNums && !incSymbols) {
    shakeCard();
    return null;
  }

  // Build pool
  let pool = '';
  if (incUpper)   pool += CHARSET.uppercase;
  if (incLower)   pool += CHARSET.lowercase;
  if (incNums)    pool += CHARSET.numbers;
  if (incSymbols) pool += CHARSET.symbols;

  if (noAmbiguous) {
    pool = pool.replace(CHARSET.ambiguous, '');
  }

  // Guard: pool too small for noRepeat
  if (noRepeats && pool.length < length) {
    shakeCard();
    return null;
  }

  // Guarantee at least one char from each selected set
  const guaranteed = [];
  const subsets = [];
  if (incUpper)   subsets.push(filterPool(CHARSET.uppercase, noAmbiguous));
  if (incLower)   subsets.push(filterPool(CHARSET.lowercase, noAmbiguous));
  if (incNums)    subsets.push(filterPool(CHARSET.numbers,   noAmbiguous));
  if (incSymbols) subsets.push(filterPool(CHARSET.symbols,   false));

  const usedChars = new Set();

  for (const subset of subsets) {
    if (!subset.length) continue;
    let c;
    let attempts = 0;
    do {
      c = subset[cryptoRandInt(subset.length)];
      attempts++;
    } while (noRepeats && usedChars.has(c) && attempts < 1000);
    guaranteed.push(c);
    usedChars.add(c);
  }

  // Fill remaining
  const remaining = length - guaranteed.length;
  const poolArr = pool.split('');
  const extra = [];
  for (let i = 0; i < remaining; i++) {
    let c;
    let attempts = 0;
    do {
      c = poolArr[cryptoRandInt(poolArr.length)];
      attempts++;
    } while (noRepeats && usedChars.has(c) && attempts < 1000);
    extra.push(c);
    usedChars.add(c);
  }

  // Merge and shuffle with Fisher-Yates
  const all = [...guaranteed, ...extra];
  for (let i = all.length - 1; i > 0; i--) {
    const j = cryptoRandInt(i + 1);
    [all[i], all[j]] = [all[j], all[i]];
  }

  return all.join('');
}

function filterPool(str, removeAmbig) {
  return removeAmbig ? str.replace(CHARSET.ambiguous, '').split('') : str.split('');
}

function clampLength(v) {
  if (isNaN(v) || v < 4) return 4;
  if (v > 128) return 128;
  return v;
}

// ─── Strength Calculation ─────────────────────────────────────
function calcStrength(pw) {
  if (!pw || pw.length === 0) return { score: 0, label: '—', cls: '' };

  let score = 0;

  // Length scoring
  const len = pw.length;
  if (len >= 6)   score += 1;
  if (len >= 10)  score += 1;
  if (len >= 16)  score += 1;
  if (len >= 20)  score += 1;
  if (len >= 32)  score += 1;

  // Complexity
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[a-z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 2;

  // Variety bonus: unique chars ratio
  const unique = new Set(pw).size;
  if (unique / len > 0.7) score += 1;
  if (unique / len > 0.9) score += 1;

  // Penalize very short
  if (len < 6)  score = Math.min(score, 2);
  if (len < 10) score = Math.min(score, 6);

  const normalized = Math.min(score, 13);

  if (normalized <= 2)  return { score: 1, label: 'Very Weak',   cls: 's1' };
  if (normalized <= 5)  return { score: 2, label: 'Weak',        cls: 's2' };
  if (normalized <= 7)  return { score: 3, label: 'Fair',        cls: 's3' };
  if (normalized <= 9)  return { score: 4, label: 'Strong',      cls: 's4' };
  return                       { score: 5, label: 'Very Strong', cls: 's5' };
}

function updateStrength(pw) {
  const { label, cls } = calcStrength(pw);

  strengthBar.className = 'strength-bar-fill' + (cls ? ' ' + cls : '');
  strengthText.className = 'strength-text' + (cls ? ' ' + cls : '');
  strengthText.textContent = label;

  if (!cls) {
    strengthBar.style.width = '0%';
  }
}

// ─── UI Helpers ───────────────────────────────────────────────
function displayPassword(pw) {
  if (!pw) {
    passwordText.textContent = 'Click Generate';
    passwordText.classList.add('placeholder');
    return;
  }
  passwordText.textContent = pw;
  passwordText.classList.remove('placeholder');

  // Highlight animation
  passwordText.style.transition = 'none';
  passwordText.style.opacity = '0.3';
  requestAnimationFrame(() => {
    passwordText.style.transition = 'opacity 0.3s ease';
    passwordText.style.opacity = '1';
  });
}

function setSliderBackground(slider) {
  const min = Number(slider.min);
  const max = Number(slider.max);
  const val = Number(slider.value);
  const pct = ((val - min) / (max - min)) * 100;
  slider.style.background = `linear-gradient(to right, var(--accent) ${pct}%, var(--bg-input) ${pct}%)`;
}

function shakeCard() {
  const card = document.querySelector('.card');
  card.style.animation = 'none';
  card.offsetHeight; // reflow
  card.style.animation = 'shake 0.4s ease';
}

// ─── Copy to Clipboard ────────────────────────────────────────
let copyTimeout;

async function copyToClipboard(text) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    showCopied();
  } catch {
    // Fallback for older browsers / insecure contexts
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showCopied(); } catch {}
    document.body.removeChild(ta);
  }
}

function showCopied() {
  clearTimeout(copyTimeout);
  copyBtn.classList.add('copied');
  iconCopy.classList.add('hidden');
  iconCheck.classList.remove('hidden');
  copyLabel.textContent = 'Copied!';
  copyTimeout = setTimeout(() => {
    copyBtn.classList.remove('copied');
    iconCopy.classList.remove('hidden');
    iconCheck.classList.add('hidden');
    copyLabel.textContent = 'Copy';
  }, 2000);
}

// ─── History ──────────────────────────────────────────────────
const MAX_HISTORY = 20;

function addToHistory(pw) {
  if (!pw) return;
  const { score, label, cls } = calcStrength(pw);
  const entry = {
    pw,
    len: pw.length,
    strengthCls: cls,
    strengthLabel: label,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  // Avoid duplicates at the top
  if (history.length && history[0].pw === pw) return;
  history.unshift(entry);
  if (history.length > MAX_HISTORY) history.pop();
  saveHistory();
  renderHistory();
}

function saveHistory() {
  localStorage.setItem('pwgen_history', JSON.stringify(history));
}

function renderHistory() {
  // Remove all existing items (keep historyEmpty)
  const items = historyList.querySelectorAll('.history-item');
  items.forEach(el => el.remove());

  if (history.length === 0) {
    historyEmpty.style.display = 'flex';
    return;
  }

  historyEmpty.style.display = 'none';

  history.forEach((entry, idx) => {
    const row = document.createElement('div');
    row.className = 'history-item';

    row.innerHTML = `
      <span class="history-strength-dot ${entry.strengthCls}" title="${entry.strengthLabel}"></span>
      <span class="history-pw" title="${escapeHtml(entry.pw)}">${escapeHtml(entry.pw)}</span>
      <div class="history-meta">
        <span class="history-len">${entry.len}</span>
        <span class="history-time">${entry.time}</span>
        <button class="history-copy-btn" data-idx="${idx}">Copy</button>
      </div>
    `;

    historyList.appendChild(row);
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Toggle Cards Sync ────────────────────────────────────────
function syncToggleCards() {
  Object.entries(toggleCards).forEach(([key, card]) => {
    const cb = document.getElementById('use' + key.charAt(0).toUpperCase() + key.slice(1));
    if (cb.checked) card.classList.add('active');
    else card.classList.remove('active');
  });
}

// ─── Main Generate Flow ───────────────────────────────────────
function doGenerate() {
  const pw = generatePassword();
  if (!pw) return;
  currentPassword = pw;
  displayPassword(pw);
  updateStrength(pw);
  addToHistory(pw);
}

// ─── Event Listeners ──────────────────────────────────────────

// Generate button
generateBtn.addEventListener('click', doGenerate);
refreshBtn.addEventListener('click', doGenerate);

// Copy button
copyBtn.addEventListener('click', () => copyToClipboard(currentPassword));

// Length slider ↔ number input sync
lengthSlider.addEventListener('input', () => {
  lengthNumber.value = lengthSlider.value;
  setSliderBackground(lengthSlider);
});

lengthNumber.addEventListener('input', () => {
  let val = parseInt(lengthNumber.value, 10);
  if (isNaN(val)) return;
  val = clampLength(val);
  lengthSlider.value = val;
  setSliderBackground(lengthSlider);
});

lengthNumber.addEventListener('blur', () => {
  let val = parseInt(lengthNumber.value, 10);
  val = clampLength(isNaN(val) ? 16 : val);
  lengthNumber.value = val;
  lengthSlider.value = val;
  setSliderBackground(lengthSlider);
});

// Keyboard shortcut: Enter on length number auto-generates
lengthNumber.addEventListener('keydown', e => {
  if (e.key === 'Enter') doGenerate();
});

// Toggle checkboxes → sync card state
['useUppercase', 'useLowercase', 'useNumbers', 'useSymbols'].forEach(id => {
  $(id).addEventListener('change', syncToggleCards);
});

// Clicking entire toggle card toggles checkbox
Object.entries(toggleCards).forEach(([key, card]) => {
  const cbId = 'use' + key.charAt(0).toUpperCase() + key.slice(1);
  card.addEventListener('click', e => {
    if (e.target.closest('.switch')) return; // let the switch handle it
    const cb = $(cbId);
    cb.checked = !cb.checked;
    syncToggleCards();
  });
});

// History copy buttons (event delegation)
historyList.addEventListener('click', e => {
  const btn = e.target.closest('.history-copy-btn');
  if (!btn) return;
  const idx = parseInt(btn.dataset.idx, 10);
  if (!isNaN(idx) && history[idx]) {
    copyToClipboard(history[idx].pw);
    btn.textContent = '✓';
    setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
  }
});

// Clear history
clearHistoryBtn.addEventListener('click', () => {
  history = [];
  saveHistory();
  renderHistory();
});

// Keyboard shortcut: G to generate, C to copy
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (e.key.toLowerCase() === 'g') doGenerate();
  if (e.key.toLowerCase() === 'c') copyToClipboard(currentPassword);
});

// ─── Shake Animation CSS ──────────────────────────────────────
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    15%      { transform: translateX(-6px); }
    35%      { transform: translateX(6px); }
    55%      { transform: translateX(-4px); }
    75%      { transform: translateX(4px); }
    90%      { transform: translateX(-2px); }
  }
`;
document.head.appendChild(shakeStyle);

// ─── Init ─────────────────────────────────────────────────────
function init() {
  // Mark password text as placeholder
  passwordText.classList.add('placeholder');
  // Set initial slider background
  setSliderBackground(lengthSlider);
  // Sync toggle card states
  syncToggleCards();
  // Render existing history from localStorage
  renderHistory();
  // Auto-generate on load
  doGenerate();
}

init();
