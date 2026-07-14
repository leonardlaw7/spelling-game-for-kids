// Manage Words screen: list, add (with optional photo upload), delete, reset to defaults.
let pendingImageDataUrl = null;

// Known sections render first, in this order; words with no section (or an unlisted one) render last, unheaded.
const SECTION_DISPLAY_ORDER = ['This Week', 'Recap'];

function groupWordsBySection(words) {
  const groups = new Map();
  words.forEach((word) => {
    const key = word.section || null;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(word);
  });
  return groups;
}

function renderWordList() {
  const state = loadState(appState.profile);
  appState.words = state.words;
  const list = document.getElementById('word-list');
  list.innerHTML = '';

  const groups = groupWordsBySection(state.words);
  const orderedKeys = [
    ...SECTION_DISPLAY_ORDER.filter((key) => groups.has(key)),
    ...[...groups.keys()].filter((key) => !SECTION_DISPLAY_ORDER.includes(key))
  ];

  orderedKeys.forEach((key) => {
    if (key) {
      const header = document.createElement('li');
      header.className = 'word-section-header';
      header.textContent = key;
      list.appendChild(header);
    }
    groups.get(key).forEach((word) => list.appendChild(renderWordListItem(word)));
  });
}

function renderWordListItem(word) {
  const li = document.createElement('li');

  const thumb = document.createElement('div');
  thumb.className = 'word-thumb';
  const img = getWordImage(word);
  if (img.type === 'image') {
    const el = document.createElement('img');
    el.src = img.src;
    el.alt = '';
    thumb.appendChild(el);
  } else {
    thumb.textContent = img.value;
  }

  const text = document.createElement('span');
  text.className = 'word-text';
  text.textContent = word.text;

  const del = document.createElement('button');
  del.className = 'delete-btn';
  del.type = 'button';
  del.title = 'Delete';
  del.textContent = '✕';
  del.addEventListener('click', () => deleteWord(word.id));

  li.appendChild(thumb);
  li.appendChild(text);
  li.appendChild(del);
  return li;
}

function deleteWord(id) {
  if (!confirm('Remove this word from the list?')) return;
  const state = loadState(appState.profile);
  state.words = state.words.filter((w) => w.id !== id);
  saveState(appState.profile, state);
  renderWordList();
}

function updateAddPreview() {
  const preview = document.getElementById('add-word-preview');
  preview.innerHTML = '';
  if (pendingImageDataUrl) {
    const img = document.createElement('img');
    img.src = pendingImageDataUrl;
    img.alt = '';
    preview.appendChild(img);
    return;
  }
  const text = normalizeWordText(document.getElementById('new-word-input').value);
  preview.textContent = text ? getWordEmoji(text) : '📝';
}

function resetAddForm() {
  document.getElementById('add-word-form').reset();
  pendingImageDataUrl = null;
  updateAddPreview();
}

function handleAddWordSubmit(e) {
  e.preventDefault();
  const errorEl = document.getElementById('add-word-error');
  errorEl.textContent = '';

  const text = normalizeWordText(document.getElementById('new-word-input').value);
  if (!text) {
    errorEl.textContent = 'Please type a word.';
    return;
  }
  if (!isValidWordText(text)) {
    errorEl.textContent = 'Please use letters only (a-z).';
    return;
  }

  const state = loadState(appState.profile);
  if (state.words.some((w) => w.text === text)) {
    errorEl.textContent = 'That word is already in the list.';
    return;
  }

  state.words.push({ id: makeId(), text, imageDataUrl: pendingImageDataUrl });
  saveState(appState.profile, state);
  resetAddForm();
  renderWordList();
}

function handleImageFileChange(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  downscaleImageFile(file, 300, (dataUrl) => {
    if (dataUrl) {
      pendingImageDataUrl = dataUrl;
      updateAddPreview();
    }
  });
}

function handleResetWords() {
  if (!confirm('This will remove your custom words and bring back the original word list. Continue?')) return;
  resetToDefaultWords(appState.profile);
  renderWordList();
}

function initManageWordsScreen() {
  document.getElementById('add-word-form').addEventListener('submit', handleAddWordSubmit);
  document.getElementById('new-word-input').addEventListener('input', updateAddPreview);
  document.getElementById('new-word-image').addEventListener('change', handleImageFileChange);
  document.getElementById('btn-reset-words').addEventListener('click', handleResetWords);
}
