const storageKey = 'snippet-manager-items';

const defaultSnippets = [
  {
    id: crypto.randomUUID(),
    title: 'Debounce function',
    language: 'javascript',
    tags: ['performance', 'events', 'utility'],
    description: 'Delay a function call until the user stops triggering an event.',
    code: `function debounce(callback, delay = 300) {
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  };
}`
  },
  {
    id: crypto.randomUUID(),
    title: 'Responsive card grid',
    language: 'css',
    tags: ['layout', 'responsive', 'css'],
    description: 'A fluid CSS Grid layout that adapts without media queries.',
    code: `.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  gap: 1rem;
}`
  },
  {
    id: crypto.randomUUID(),
    title: 'Fetch JSON safely',
    language: 'javascript',
    tags: ['api', 'fetch', 'async'],
    description: 'Fetch JSON and raise a useful error for failed responses.',
    code: `async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(\`Request failed: ${response.status}\`);
  }

  return response.json();
}`
  }
];

let snippets = loadSnippets();
let selectedTags = new Set();
let editingId = null;

const snippetGrid = document.querySelector('#snippetGrid');
const tagFilters = document.querySelector('#tagFilters');
const searchInput = document.querySelector('#searchInput');
const languageFilter = document.querySelector('#languageFilter');
const snippetCount = document.querySelector('#snippetCount');
const emptyState = document.querySelector('#emptyState');
const snippetDialog = document.querySelector('#snippetDialog');
const snippetForm = document.querySelector('#snippetForm');
const dialogTitle = document.querySelector('#dialogTitle');
const toast = document.querySelector('#toast');

const fields = {
  id: document.querySelector('#snippetId'),
  title: document.querySelector('#titleInput'),
  language: document.querySelector('#languageInput'),
  tags: document.querySelector('#tagsInput'),
  description: document.querySelector('#descriptionInput'),
  code: document.querySelector('#codeInput')
};

document.querySelector('#newSnippetButton').addEventListener('click', () => openDialog());
document.querySelector('#closeDialogButton').addEventListener('click', closeDialog);
document.querySelector('#cancelButton').addEventListener('click', closeDialog);
document.querySelector('#clearFiltersButton').addEventListener('click', () => {
  selectedTags.clear();
  searchInput.value = '';
  languageFilter.value = 'all';
  render();
});

searchInput.addEventListener('input', renderSnippets);
languageFilter.addEventListener('change', renderSnippets);
snippetForm.addEventListener('submit', saveSnippet);

render();

function loadSnippets() {
  const stored = localStorage.getItem(storageKey);
  return stored ? JSON.parse(stored) : defaultSnippets;
}

function persistSnippets() {
  localStorage.setItem(storageKey, JSON.stringify(snippets));
}

function render() {
  renderLanguageFilter();
  renderTagFilters();
  renderSnippets();
}

function renderLanguageFilter() {
  const currentValue = languageFilter.value || 'all';
  const languages = [...new Set(snippets.map((snippet) => snippet.language))].sort();

  languageFilter.innerHTML = '<option value="all">All languages</option>';
  languages.forEach((language) => {
    const option = document.createElement('option');
    option.value = language;
    option.textContent = formatLanguage(language);
    languageFilter.append(option);
  });

  languageFilter.value = languages.includes(currentValue) ? currentValue : 'all';
}

function renderTagFilters() {
  const tags = [...new Set(snippets.flatMap((snippet) => snippet.tags))].sort();
  tagFilters.innerHTML = '';

  tags.forEach((tag) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `tag-button${selectedTags.has(tag) ? ' active' : ''}`;
    button.textContent = tag;
    button.setAttribute('aria-pressed', selectedTags.has(tag));
    button.addEventListener('click', () => {
      selectedTags.has(tag) ? selectedTags.delete(tag) : selectedTags.add(tag);
      render();
    });
    tagFilters.append(button);
  });
}

function renderSnippets() {
  const filtered = getFilteredSnippets();
  snippetGrid.innerHTML = '';
  snippetCount.textContent = `${filtered.length} snippet${filtered.length === 1 ? '' : 's'} found`;
  emptyState.hidden = filtered.length > 0;

  filtered.forEach((snippet) => snippetGrid.append(createSnippetCard(snippet)));
  Prism.highlightAllUnder(snippetGrid);
}

