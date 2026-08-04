/* ============================================================
   CHIRP — app.js
   ============================================================ */

'use strict';

// ── Deterministic avatar generator ──────────────────────────
function makeAvatar(seed, size = 42) {
  const colors = ['#1d9bf0','#9b59b6','#e74c3c','#2ecc71','#f39c12','#e91e63','#00bcd4','#ff5722'];
  const bg = colors[Math.abs(hashCode(seed)) % colors.length];
  const initials = seed.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${size/2}" fill="${bg}"/>
    <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="#fff" font-family="-apple-system,sans-serif" font-weight="700" font-size="${size*0.38}">${initials}</text>
  </svg>`;
  return 'data:image/svg+xml;base64,' + btoa(svg);
}
function hashCode(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

// ── Relative time ────────────────────────────────────────────
function relativeTime(ts) {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s`;
  if (diff < 3600) return `${Math.floor(diff/60)}m`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h`;
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Current user ─────────────────────────────────────────────
let currentUser = JSON.parse(localStorage.getItem('chirp-user') || 'null') || {
  name: 'Alex Morgan',
  handle: 'alexmorgan',
  bio: 'Building things on the internet ✨',
};

// ── All hashtags ─────────────────────────────────────────────
const ALL_HASHTAGS = [
  { tag: '#WebDev', count: 182400, category: 'Technology' },
  { tag: '#JavaScript', count: 97800, category: 'Technology' },
  { tag: '#OpenSource', count: 75300, category: 'Technology' },
  { tag: '#AI', count: 214600, category: 'Technology' },
  { tag: '#Design', count: 63200, category: 'Creative' },
  { tag: '#TypeScript', count: 48100, category: 'Technology' },
  { tag: '#CSS', count: 39500, category: 'Technology' },
  { tag: '#ReactJS', count: 55700, category: 'Technology' },
  { tag: '#DailyChirp', count: 29100, category: 'Trending' },
  { tag: '#Photography', count: 87600, category: 'Creative' },
  { tag: '#ClimateAction', count: 103000, category: 'World' },
  { tag: '#Gaming', count: 145000, category: 'Entertainment' },
  { tag: '#Music', count: 162000, category: 'Entertainment' },
  { tag: '#Startup', count: 41200, category: 'Business' },
  { tag: '#DevLife', count: 33400, category: 'Technology' },
];

// ── Followed hashtags ────────────────────────────────────────
let followedTags = new Set(JSON.parse(localStorage.getItem('chirp-tags') || '[]'));

// ── Followed users ───────────────────────────────────────────
let followedUsers = new Set(JSON.parse(localStorage.getItem('chirp-followed') || '[]'));

// ── Seed posts ───────────────────────────────────────────────
const seedPosts = [
  {
    id: 'p1', author: 'Sam Rivera', handle: 'samrivera',
    text: 'Just shipped a new feature in #ReactJS with zero bugs on the first deploy. Is this real life? 🎉 #WebDev #JavaScript',
    ts: Date.now() - 3*60000, likes: 42, retweets: 11, replies: 7, liked: false, retweeted: false, bookmarked: false
  },
  {
    id: 'p2', author: 'Priya Nair', handle: 'priyanair',
    text: 'The future of #AI is not about replacing humans — it\'s about amplifying what humans are capable of. Let\'s build responsibly. 🤖',
    ts: Date.now() - 18*60000, likes: 189, retweets: 54, replies: 23, liked: false, retweeted: false, bookmarked: false
  },
  {
    id: 'p3', author: 'Jordan Lee', handle: 'jordanlee',
    text: 'Hot take: #TypeScript saves more time than it costs. Every. Single. Time. #WebDev #DevLife',
    ts: Date.now() - 45*60000, likes: 217, retweets: 88, replies: 41, liked: false, retweeted: false, bookmarked: false
  },
  {
    id: 'p4', author: 'Maya Chen', handle: 'mayachen',
    text: 'Released my #OpenSource portfolio template today 🎨 Built with pure #CSS Grid and minimal JavaScript. Link in bio! #Design #WebDev',
    ts: Date.now() - 2*3600000, likes: 134, retweets: 67, replies: 19, liked: false, retweeted: false, bookmarked: false
  },
  {
    id: 'p5', author: 'Luca Bianchi', handle: 'lucabianchi',
    text: 'unpopular opinion: dark mode is overrated. light mode with good typography slaps harder 👀 #Design',
    ts: Date.now() - 3*3600000, likes: 78, retweets: 24, replies: 63, liked: false, retweeted: false, bookmarked: false
  },
  {
    id: 'p6', author: 'Aria Kim', handle: 'ariakim',
    text: 'Reminder: 10 minutes of real rest > 2 hours of half-productive coding. Burnout is real. Take care of yourselves 💙 #DevLife',
    ts: Date.now() - 5*3600000, likes: 502, retweets: 178, replies: 34, liked: false, retweeted: false, bookmarked: false
  },
  {
    id: 'p7', author: 'Ben Okafor', handle: 'benokafor',
    text: 'Just completed a 30-day #JavaScript challenge! Learned so much about closures, async/await, and the event loop. Thread below 🧵',
    ts: Date.now() - 8*3600000, likes: 93, retweets: 31, replies: 12, liked: false, retweeted: false, bookmarked: false
  },
  {
    id: 'p8', author: 'Sofia Torres', handle: 'sofiatorres',
    text: 'The #ClimateAction movement needs more engineers. Code can literally help save the planet. What are you building? 🌍',
    ts: Date.now() - 12*3600000, likes: 261, retweets: 102, replies: 47, liked: false, retweeted: false, bookmarked: false
  },
  {
    id: 'p9', author: 'Dev Patel', handle: 'devpatel',
    text: '#Gaming + #AI = my weekend rabbit hole. Training a tiny neural net to play Snake. Results are chaotic and I love it.',
    ts: Date.now() - 18*3600000, likes: 45, retweets: 9, replies: 8, liked: false, retweeted: false, bookmarked: false
  },
  {
    id: 'p10', author: 'Nora Walsh', handle: 'norawalsh',
    text: 'Working on a #Startup is 20% coding, 80% convincing yourself the idea still makes sense at 2am. #DailyChirp',
    ts: Date.now() - 24*3600000, likes: 399, retweets: 123, replies: 56, liked: false, retweeted: false, bookmarked: false
  }
];

// ── App state ─────────────────────────────────────────────────
let posts = JSON.parse(localStorage.getItem('chirp-posts') || 'null') || seedPosts;
let notifications = JSON.parse(localStorage.getItem('chirp-notifs') || 'null') || buildDefaultNotifs();
let activeView = 'home';
let activeTab = 'for-you';
let activeProfileTab = 'posts';
let toastTimer = null;

function buildDefaultNotifs() {
  return [
    { id: 'n1', type: 'like', user: 'Sam Rivera', text: 'liked your post', ts: Date.now()-8*60000, read: false },
    { id: 'n2', type: 'retweet', user: 'Priya Nair', text: 'rechirped your post', ts: Date.now()-32*60000, read: false },
    { id: 'n3', type: 'follow', user: 'Jordan Lee', text: 'started following you', ts: Date.now()-2*3600000, read: false },
    { id: 'n4', type: 'mention', user: 'Maya Chen', text: 'mentioned you in a post', ts: Date.now()-5*3600000, read: true },
    { id: 'n5', type: 'like', user: 'Aria Kim', text: 'liked your post', ts: Date.now()-8*3600000, read: true },
  ];
}

function persist() {
  localStorage.setItem('chirp-posts', JSON.stringify(posts));
  localStorage.setItem('chirp-tags', JSON.stringify([...followedTags]));
  localStorage.setItem('chirp-followed', JSON.stringify([...followedUsers]));
  localStorage.setItem('chirp-notifs', JSON.stringify(notifications));
  localStorage.setItem('chirp-user', JSON.stringify(currentUser));
}

// ── Suggested users ───────────────────────────────────────────
const suggestedUsers = [
  { name: 'Sam Rivera', handle: 'samrivera' },
  { name: 'Priya Nair', handle: 'priyanair' },
  { name: 'Jordan Lee', handle: 'jordanlee' },
  { name: 'Maya Chen', handle: 'mayachen' },
];

// ─────────────────────────────────────────────────────────────
// DOM REFS
// ─────────────────────────────────────────────────────────────
const feed            = document.getElementById('feed');
const profileFeed     = document.getElementById('profileFeed');
const composeText     = document.getElementById('composeText');
const charCounter     = document.getElementById('charCounter');
const postBtn         = document.getElementById('postBtn');
const composePills    = document.getElementById('composePills');
const composeAvatar   = document.getElementById('composeAvatar');
const modalComposeAvatar = document.getElementById('modalComposeAvatar');
const currentUserAvatar  = document.getElementById('currentUserAvatar');
const currentUserName    = document.getElementById('currentUserName');
const currentUserHandle  = document.getElementById('currentUserHandle');
const profileAvatar      = document.getElementById('profileAvatar');
const profileName        = document.getElementById('profileName');
const profileHandle      = document.getElementById('profileHandle');
const profileBio         = document.getElementById('profileBio');
const profilePosts       = document.getElementById('profilePosts');
const trendingList       = document.getElementById('trendingList');
const followList         = document.getElementById('followList');
const notifList          = document.getElementById('notifList');
const notifBadge         = document.getElementById('notifBadge');
const toast              = document.getElementById('toast');
const hashtagDropdown    = document.getElementById('hashtagDropdown');
const composeModal       = document.getElementById('composeModal');
const editProfileModal   = document.getElementById('editProfileModal');
const modalComposeText   = document.getElementById('modalComposeText');
const modalCharCounter   = document.getElementById('modalCharCounter');
const modalPostBtn       = document.getElementById('modalPostBtn');
const sidebarSearch      = document.getElementById('sidebarSearch');
const exploreSearch      = document.getElementById('exploreSearch');
const exploreResults     = document.getElementById('exploreResults');

// ─────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────
function init() {
  updateUserUI();
  renderFeed();
  renderProfileFeed();
  renderTrending();
  renderFollowSuggestions();
  renderNotifications();
  renderExplore('');
  updateNotifBadge();
  syncProfileStats();

  // Nav
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  // Tabs
  document.querySelectorAll('#view-home .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      document.querySelectorAll('#view-home .tab-btn').forEach(b => b.classList.toggle('active', b === btn));
      renderFeed();
    });
  });

  // Profile tabs
  document.querySelectorAll('.profile-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeProfileTab = btn.dataset.ptab;
      document.querySelectorAll('.profile-tabs .tab-btn').forEach(b => b.classList.toggle('active', b === btn));
      renderProfileFeed();
    });
  });

  // Inline compose
  composeText.addEventListener('input', onComposeInput);
  postBtn.addEventListener('click', () => submitPost(composeText.value, () => { composeText.value = ''; updateCompose(); }));

  // Hashtag button
  document.getElementById('addHashtagBtn').addEventListener('click', showHashtagDropdown);
  document.addEventListener('click', e => {
    if (!e.target.closest('.compose-inner')) hideHashtagDropdown();
  });

  // Compose tabs (audience)
  document.querySelectorAll('.compose-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.compose-tab').forEach(b => b.classList.toggle('active', b === btn));
    });
  });

  // Refresh
  document.getElementById('refreshBtn').addEventListener('click', refreshFeed);

  // Compose modal
  document.getElementById('openComposeBtn').addEventListener('click', openComposeModal);
  document.getElementById('closeComposeModal').addEventListener('click', closeComposeModal);
  composeModal.addEventListener('click', e => { if (e.target === composeModal) closeComposeModal(); });
  modalComposeText.addEventListener('input', () => {
    const len = modalComposeText.value.length;
    const rem = 280 - len;
    modalCharCounter.textContent = rem;
    modalCharCounter.className = 'char-counter' + (rem <= 20 ? ' warn' : '') + (rem < 0 ? ' danger' : '');
    modalPostBtn.disabled = len === 0 || len > 280;
  });
  modalPostBtn.addEventListener('click', () => {
    submitPost(modalComposeText.value, () => {
      modalComposeText.value = '';
      modalCharCounter.textContent = '280';
      modalPostBtn.disabled = true;
      closeComposeModal();
    });
  });

  // Edit profile
  document.getElementById('editProfileBtn').addEventListener('click', openEditProfile);
  document.getElementById('navAvatarBtn').addEventListener('click', () => switchView('profile'));
  document.getElementById('closeEditProfile').addEventListener('click', () => editProfileModal.classList.add('hidden'));
  document.getElementById('cancelEditProfile').addEventListener('click', () => editProfileModal.classList.add('hidden'));
  editProfileModal.addEventListener('click', e => { if (e.target === editProfileModal) editProfileModal.classList.add('hidden'); });
  document.getElementById('editProfileForm').addEventListener('submit', saveProfile);

  // Clear notifications
  document.getElementById('clearNotifBtn').addEventListener('click', () => {
    notifications.forEach(n => n.read = true);
    persist();
    renderNotifications();
    updateNotifBadge();
  });

  // Search
  sidebarSearch.addEventListener('input', e => {
    const q = e.target.value.trim();
    if (q) {
      if (exploreSearch) exploreSearch.value = q;
      switchView('explore');
      renderExplore(q);
    }
  });
  sidebarSearch.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = sidebarSearch.value.trim();
      if (q) { switchView('explore'); renderExplore(q); }
    }
  });
  if (exploreSearch) {
    exploreSearch.addEventListener('input', e => renderExplore(e.target.value.trim()));
  }

  // Keyboard: Escape closes modals
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeComposeModal();
      editProfileModal.classList.add('hidden');
    }
  });
}

// ─────────────────────────────────────────────────────────────
// USER UI
// ─────────────────────────────────────────────────────────────
function updateUserUI() {
  const av = makeAvatar(currentUser.name, 42);
  const avLg = makeAvatar(currentUser.name, 80);
  currentUserAvatar.src = av;
  composeAvatar.src = av;
  modalComposeAvatar.src = av;
  profileAvatar.src = avLg;
  currentUserName.textContent = currentUser.name;
  currentUserHandle.textContent = `@${currentUser.handle}`;
  profileName.textContent = currentUser.name;
  profileHandle.textContent = `@${currentUser.handle}`;
  profileBio.textContent = currentUser.bio;
}

function syncProfileStats() {
  const myPosts = posts.filter(p => p.handle === currentUser.handle);
  profilePosts.textContent = myPosts.length;
}

// ─────────────────────────────────────────────────────────────
// VIEW SWITCHING
// ─────────────────────────────────────────────────────────────
function switchView(name) {
  if (activeView === name) return;
  activeView = name;
  document.querySelectorAll('.view').forEach(v => {
    v.classList.toggle('hidden', v.id !== `view-${name}`);
    v.classList.toggle('active', v.id === `view-${name}`);
  });
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === name);
  });
  if (name === 'profile') { renderProfileFeed(); syncProfileStats(); }
  if (name === 'notifications') { renderNotifications(); }
  if (name === 'explore') renderExplore(exploreSearch ? exploreSearch.value.trim() : '');
}

// ─────────────────────────────────────────────────────────────
// COMPOSE & POST
// ─────────────────────────────────────────────────────────────
function onComposeInput() {
  updateCompose();
  const val = composeText.value;
  const lastWord = val.split(/\s/).pop();
  if (lastWord.startsWith('#') && lastWord.length > 1) {
    showHashtagSuggestions(lastWord.toLowerCase());
  } else {
    hideHashtagDropdown();
  }
}

function updateCompose() {
  const len = composeText.value.length;
  const rem = 280 - len;
  charCounter.textContent = rem;
  charCounter.className = 'char-counter' + (rem <= 20 ? ' warn' : '') + (rem < 0 ? ' danger' : '');
  postBtn.disabled = len === 0 || len > 280;
}

function submitPost(text, onSuccess) {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > 280) return;

  const post = {
    id: 'p-' + Date.now(),
    author: currentUser.name,
    handle: currentUser.handle,
    text: trimmed,
    ts: Date.now(),
    likes: 0,
    retweets: 0,
    replies: 0,
    liked: false,
    retweeted: false,
    bookmarked: false,
  };

  posts.unshift(post);
  persist();
  onSuccess();
  renderFeed();
  renderProfileFeed();
  syncProfileStats();
  showToast('Post published!');
}

// ─────────────────────────────────────────────────────────────
// HASHTAG DROPDOWN
// ─────────────────────────────────────────────────────────────
function showHashtagDropdown() {
  const q = composeText.value.split(/\s/).pop();
  showHashtagSuggestions(q.startsWith('#') ? q.toLowerCase() : '#');
}

function showHashtagSuggestions(query) {
  const matches = ALL_HASHTAGS
    .filter(h => h.tag.toLowerCase().includes(query) && !composePills.querySelector(`[data-tag="${h.tag}"]`))
    .slice(0, 6);
  if (!matches.length) { hideHashtagDropdown(); return; }

  hashtagDropdown.innerHTML = '';
  matches.forEach(h => {
    const div = document.createElement('div');
    div.className = 'hashtag-option';
    div.setAttribute('role', 'option');
    div.tabIndex = 0;
    div.innerHTML = `<span class="tag-name">${h.tag}</span><span class="tag-count">${formatCount(h.count)} posts</span>`;
    div.addEventListener('click', () => insertHashtag(h.tag));
    div.addEventListener('keydown', e => { if (e.key === 'Enter') insertHashtag(h.tag); });
    hashtagDropdown.appendChild(div);
  });
  hashtagDropdown.classList.remove('hidden');
}

function insertHashtag(tag) {
  // Replace partial hashtag typed in textarea
  const words = composeText.value.split(/(\s)/);
  const lastIdx = words.map(w => w.trim()).lastIndexOf(words.map(w => w.trim()).filter(w => w.startsWith('#')).pop());
  if (lastIdx !== -1) {
    words[words.map(w => w.trim()).reduce((acc, w, i) => w.startsWith('#') ? i : acc, -1)] = tag;
    composeText.value = words.join('');
  } else {
    composeText.value = (composeText.value + ' ' + tag).trim() + ' ';
  }
  hideHashtagDropdown();
  updateCompose();
  composeText.focus();
}

function hideHashtagDropdown() {
  hashtagDropdown.classList.add('hidden');
}

// ─────────────────────────────────────────────────────────────
// RENDER FEED
// ─────────────────────────────────────────────────────────────
function renderFeed() {
  let list = [...posts];
  if (activeTab === 'following') {
    const followedHandles = [...followedUsers];
    list = list.filter(p => followedHandles.includes(p.handle) || p.handle === currentUser.handle);
    if (!list.length) {
      feed.innerHTML = '';
      feed.appendChild(emptyState('👀', 'Nothing here yet', 'Follow people to see their posts here.'));
      return;
    }
  }
  feed.innerHTML = '';
  list.forEach(p => feed.appendChild(buildPostEl(p)));
}

function renderProfileFeed() {
  const myPosts = activeProfileTab === 'posts'
    ? posts.filter(p => p.handle === currentUser.handle)
    : posts.filter(p => p.liked && p.handle !== currentUser.handle).concat(
        posts.filter(p => p.liked && p.handle === currentUser.handle)
      ).filter(p => p.liked);

  profileFeed.innerHTML = '';
  if (!myPosts.length) {
    profileFeed.appendChild(emptyState(
      activeProfileTab === 'posts' ? '🐦' : '🤍',
      activeProfileTab === 'posts' ? 'No posts yet' : 'No liked posts',
      activeProfileTab === 'posts' ? 'When you post, it appears here.' : 'Posts you like show up here.'
    ));
    return;
  }
  myPosts.forEach(p => profileFeed.appendChild(buildPostEl(p)));
}

// ─────────────────────────────────────────────────────────────
// BUILD POST ELEMENT
// ─────────────────────────────────────────────────────────────
function buildPostEl(post) {
  const wrapper = document.createElement('div');
  wrapper.dataset.postId = post.id;

  // Repost header
  if (post.retweeted && post.retweetedBy) {
    const label = document.createElement('div');
    label.className = 'repost-label';
    label.innerHTML = `<svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg> ${escapeHtml(post.retweetedBy)} Rechirped`;
    wrapper.appendChild(label);
  }

  const article = document.createElement('article');
  article.className = 'post-item';
  article.setAttribute('aria-label', `Post by ${post.author}`);

  const authorAvatar = makeAvatar(post.author, 42);
  article.innerHTML = `
    <div class="post-avatar-col">
      <img src="${authorAvatar}" alt="${escapeHtml(post.author)}'s avatar" class="avatar avatar-sm" />
    </div>
    <div class="post-body">
      <div class="post-header">
        <span class="post-name">${escapeHtml(post.author)}</span>
        <span class="post-handle">@${escapeHtml(post.handle)}</span>
        <span class="post-dot">·</span>
        <span class="post-time" title="${new Date(post.ts).toLocaleString()}">${relativeTime(post.ts)}</span>
      </div>
      <div class="post-text">${formatPostText(post.text)}</div>
      <div class="post-actions">
        <button class="post-action-btn reply-btn" aria-label="Reply" title="Reply">
          <svg viewBox="0 0 24 24"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"/></svg>
          <span>${formatCount(post.replies)}</span>
        </button>
        <button class="post-action-btn retweet-btn ${post.retweeted ? 'active' : ''}" aria-label="Rechirp" title="Rechirp" aria-pressed="${post.retweeted}">
          <svg viewBox="0 0 24 24"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"/></svg>
          <span>${formatCount(post.retweets)}</span>
        </button>
        <button class="post-action-btn like-btn ${post.liked ? 'active' : ''}" aria-label="Like" title="Like" aria-pressed="${post.liked}">
          <svg viewBox="0 0 24 24"><path d="${post.liked
            ? 'M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z'
            : 'M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z'
          }"/></svg>
          <span>${formatCount(post.likes)}</span>
        </button>
        <button class="post-action-btn bookmark-btn ${post.bookmarked ? 'active' : ''}" aria-label="Bookmark" title="Bookmark" aria-pressed="${post.bookmarked}">
          <svg viewBox="0 0 24 24"><path d="${post.bookmarked
            ? 'M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z'
            : 'M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zm2.5-.5c-.276 0-.5.22-.5.5v15.56l5.5-3.93 5.5 3.93V4.5c0-.28-.224-.5-.5-.5h-11z'
          }"/></svg>
        </button>
      </div>
    </div>
  `;

  // Like
  article.querySelector('.like-btn').addEventListener('click', e => {
    e.stopPropagation();
    toggleLike(post.id);
  });
  // Retweet
  article.querySelector('.retweet-btn').addEventListener('click', e => {
    e.stopPropagation();
    toggleRetweet(post.id);
  });
  // Bookmark
  article.querySelector('.bookmark-btn').addEventListener('click', e => {
    e.stopPropagation();
    toggleBookmark(post.id);
  });
  // Reply (open compose modal)
  article.querySelector('.reply-btn').addEventListener('click', e => {
    e.stopPropagation();
    openComposeModal(`@${post.handle} `);
  });

  wrapper.appendChild(article);
  return wrapper;
}

// ─────────────────────────────────────────────────────────────
// ACTIONS
// ─────────────────────────────────────────────────────────────
function toggleLike(postId) {
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  post.liked = !post.liked;
  post.likes += post.liked ? 1 : -1;
  if (post.liked && post.handle !== currentUser.handle) {
    addNotification('like', post.author, 'liked your post');
  }
  persist();
  renderFeed();
  renderProfileFeed();
}

function toggleRetweet(postId) {
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  post.retweeted = !post.retweeted;
  post.retweets += post.retweeted ? 1 : -1;
  if (post.retweeted) {
    showToast('Rechirped!');
    if (post.handle !== currentUser.handle) {
      addNotification('retweet', post.author, 'rechirped your post');
    }
  }
  persist();
  renderFeed();
  renderProfileFeed();
}

function toggleBookmark(postId) {
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  post.bookmarked = !post.bookmarked;
  persist();
  showToast(post.bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks');
  renderFeed();
  renderProfileFeed();
}

// ─────────────────────────────────────────────────────────────
// TRENDING SIDEBAR
// ─────────────────────────────────────────────────────────────
function renderTrending() {
  const top = ALL_HASHTAGS.slice(0, 8);
  trendingList.innerHTML = '';
  top.forEach((h, i) => {
    const li = document.createElement('li');
    li.className = 'trending-item';
    const isFollowed = followedTags.has(h.tag);
    li.innerHTML = `
      <span class="trending-rank">${i+1}</span>
      <div class="trending-left">
        <span class="trending-label">${h.category} · Trending</span>
        <span class="trending-tag${isFollowed ? ' followed' : ''}">${h.tag}</span>
        <span class="trending-count">${formatCount(h.count)} posts</span>
      </div>
      <button class="follow-tag-btn${isFollowed ? ' following' : ''}" aria-label="${isFollowed ? 'Unfollow' : 'Follow'} ${h.tag}" aria-pressed="${isFollowed}">
        ${isFollowed ? 'Following' : 'Follow'}
      </button>
    `;
    li.querySelector('.follow-tag-btn').addEventListener('click', e => {
      e.stopPropagation();
      toggleFollowTag(h.tag);
    });
    li.querySelector('.trending-tag').addEventListener('click', () => {
      switchView('explore');
      if (exploreSearch) exploreSearch.value = h.tag;
      renderExplore(h.tag);
    });
    trendingList.appendChild(li);
  });
}

function toggleFollowTag(tag) {
  if (followedTags.has(tag)) {
    followedTags.delete(tag);
    showToast(`Unfollowed ${tag}`);
  } else {
    followedTags.add(tag);
    showToast(`Following ${tag}!`);
  }
  persist();
  renderTrending();
  renderExplore(exploreSearch ? exploreSearch.value.trim() : '');
}

// ─────────────────────────────────────────────────────────────
// FOLLOW SUGGESTIONS
// ─────────────────────────────────────────────────────────────
function renderFollowSuggestions() {
  followList.innerHTML = '';
  suggestedUsers.slice(0, 3).forEach(u => {
    const isFollowing = followedUsers.has(u.handle);
    const li = document.createElement('li');
    li.className = 'follow-item';
    li.innerHTML = `
      <img src="${makeAvatar(u.name, 42)}" alt="${escapeHtml(u.name)}'s avatar" class="avatar avatar-sm" />
      <div class="follow-info">
        <span class="follow-name">${escapeHtml(u.name)}</span>
        <span class="follow-handle">@${escapeHtml(u.handle)}</span>
      </div>
      <button class="follow-user-btn${isFollowing ? ' following' : ''}" aria-label="${isFollowing ? 'Unfollow' : 'Follow'} ${u.handle}" aria-pressed="${isFollowing}">
        ${isFollowing ? 'Following' : 'Follow'}
      </button>
    `;
    li.querySelector('.follow-user-btn').addEventListener('click', () => toggleFollowUser(u));
    followList.appendChild(li);
  });
}

function toggleFollowUser(user) {
  if (followedUsers.has(user.handle)) {
    followedUsers.delete(user.handle);
    showToast(`Unfollowed @${user.handle}`);
  } else {
    followedUsers.add(user.handle);
    showToast(`Following @${user.handle}!`);
    addNotification('follow', user.name, 'started following you');
  }
  persist();
  renderFollowSuggestions();
  renderFeed();
}

// ─────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────
function addNotification(type, user, text) {
  notifications.unshift({ id: 'n-' + Date.now(), type, user, text, ts: Date.now(), read: false });
  if (notifications.length > 50) notifications.pop();
  persist();
  updateNotifBadge();
}

function updateNotifBadge() {
  const count = notifications.filter(n => !n.read).length;
  notifBadge.textContent = count;
  notifBadge.classList.toggle('hidden', count === 0);
}

const notifIcons = {
  like: `<svg viewBox="0 0 24 24"><path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/></svg>`,
  retweet: `<svg viewBox="0 0 24 24"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"/></svg>`,
  follow: `<svg viewBox="0 0 24 24"><path d="M17.863 13.44c1.477 1.58 2.366 3.72 2.137 6.06-.48 4.79-4.735 7.23-9 7.5-4.265-.27-8.52-2.71-9-7.5-.23-2.34.66-4.48 2.137-6.06C5.273 12.22 6 10.88 6 9.5a6 6 0 0112 0c0 1.38.727 2.72 1.863 3.94z"/></svg>`,
  mention: `<svg viewBox="0 0 24 24"><path d="M11.996 3C6.479 3 2 7.478 2 12c0 4.521 4.479 9 9.996 9 1.369 0 2.683-.273 3.896-.763l-.748-1.852c-.938.363-1.938.558-3.148.558-4.131 0-7.979-3.611-7.979-6.943C4.017 8.048 7.606 4.5 11.996 4.5c4.39 0 7.979 3.548 7.979 7.5 0 1.858-1.027 3.344-2.117 3.344-.77 0-1.027-.506-.891-1.34L18.5 9.5h-1.72l-.25 1.34c-.44-.883-1.342-1.59-2.53-1.59-2.41 0-4.25 2.26-4.25 5 0 2.08 1.12 3.5 2.87 3.5 1.12 0 2.06-.6 2.67-1.56.34.99 1.11 1.56 2.21 1.56 2.02 0 3.62-1.99 3.62-4.83C21 7.478 16.514 3 11.996 3zm-.62 12.25c-1 0-1.5-.73-1.5-1.75 0-1.57.87-3 2-3 1 0 1.5.73 1.5 1.75 0 1.56-.87 3-2 3z"/></svg>`,
};

