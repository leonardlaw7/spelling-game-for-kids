// Web Speech API wrapper: word playback, per-letter pronunciation, praise/gentle feedback.
const PRAISE_PHRASES = ['Awesome!', 'You got it!', 'Wonderful!', 'Great job!'];

let cachedVoice = null;
let voicesReady = false;

function speechSupported() {
  return 'speechSynthesis' in window;
}

function pickPreferredVoice() {
  if (!speechSupported()) return null;
  const voices = speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;
  const english = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
  const pool = english.length ? english : voices;
  // Prefer an on-device voice: cloud-based ones silently produce no audio at all
  // on restricted/offline networks, with no error to catch.
  return pool.find((v) => v.localService) || pool[0];
}

if (speechSupported()) {
  cachedVoice = pickPreferredVoice();
  if (cachedVoice) voicesReady = true;
  speechSynthesis.addEventListener('voiceschanged', () => {
    if (!voicesReady) {
      cachedVoice = pickPreferredVoice();
      voicesReady = true;
    }
  });
}

function speak(text, options) {
  if (!speechSupported() || !text) return;
  const opts = options || {};
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = opts.pitch != null ? opts.pitch : 1.0;
  utterance.rate = opts.rate != null ? opts.rate : 0.95;
  utterance.volume = 1.0;
  if (cachedVoice) utterance.voice = cachedVoice;
  utterance.onerror = (e) => console.warn('Speech synthesis failed:', e.error);
  // Chrome has a long-standing bug where speak() called synchronously right after
  // cancel() is silently dropped (and can wedge all future speech). A tiny delay dodges it.
  setTimeout(() => speechSynthesis.speak(utterance), 30);
}

function speakWord(word) {
  speak(word, { pitch: 1.0, rate: 0.9 });
}

function speakLetter(letter) {
  speak(letter, { pitch: 1.0, rate: 0.85 });
}

function speakPraise() {
  const phrase = PRAISE_PHRASES[Math.floor(Math.random() * PRAISE_PHRASES.length)];
  speak(phrase, { pitch: 1.4, rate: 1.15 });
  return phrase;
}

function speakGentle(text) {
  speak(text, { pitch: 0.95, rate: 0.95 });
}
