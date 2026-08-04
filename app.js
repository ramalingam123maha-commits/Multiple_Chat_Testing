/* ═══════════════════════════════════════════
   BIRTHDAY REMIND — APP LOGIC
   ═══════════════════════════════════════════ */

'use strict';

// ─────────────────────────────────────────────
//  DATA LAYER
// ─────────────────────────────────────────────
const STORAGE_KEY = 'birthdayRemind_v1';

function loadFriends() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveFriends(friends) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(friends));
}

let friends = loadFriends();

// ─────────────────────────────────────────────
//  DATE UTILITIES
// ─────────────────────────────────────────────

/** How many days until the next occurrence of a (month, day) pair from today */
function daysUntilNextBirthday(month, day) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let next = new Date(today.getFullYear(), month - 1, day);
  if (next < today) {
    next = new Date(today.getFullYear() + 1, month - 1, day);
  }
  return Math.round((next - today) / 86400000);
}

/** Parse a "YYYY-MM-DD" string safely (avoids timezone shifts) */
function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return { year: y, month: m, day: d };
}

function formatDOB(str) {
  const { year, month, day } = parseDate(str);
  const months = ['Jan','Feb','Mar','Apr','May','Jun',
                  'Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[month - 1]} ${day}, ${year}`;
}

function calculateAge(dobStr) {
  const { year, month, day } = parseDate(dobStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dob   = new Date(year, month - 1, day);
  let age = today.getFullYear() - dob.getFullYear();
  const hadBirthday = today >= new Date(today.getFullYear(), month - 1, day);
  if (!hadBirthday) age--;
  return age;
}

function nextAgeOnBirthday(dobStr) {
  // How old they'll be turning on their next birthday
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const { year, month, day } = parseDate(dobStr);
  const dob = new Date(year, month - 1, day);
  let nextYear = today.getFullYear();
  const thisYearBD = new Date(nextYear, month - 1, day);
  if (thisYearBD < today) nextYear++;
  return nextYear - year;
}

/** Tier: today / week / month / far */
function getTier(daysLeft) {
  if (daysLeft === 0) return 'today';
  if (daysLeft <= 7)  return 'week';
  if (daysLeft <= 30) return 'month';
  return 'far';
}

// ─────────────────────────────────────────────
//  AVATAR COLOURS
// ─────────────────────────────────────────────
const AVATAR_GRADIENTS = [
  ['#ff6b9d','#ff9a3c'],
  ['#9775fa','#cc5de8'],
  ['#4dabf7','#339af0'],
  ['#51cf66','#20c997'],
  ['#fcc419','#ff922b'],
  ['#ff8787','#f03e3e'],
  ['#74c0fc','#a5d8ff'],
  ['#b2f2bb','#40c057'],
];

function avatarGradient(name) {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  const g = AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
  return `linear-gradient(135deg, ${g[0]}, ${g[1]})`;
}

function initials(name) {
  return name.trim().split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

// ─────────────────────────────────────────────
//  DOM REFS
// ─────────────────────────────────────────────
const addForm       = document.getElementById('addForm');
const nameInput     = document.getElementById('friendName');
const bdayInput     = document.getElementById('friendBirthday');
const noteInput     = document.getElementById('friendNote');
const nameError     = document.getElementById('nameError');
const dateError     = document.getElementById('dateError');

const birthdayList  = document.getElementById('birthdayList');
const emptyState    = document.getElementById('emptyState');
const searchBox     = document.getElementById('searchBox');
const filterSelect  = document.getElementById('filterSelect');

const statTotal     = document.getElementById('statTotal');
const statThisMonth = document.getElementById('statThisMonth');
const statNext7     = document.getElementById('statNext7');

const cardModal     = document.getElementById('cardModal');
const cardPreview   = document.getElementById('cardPreview');
const cardName      = document.getElementById('cardName');
const cardMessage   = document.getElementById('cardMessage');
const cardCustomMsg = document.getElementById('cardCustomMsg');
const cardMsgLen    = document.getElementById('cardMsgLen');
const cardRecipientLabel = document.getElementById('cardRecipientLabel');
const closeModalBtn  = document.getElementById('closeModal');
const closeModal2Btn = document.getElementById('closeModal2');
const sendCardBtn    = document.getElementById('sendCardBtn');
const themePicker    = document.getElementById('themePicker');

const deleteModal     = document.getElementById('deleteModal');
const deleteTargetName = document.getElementById('deleteTargetName');
const cancelDeleteBtn  = document.getElementById('cancelDelete');
const confirmDeleteBtn = document.getElementById('confirmDelete');

const toast = document.getElementById('toast');

// ─────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────
let pendingDeleteId = null;
let currentCardFriend = null;
let currentTheme = 'pink';

// ─────────────────────────────────────────────
//  RENDER
// ─────────────────────────────────────────────
function render() {
  const query    = searchBox.value.trim().toLowerCase();
  const maxDays  = filterSelect.value === 'all' ? Infinity : Number(filterSelect.value);

  // Enrich each friend with computed fields
  const enriched = friends.map(f => {
    const { month, day } = parseDate(f.birthday);
    const daysLeft = daysUntilNextBirthday(month, day);
    return { ...f, daysLeft, tier: getTier(daysLeft) };
  });

  // Sort ascending by daysLeft
  enriched.sort((a, b) => a.daysLeft - b.daysLeft);

  // Apply filters
  const filtered = enriched.filter(f => {
    const matchesSearch = !query || f.name.toLowerCase().includes(query);
    const withinWindow  = f.daysLeft <= maxDays;
    return matchesSearch && withinWindow;
  });

  birthdayList.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
    filtered.forEach(f => birthdayList.appendChild(createCard(f)));
  }

  updateStats(enriched);
}

function createCard(f) {
  const li = document.createElement('li');
  li.className = `bday-card tier-${f.tier}`;
  li.dataset.id = f.id;

  const turningAge = nextAgeOnBirthday(f.birthday);
  const ageLabel   = turningAge > 0 ? `Turning ${turningAge}` : '';

  const tagHtml = f.tier === 'today'
    ? '<span class="bday-tag">🎂 Today!</span>'
    : '';

  const countdownLabel = f.daysLeft === 0
    ? '🎉'
    : f.daysLeft === 1
    ? '1<span class="countdown-unit">day</span>'
    : `${f.daysLeft}<span class="countdown-unit">days</span>`;

  li.innerHTML = `
    <div class="bday-avatar" style="background:${avatarGradient(f.name)}">${initials(f.name)}</div>
    <div class="bday-info">
      <div class="bday-name">${escapeHtml(f.name)}</div>
      <div class="bday-date-row">
        ${escapeHtml(formatDOB(f.birthday))}
        ${ageLabel ? `<span class="age-badge">${ageLabel}</span>` : ''}
        ${tagHtml}
      </div>
      ${f.note ? `<div class="bday-note">"${escapeHtml(f.note)}"</div>` : ''}
    </div>
    <div class="bday-countdown" title="${f.daysLeft === 0 ? 'Today!' : `${f.daysLeft} days away`}">
      <span class="countdown-num">${countdownLabel}</span>
    </div>
    <div class="bday-actions">
      <button class="action-btn send-card-btn" data-id="${f.id}" title="Send greeting card" aria-label="Send card to ${escapeHtml(f.name)}">💌</button>
      <button class="action-btn delete-btn" data-id="${f.id}" title="Remove" aria-label="Remove ${escapeHtml(f.name)}">🗑️</button>
    </div>
  `;

  return li;
}

function updateStats(enriched) {
  statTotal.textContent = friends.length;

  const nowMonth = new Date().getMonth() + 1;
  const thisMonthCount = enriched.filter(f => parseDate(f.birthday).month === nowMonth).length;
  statThisMonth.textContent = thisMonthCount;

  const next7Count = enriched.filter(f => f.daysLeft <= 7).length;
  statNext7.textContent = next7Count;
}

// ─────────────────────────────────────────────
//  ADD FORM
// ─────────────────────────────────────────────
addForm.addEventListener('submit', e => {
  e.preventDefault();
  let valid = true;

  const name = nameInput.value.trim();
  const bday = bdayInput.value;
  const note = noteInput.value.trim();

  nameError.textContent = '';
  dateError.textContent = '';

  if (!name) {
    nameError.textContent = 'Please enter a name.';
    valid = false;
  }

  if (!bday) {
    dateError.textContent = 'Please pick a birthday.';
    valid = false;
  }

  if (!valid) return;

  // Check duplicate
  if (friends.some(f => f.name.toLowerCase() === name.toLowerCase() && f.birthday === bday)) {
    showToast(`${name} is already in your list!`);
    return;
  }

  const friend = {
    id: crypto.randomUUID(),
    name,
    birthday: bday,
    note,
    addedAt: Date.now(),
  };

  friends.push(friend);
  saveFriends(friends);
  render();

  addForm.reset();
  showToast(`🎉 ${name} added!`);
});

// ─────────────────────────────────────────────
//  LIST DELEGATION (send card / delete)
// ─────────────────────────────────────────────
birthdayList.addEventListener('click', e => {
  const sendBtn  = e.target.closest('.send-card-btn');
  const delBtn   = e.target.closest('.delete-btn');

  if (sendBtn) {
    const friend = friends.find(f => f.id === sendBtn.dataset.id);
    if (friend) openCardModal(friend);
  }

  if (delBtn) {
    const friend = friends.find(f => f.id === delBtn.dataset.id);
    if (friend) openDeleteModal(friend);
  }
});

// ─────────────────────────────────────────────
//  SEARCH & FILTER
// ─────────────────────────────────────────────
searchBox.addEventListener('input', render);
filterSelect.addEventListener('change', render);

// ─────────────────────────────────────────────
//  DELETE MODAL
// ─────────────────────────────────────────────
function openDeleteModal(friend) {
  pendingDeleteId = friend.id;
  deleteTargetName.textContent = friend.name;
  deleteModal.hidden = false;
}

cancelDeleteBtn.addEventListener('click', () => {
  deleteModal.hidden = true;
  pendingDeleteId = null;
});

confirmDeleteBtn.addEventListener('click', () => {
  if (!pendingDeleteId) return;
  const name = friends.find(f => f.id === pendingDeleteId)?.name || 'Friend';
  friends = friends.filter(f => f.id !== pendingDeleteId);
  saveFriends(friends);
  render();
  deleteModal.hidden = true;
  pendingDeleteId = null;
  showToast(`Removed ${name}`);
});

// Close modals on backdrop click
[cardModal, deleteModal].forEach(modal => {
  modal.addEventListener('click', e => {
    if (e.target === modal) {
      modal.hidden = true;
    }
  });
});

// ─────────────────────────────────────────────
//  GREETING CARD MODAL
// ─────────────────────────────────────────────
const DEFAULT_MESSAGES = {
  pink:   "Wishing you a wonderful birthday filled with joy, laughter and all the best! 🎂",
  blue:   "May your special day be as amazing as you are! Happy Birthday! 🎈",
  gold:   "Sending golden wishes your way — have a truly spectacular birthday! ✨",
  purple: "You deserve all the magic today! Wishing you a mystical birthday! 💜",
  green:  "May this birthday bring you fresh beginnings and endless happiness! 🍀",
};

function openCardModal(friend) {
  currentCardFriend = friend;
  currentTheme = 'pink';

  cardRecipientLabel.textContent = friend.name;
  cardName.textContent = friend.name + '!';
  cardCustomMsg.value = '';
  cardMsgLen.textContent = '0';
  cardMessage.textContent = DEFAULT_MESSAGES.pink;

  applyTheme('pink');
  spawnConfetti();
  cardModal.hidden = false;
}

function applyTheme(theme) {
  currentTheme = theme;
  cardPreview.setAttribute('data-card-theme', theme);

  // update active button
  themePicker.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });

  // update default message only if user hasn't typed
  if (!cardCustomMsg.value.trim()) {
    cardMessage.textContent = DEFAULT_MESSAGES[theme];
  }
}

