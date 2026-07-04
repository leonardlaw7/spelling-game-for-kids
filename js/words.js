// Word model helpers: default word list, emoji lookup, validation, shuffling.
const DEFAULT_WORD_LIST = ['shack', 'damp', 'spat', 'snacked', 'dashed', 'snapped', 'crashed', 'crack'];

const DEFAULT_EMOJI = {
  shack: '🛖',
  damp: '💧',
  spat: '💦',
  snacked: '🍪',
  dashed: '💨',
  snapped: '💥',
  crashed: '💥',
  crack: '🥚'
};

const FALLBACK_EMOJI = '📝';

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
