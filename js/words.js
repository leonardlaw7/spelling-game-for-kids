// Word model helpers: default word lists, emoji lookup, validation, shuffling.
const DEFAULT_WORD_LISTS = {
  dalton: [
    'slept', 'yelled', 'shelf', 'begged', 'pleasant', 'thread', 'leapt', 'ahead',
    'shack', 'damp', 'spat', 'snacked', 'dashed', 'snapped', 'crashed', 'crack'
  ],
  giselle: ['ant', 'map', 'cat', 'hat', 'apple', 'pan', 'mop', 'queen', 'man', 'car', 'fish']
};

// Groups new default words for display in Manage Words. Words with no entry here render ungrouped.
const DEFAULT_WORD_SECTIONS = {
  dalton: {
    slept: 'This Week',
    yelled: 'This Week',
    shelf: 'This Week',
    begged: 'This Week',
    pleasant: 'This Week',
    thread: 'This Week',
    leapt: 'This Week',
    ahead: 'This Week',
    shack: 'Recap',
    damp: 'Recap',
    spat: 'Recap',
    snacked: 'Recap',
    dashed: 'Recap',
    snapped: 'Recap',
    crashed: 'Recap',
    crack: 'Recap'
  }
};

const DEFAULT_EMOJI = {
  slept: '😴',
  yelled: '📢',
  shelf: '📚',
  begged: '🙏',
  pleasant: '😊',
  thread: '🧵',
  leapt: '🐸',
  ahead: '➡️',
  shack: '🛖',
  damp: '💧',
  spat: '💦',
  snacked: '🍪',
  dashed: '💨',
  snapped: '💥',
  crashed: '💥',
  crack: '🥚',
  ant: '🐜',
  map: '🗺️',
  cat: '🐱',
  hat: '🎩',
  apple: '🍎',
  pan: '🍳',
  mop: '🧹',
  queen: '👑',
  man: '🧑',
  car: '🚗',
  fish: '🐟'
};

const FALLBACK_EMOJI = '📝';

// Known sections render/offer for selection in this order; unlisted/missing sections are ignored for practice-set choice.
const SECTION_DISPLAY_ORDER = ['This Week', 'Recap'];

// Distinct known sections actually present among these words, in display order.
function getAvailableSections(words) {
  const present = new Set(words.map((w) => w.section).filter(Boolean));
  return SECTION_DISPLAY_ORDER.filter((key) => present.has(key));
}

function getWordEmoji(text) {
  return DEFAULT_EMOJI[text] || FALLBACK_EMOJI;
}

// Returns { type: 'image', src } or { type: 'emoji', value }
function getWordImage(word) {
  if (word.imageDataUrl) return { type: 'image', src: word.imageDataUrl };
  return { type: 'emoji', value: getWordEmoji(word.text) };
}

function normalizeWordText(raw) {
  return String(raw || '').trim().toLowerCase();
}

function isValidWordText(text) {
  return /^[a-z]+$/.test(text);
}

function shuffle(array) {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Downscale an uploaded image to keep localStorage usage small.
function downscaleImageFile(file, maxSize, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > height && width > maxSize) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      } else if (height > maxSize) {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => callback(null);
    img.src = e.target.result;
  };
  reader.onerror = () => callback(null);
  reader.readAsDataURL(file);
}