function renderNotifications() {
  notifList.innerHTML = '';
  if (!notifications.length) {
    notifList.innerHTML = '<li style="padding:48px 16px;text-align:center;color:var(--text-muted)">No notifications yet</li>';
    return;
  }
  notifications.forEach(n => {
    const li = document.createElement('li');
    li.className = `notif-item${n.read ? '' : ' unread'}`;
    li.innerHTML = `
      <div class="notif-icon ${n.type}">${notifIcons[n.type] || ''}</div>
      <div>
        <div class="notif-text"><strong>${escapeHtml(n.user)}</strong> ${escapeHtml(n.text)}</div>
        <div class="notif-time">${relativeTime(n.ts)}</div>
      </div>
    `;
    li.addEventListener('click', () => {
      n.read = true;
      persist();
      updateNotifBadge();
      renderNotifications();
    });
    notifList.appendChild(li);
  });
}

// ─────────────────────────────────────────────────────────────
// EXPLORE
// ─────────────────────────────────────────────────────────────
function renderExplore(query) {
  exploreResults.innerHTML = '';
  if (!query) {
    // Show all followed tags + trending
    const section = document.createElement('div');
    section.innerHTML = '<div class="explore-section-title">Trending hashtags</div>';
    const chips = document.createElement('div');
    chips.className = 'explore-chips';
    ALL_HASHTAGS.slice(0, 12).forEach(h => {
      const chip = document.createElement('span');
      chip.className = 'explore-tag-chip';
      chip.textContent = h.tag;
      chip.addEventListener('click', () => {
        if (exploreSearch) exploreSearch.value = h.tag;
        renderExplore(h.tag);
      });
      chips.appendChild(chip);
    });
    section.appendChild(chips);
    exploreResults.appendChild(section);
    return;
  }

  const q = query.toLowerCase();

  // Tag matches
  const tagMatches = ALL_HASHTAGS.filter(h => h.tag.toLowerCase().includes(q));
  if (tagMatches.length) {
    const title = document.createElement('div');
    title.className = 'explore-section-title';
    title.textContent = 'Hashtags';
    exploreResults.appendChild(title);
    const chips = document.createElement('div');
    chips.className = 'explore-chips';
    tagMatches.forEach(h => {
      const chip = document.createElement('span');
      chip.className = 'explore-tag-chip';
      chip.innerHTML = `${h.tag} <small style="opacity:.7;font-weight:400">${formatCount(h.count)} posts</small>`;
      chip.addEventListener('click', () => {
        if (exploreSearch) exploreSearch.value = h.tag;
        renderExplore(h.tag);
      });
      chips.appendChild(chip);
    });
    exploreResults.appendChild(chips);
  }

  // Post matches
  const postMatches = posts.filter(p =>
    p.text.toLowerCase().includes(q) ||
    p.author.toLowerCase().includes(q) ||
    p.handle.toLowerCase().includes(q)
  );
  if (postMatches.length) {
    const title = document.createElement('div');
    title.className = 'explore-section-title';
    title.textContent = 'Posts';
    exploreResults.appendChild(title);
    postMatches.forEach(p => exploreResults.appendChild(buildPostEl(p)));
  }

  if (!tagMatches.length && !postMatches.length) {
    const empty = document.createElement('div');
    empty.className = 'explore-empty';
    empty.textContent = `No results for "${query}"`;
    exploreResults.appendChild(empty);
  }
}