function getFilteredSnippets() {
  const query = searchInput.value.trim().toLowerCase();
  const language = languageFilter.value;

  return snippets.filter((snippet) => {
    const searchable = [snippet.title, snippet.description, snippet.code, snippet.language, ...snippet.tags].join(' ').toLowerCase();
    const matchesSearch = !query || searchable.includes(query);
    const matchesLanguage = language === 'all' || snippet.language === language;
    const matchesTags = [...selectedTags].every((tag) => snippet.tags.includes(tag));

    return matchesSearch && matchesLanguage && matchesTags;
  });
}

function createSnippetCard(snippet) {
  const article = document.createElement('article');
  article.className = 'snippet-card';

  article.innerHTML = `
    <div class="card-content">
      <div class="card-top">
        <h2></h2>
        <span class="language-badge"></span>
      </div>
      <p class="description"></p>
      <div class="card-tags"></div>
      <pre><code></code></pre>
      <div class="card-actions">
        <button class="secondary-action copy-button" type="button">Copy</button>
        <button class="secondary-action edit-button" type="button">Edit</button>
        <button class="danger-action delete-button" type="button">Delete</button>
      </div>
    </div>
  `;

  article.querySelector('h2').textContent = snippet.title;
  article.querySelector('.language-badge').textContent = formatLanguage(snippet.language);
  article.querySelector('.description').textContent = snippet.description || 'No notes added.';

  const tagContainer = article.querySelector('.card-tags');
  snippet.tags.forEach((tag) => {
    const tagPill = document.createElement('span');
    tagPill.className = 'tag-pill';
    tagPill.textContent = tag;
    tagContainer.append(tagPill);
  });

  const pre = article.querySelector('pre');
  const code = article.querySelector('code');
  pre.className = `language-${snippet.language}`;
  code.className = `language-${snippet.language}`;
  code.textContent = snippet.code;

  article.querySelector('.copy-button').addEventListener('click', () => copySnippet(snippet.code));
  article.querySelector('.edit-button').addEventListener('click', () => openDialog(snippet));
  article.querySelector('.delete-button').addEventListener('click', () => deleteSnippet(snippet.id));

  return article;
}

async function copySnippet(code) {
  await navigator.clipboard.writeText(code);
  showToast('Snippet copied to clipboard');
}

function openDialog(snippet = null) {
  editingId = snippet?.id || null;
  dialogTitle.textContent = snippet ? 'Edit snippet' : 'Add snippet';
  fields.id.value = snippet?.id || '';
  fields.title.value = snippet?.title || '';
  fields.language.value = snippet?.language || 'javascript';
  fields.tags.value = snippet?.tags.join(', ') || '';
  fields.description.value = snippet?.description || '';
  fields.code.value = snippet?.code || '';
  snippetDialog.showModal();
  fields.title.focus();
}

function closeDialog() {
  snippetDialog.close();
  snippetForm.reset();
  editingId = null;
}

function saveSnippet(event) {
  event.preventDefault();

  const snippet = {
    id: editingId || crypto.randomUUID(),
    title: fields.title.value.trim(),
    language: fields.language.value,
    tags: parseTags(fields.tags.value),
    description: fields.description.value.trim(),
    code: fields.code.value.trim()
  };

  snippets = editingId
    ? snippets.map((item) => (item.id === editingId ? snippet : item))
    : [snippet, ...snippets];

  persistSnippets();
  closeDialog();
  render();
  showToast(editingId ? 'Snippet updated' : 'Snippet added');
}

function deleteSnippet(id) {
  const snippet = snippets.find((item) => item.id === id);
  if (!confirm(`Delete “${snippet.title}”?`)) return;

  snippets = snippets.filter((item) => item.id !== id);
  selectedTags = new Set([...selectedTags].filter((tag) => snippets.some((item) => item.tags.includes(tag))));
  persistSnippets();
  render();
  showToast('Snippet deleted');
}

function parseTags(value) {
  const tags = value
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

  return [...new Set(tags)];
}

function formatLanguage(language) {
  const labels = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    css: 'CSS',
    html: 'HTML',
    python: 'Python',
    bash: 'Bash',
    json: 'JSON'
  };

  return labels[language] || language;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2200);
}
