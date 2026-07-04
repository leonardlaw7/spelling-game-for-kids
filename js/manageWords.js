// Manage Words screen: list, add (with optional photo upload), delete, reset to defaults.
let pendingImageDataUrl = null;

function renderWordList() {
  const state = loadState();
  appState.words = state.words;
  const list = document.getElementById('word-list');
  list.innerHTML = '';

  state.words.forEach((word) => {
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
    list.appendChild(li);
  });
}

function deleteWord(id) {
  if (!confirm('Remove this word from the list?')) return;
  const state = loadState();
  state.words = state.words.filter((w) => w.id !== id);
  saveState(state);
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

  const state = loadState();
  if (state.words.some((w) => w.text === text)) {
    errorEl.textContent = 'That word is already in the list.';
    return;
  }

  state.words.push({ id: makeId(), text, imageDataUrl: pendingImageDataUrl });
  saveState(state);
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
  resetToDefaultWords();
  renderWordList();
}

function initManageWordsScreen() {
  document.getElementById('add-word-form').addEventListener('submit', handleAddWordSubmit);
  document.getElementById('new-word-input').addEventListener('input', updateAddPreview);
  document.getElementById('new-word-image').addEventListener('change', handleImageFileChange);
  document.getElementById('btn-reset-words').addEventListener('click', handleResetWords);
}
