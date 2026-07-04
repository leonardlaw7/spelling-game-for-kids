// localStorage persistence: load/save the word list, seeding defaults on first run.
const STORAGE_KEY = 'spellingGame.v1';
const SCHEMA_VERSION = 1;

function makeId() {
  return 'w_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

function getDefaultWords() {
  return DEFAULT_WORD_LIST.map((text) => ({ id: makeId(), text, imageDataUrl: null }));
}

function isValidWordsState(data) {
  return data && typeof data === 'object' && Array.isArray(data.words);
}

function loadState() {
  let raw;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    raw = null;
  }

  if (!raw) {
    const seeded = { schemaVersion: SCHEMA_VERSION, words: getDefaultWords() };
    saveState(seeded);
    return seeded;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!isValidWordsState(parsed)) throw new Error('bad shape');
    return parsed;
  } catch (e) {
    const seeded = { schemaVersion: SCHEMA_VERSION, words: getDefaultWords() };
    saveState(seeded);
    return seeded;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // Storage full or unavailable - fail silently, gameplay still works in-memory.
  }
}

function resetToDefaultWords() {
  const seeded = { schemaVersion: SCHEMA_VERSION, words: getDefaultWords() };
  saveState(seeded);
  return seeded;
}
