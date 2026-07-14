// Web Speech API wrapper: word playback, per-letter pronunciation, praise/gentle feedback.
const PRAISE_PHRASES = ['Awesome!', 'You got it!', 'Wonderful!', 'Great job!'];

// Only the URI is cached long-term, never the SpeechSynthesisVoice object itself: some
// Chrome/Edge builds invalidate previously-returned voice objects internally, so reusing
// one across calls makes every speak() after the first silently produce no audio.
let cachedVoiceURI = null;

// Utterances pending/speaking, kept referenced here so they can't be garbage collected
// mid-flight - a GC'd utterance is the classic cause of "speech works once, then never again".
const pinnedUtterances = [];

function unpinUtterance(utterance) {
  const index = pinnedUtterances.indexOf(utterance);
  if (index !== -1) pinnedUtterances.splice(index, 1);
}

// Our own "is something currently speaking" tracking, driven by onend/onerror rather than
// speechSynthesis.speaking/.pending - those flags can get stuck `true` forever on some Chrome
// builds, which then makes us call cancel() needlessly, which interrupts the very utterance
// we're about to queue.
let activeUtterance = null;

function speechSupported() {
  return 'speechSynthesis' in window;
}

function pickPreferredVoice(voices) {
  const english = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
  const pool = english.length ? english : voices;
  // Prefer an on-device voice: cloud-based ones silently produce no audio at all
  // on restricted/offline networks, with no error to catch.
  return pool.find((v) => v.localService) || pool[0];
}

// Resolves a live voice object from a freshly-fetched voice list every call.
function getCurrentVoice() {
  if (!speechSupported()) return null;
  const voices = speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  if (cachedVoiceURI) {
    const match = voices.find((v) => v.voiceURI === cachedVoiceURI);
    if (match) return match;
  }

  const picked = pickPreferredVoice(voices);
  if (picked) cachedVoiceURI = picked.voiceURI;
  return picked;
}

function speak(text, options) {
  if (!speechSupported() || !text) return;
  const opts = options || {};

  // Only cancel if we know (via our own bookkeeping) something is genuinely still
  // in flight - e.g. the player tapped another tile before the last one finished.
  if (activeUtterance) speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = opts.pitch != null ? opts.pitch : 1.0;
  utterance.rate = opts.rate != null ? opts.rate : 0.95;
  utterance.volume = 1.0;
  const voice = getCurrentVoice();
  if (voice) utterance.voice = voice;

  const clearActive = () => {
    if (activeUtterance === utterance) activeUtterance = null;
    unpinUtterance(utterance);
  };
  utterance.onend = clearActive;
  utterance.onerror = (e) => {
    console.warn('Speech synthesis failed:', e.error);
    clearActive();
  };

  activeUtterance = utterance;
  pinnedUtterances.push(utterance);
  speechSynthesis.speak(utterance);
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