themePicker.addEventListener('click', e => {
  const btn = e.target.closest('.theme-btn');
  if (btn) applyTheme(btn.dataset.theme);
});

cardCustomMsg.addEventListener('input', () => {
  const len = cardCustomMsg.value.length;
  cardMsgLen.textContent = len;
  cardMessage.textContent = cardCustomMsg.value.trim()
    ? cardCustomMsg.value
    : DEFAULT_MESSAGES[currentTheme];
});

function spawnConfetti() {
  const area = document.getElementById('confettiArea');
  area.innerHTML = '';
  const colors = ['#ff6b9d','#fcc419','#9775fa','#51cf66','#4dabf7','#ff922b','#f03e3e','#fff'];
  for (let i = 0; i < 28; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${-10 - Math.random() * 20}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${6 + Math.random() * 7}px;
      height: ${6 + Math.random() * 7}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation-duration: ${2.5 + Math.random() * 2.5}s;
      animation-delay: ${Math.random() * 2}s;
    `;
    area.appendChild(piece);
  }
}

closeModalBtn.addEventListener('click',  () => { cardModal.hidden = true; });
closeModal2Btn.addEventListener('click', () => { cardModal.hidden = true; });

sendCardBtn.addEventListener('click', () => {
  if (!currentCardFriend) return;

  // Animate button
  sendCardBtn.disabled = true;
  sendCardBtn.innerHTML = '<span class="btn-icon">✅</span> Card Sent!';

  setTimeout(() => {
    cardModal.hidden = true;
    sendCardBtn.disabled = false;
    sendCardBtn.innerHTML = '<span class="btn-icon">💌</span> Send Card';
    showToast(`💌 Card sent to ${currentCardFriend.name}!`);
  }, 1200);
});

// ─────────────────────────────────────────────
//  TOAST
// ─────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ─────────────────────────────────────────────
//  XSS PROTECTION
// ─────────────────────────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ─────────────────────────────────────────────
//  KEYBOARD: Escape closes modals
// ─────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!cardModal.hidden)   cardModal.hidden   = true;
    if (!deleteModal.hidden) deleteModal.hidden = true;
  }
});

// ─────────────────────────────────────────────
//  SET MAX DATE (today) for birthday picker
// ─────────────────────────────────────────────
const today = new Date();
const maxDate = today.toISOString().split('T')[0];
bdayInput.max = maxDate;

// ─────────────────────────────────────────────
//  SEED DEMO DATA (first visit)
// ─────────────────────────────────────────────
function seedDemoData() {
  if (friends.length > 0) return;

  const now   = new Date();
  const year  = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day   = now.getDate();

  // birthday today
  const todayStr = `${year - 28}-${month}-${String(day).padStart(2, '0')}`;

  // birthday in 5 days
  const d5 = new Date(now); d5.setDate(day + 5);
  const in5 = `${year - 31}-${String(d5.getMonth() + 1).padStart(2, '0')}-${String(d5.getDate()).padStart(2, '0')}`;

  // birthday in 20 days
  const d20 = new Date(now); d20.setDate(day + 20);
  const in20 = `${year - 25}-${String(d20.getMonth() + 1).padStart(2, '0')}-${String(d20.getDate()).padStart(2, '0')}`;

  // birthday in 45 days
  const d45 = new Date(now); d45.setDate(day + 45);
  const in45 = `${year - 22}-${String(d45.getMonth() + 1).padStart(2, '0')}-${String(d45.getDate()).padStart(2, '0')}`;

  friends = [
    { id: crypto.randomUUID(), name: 'Alex Rivera',   birthday: todayStr, note: 'Loves hiking & espresso ☕',  addedAt: Date.now() },
    { id: crypto.randomUUID(), name: 'Jamie Chen',    birthday: in5,      note: 'Big Star Wars fan 🚀',        addedAt: Date.now() },
    { id: crypto.randomUUID(), name: 'Morgan Blake',  birthday: in20,     note: 'Baker extraordinaire 🧁',     addedAt: Date.now() },
    { id: crypto.randomUUID(), name: 'Sam Torres',    birthday: in45,     note: '',                            addedAt: Date.now() },
  ];
  saveFriends(friends);
}

// ─────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────
seedDemoData();
render();