// ─────────────────────────────────────────────────────────────
// MODALS
// ─────────────────────────────────────────────────────────────
function openComposeModal(prefill = '') {
  composeModal.classList.remove('hidden');
  modalComposeText.value = prefill;
  modalComposeText.focus();
  if (prefill) {
    modalCharCounter.textContent = 280 - prefill.length;
    modalPostBtn.disabled = prefill.length === 0;
  }
}
function closeComposeModal() {
  composeModal.classList.add('hidden');
}

function openEditProfile() {
  document.getElementById('editName').value = currentUser.name;
  document.getElementById('editHandle').value = currentUser.handle;
  document.getElementById('editBio').value = currentUser.bio;
  editProfileModal.classList.remove('hidden');
}

function saveProfile(e) {
  e.preventDefault();
  const name = document.getElementById('editName').value.trim();
  const handle = document.getElementById('editHandle').value.trim().replace(/^@/, '');
  const bio = document.getElementById('editBio').value.trim();
  if (!name || !handle) return;
  currentUser = { name, handle, bio };
  persist();
  updateUserUI();
  syncProfileStats();
  editProfileModal.classList.add('hidden');
  showToast('Profile updated!');
}

// ─────────────────────────────────────────────────────────────
// REFRESH
// ─────────────────────────────────────────────────────────────
function refreshFeed() {
  // Inject a couple of "new" posts
  const freshPosts = [
    { author: 'Sam Rivera', handle: 'samrivera', text: 'Hot off the press: new #JavaScript performance tricks you didn\'t know you needed 🚀 #WebDev' },
    { author: 'Aria Kim', handle: 'ariakim', text: 'Reminder that consistency beats perfection every single time. Keep shipping. 💪 #DevLife #Startup' },
    { author: 'Maya Chen', handle: 'mayachen', text: 'CSS container queries are changing everything about responsive #Design. Are you using them yet? #CSS #WebDev' },
  ];
  const pick = freshPosts[Math.floor(Math.random() * freshPosts.length)];
  posts.unshift({
    id: 'p-' + Date.now(),
    ...pick,
    ts: Date.now(),
    likes: Math.floor(Math.random() * 50),
    retweets: Math.floor(Math.random() * 15),
    replies: Math.floor(Math.random() * 10),
    liked: false, retweeted: false, bookmarked: false,
  });
  persist();
  renderFeed();
  showToast('Feed refreshed!');
}

// ─────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove('hidden');
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 2500);
}

// ─────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────
function formatPostText(text) {
  return escapeHtml(text).replace(/#(\w+)/g, '<span class="hashtag" role="link" tabindex="0">#$1</span>');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatCount(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0','') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace('.0','') + 'K';
  return String(n);
}

function emptyState(icon, title, subtitle) {
  const div = document.createElement('div');
  div.className = 'empty-state';
  div.innerHTML = `
    <div class="empty-state-icon">${icon}</div>
    <h3>${escapeHtml(title)}</h3>
    <p>${escapeHtml(subtitle)}</p>
  `;
  return div;
}

// hashtag click in feed → explore
document.addEventListener('click', e => {
  if (e.target.classList.contains('hashtag')) {
    const tag = e.target.textContent;
    switchView('explore');
    if (exploreSearch) exploreSearch.value = tag;
    renderExplore(tag);
  }
});

// ─────────────────────────────────────────────────────────────
// BOOT
// ─────────────────────────────────────────────────────────────
init();
