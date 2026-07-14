// localStorage persistence: load/save each profile's word list, seeding defaults on first run.
const STORAGE_KEY = 'spellingGame.v1'; // legacy single-profile key, kept only as a migration source
const SCHEMA_VERSION = 1;

function getStorageKey(profileId) {
  return STORAGE_KEY + '.' + profileId;
}

function makeId() {
  return 'w_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

function getDefaultWordSection(profileId, text) {
  const sections = DEFAULT_WORD_SECTIONS[profileId];
  return (sections && sections[text]) || null;
}

function getDefaultWords(profileId) {
  return DEFAULT_WORD_LISTS[profileId].map((text) => ({
    id: makeId(),
    text,
    imageDataUrl: null,
    section: getDefaultWordSection(profileId, text)
  }));
}

function isValidWordsState(data) {
  return data && typeof data === 'object' && Array.isArray(data.words);
}

// Keeps existing saved word lists in sync with newly added default words/sections
// (e.g. a new week's word list) without touching words the player added or removed themselves.
function mergeNewDefaultWords(profileId, state) {
  let changed = false;

  state.words.forEach((word) => {
    const section = getDefaultWordSection(profileId, word.text);
    if (section && word.section !== section) {
      word.section = section;
      changed = true;
    }
  });

  (DEFAULT_WORD_LISTS[profileId] || []).forEach((text) => {
    if (!state.words.some((w) => w.text === text)) {
      state.words.push({ id: makeId(), text, imageDataUrl: null, section: getDefaultWordSection(profileId, text) });
      changed = true;
    }
  });

  return changed;
}

function loadState(profileId) {
  let raw;
  try {
    raw = localStorage.getItem(getStorageKey(profileId));
  } catch (e) {
    raw = null;
  }

  if (!raw) {
    const seeded = { schemaVersion: SCHEMA_VERSION, words: getDefaultWords(profileId) };
    saveState(profileId, seeded);
    return seeded;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!isValidWordsState(parsed)) throw new Error('bad shape');
    if (mergeNewDefaultWords(profileId, parsed)) saveState(profileId, parsed);
    return parsed;
  } catch (e) {
    const seeded = { schemaVersion: SCHEMA_VERSION, words: getDefaultWords(profileId) };
    saveState(profileId, seeded);
    return seeded;
  }
}

function saveState(profileId, state) {
  try {
    localStorage.setItem(getStorageKey(profileId), JSON.stringify(state));
  } catch (e) {
    // Storage full or unavailable - fail silently, gameplay still works in-memory.
  }
}

function resetToDefaultWords(profileId) {
  const seeded = { schemaVersion: SCHEMA_VERSION, words: getDefaultWords(profileId) };
  saveState(profileId, seeded);
  return seeded;
}

// One-time migration: move data from the old single shared key into Dalton's namespaced key.
// Safe to call on every load - it's a no-op once Dalton's key exists.
function migrateLegacyDataIfNeeded() {
  let daltonRaw;
  try {
    daltonRaw = localStorage.getItem(getStorageKey('dalton'));
  } catch (e) {
    return;
  }
  if (daltonRaw) return;

  let legacyRaw;
  try {
    legacyRaw = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    return;
  }
  if (!legacyRaw) return;

  let parsed;
  try {
    parsed = JSON.parse(legacyRaw);
    if (!isValidWordsState(parsed)) throw new Error('bad shape');
  } catch (e) {
    return;
  }

  saveState('dalton', { schemaVersion: SCHEMA_VERSION, words: parsed.words });
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // Non-fatal - Dalton's key now exists, so this function won't run again anyway.
  }
}
