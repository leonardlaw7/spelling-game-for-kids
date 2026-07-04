// Game screen: tile rendering, blank-fill logic, answer checking, celebration.

function getCurrentWord() {
  const id = appState.playOrder[appState.currentIndex];
  return appState.words.find((w) => w.id === id);
}

function getBlankEls() {
  return document.querySelectorAll('#blanks-row .blank');
}

function startGame(difficulty, words) {
  appState.difficulty = difficulty;
  appState.words = words;
  appState.playOrder = shuffle(words.map((w) => w.id));
  appState.currentIndex = 0;
  showScreen('game');
  startWord();
}

function startWord() {
  const word = getCurrentWord();
  const msg = document.getElementById('feedback-msg');
  msg.textContent = '';
  msg.classList.remove('gentle');
  renderImage(word);
  renderBlanks(word);
  renderTiles(word);
  speakWord(word.text);
}

function renderImage(word) {
  const container = document.getElementById('word-image');
  container.innerHTML = '';
  const img = getWordImage(word);
  if (img.type === 'image') {
    const el = document.createElement('img');
    el.src = img.src;
    el.alt = '';
    container.appendChild(el);
  } else {
    const span = document.createElement('span');
    span.textContent = img.value;
    container.appendChild(span);
  }
}

function renderBlanks(word) {
  appState.attempt = new Array(word.text.length).fill(null);
  const row = document.getElementById('blanks-row');
  row.innerHTML = '';
  for (let i = 0; i < word.text.length; i++) {
    const b = document.createElement('button');
    b.className = 'blank';
    b.type = 'button';
    b.addEventListener('click', () => clearBlank(i));
    row.appendChild(b);
  }
}

function renderTiles(word) {
  const row = document.getElementById('tiles-row');
  row.innerHTML = '';
  const letters = appState.difficulty === 'easy'
    ? shuffle(word.text.split(''))
    : 'abcdefghijklmnopqrstuvwxyz'.split('');

  letters.forEach((letter) => {
    const tile = document.createElement('button');
    tile.className = 'tile';
    tile.type = 'button';
    tile.textContent = letter;
    tile.addEventListener('click', () => onTileTap(letter, tile));
    row.appendChild(tile);
  });
}

function onTileTap(letter, tileEl) {
  if (appState.difficulty === 'easy' && tileEl.classList.contains('used')) return;
  const emptyIndex = appState.attempt.findIndex((a) => a === null);
  if (emptyIndex === -1) return;

  speakLetter(letter);
  const consumeTile = appState.difficulty === 'easy';
  appState.attempt[emptyIndex] = { letter, tileEl: consumeTile ? tileEl : null };

  const blankEl = getBlankEls()[emptyIndex];
  blankEl.textContent = letter;
  blankEl.classList.add('filled');
  if (consumeTile) tileEl.classList.add('used');

  if (appState.attempt.every((a) => a !== null)) {
    checkAnswer();
  }
}

function clearBlank(index) {
  const entry = appState.attempt[index];
  if (!entry) return;
  if (entry.tileEl) entry.tileEl.classList.remove('used');
  appState.attempt[index] = null;

  const blankEl = getBlankEls()[index];
  blankEl.textContent = '';
  blankEl.classList.remove('filled');

  const msg = document.getElementById('feedback-msg');
  msg.textContent = '';
  msg.classList.remove('gentle');
}

function clearAttempt() {
  appState.attempt.forEach((entry) => {
    if (entry && entry.tileEl) entry.tileEl.classList.remove('used');
  });
  appState.attempt.fill(null);
  getBlankEls().forEach((el) => {
    el.textContent = '';
    el.classList.remove('filled');
  });
  const msg = document.getElementById('feedback-msg');
  msg.textContent = '';
  msg.classList.remove('gentle');
}

function checkAnswer() {
  const word = getCurrentWord();
  const attemptText = appState.attempt.map((a) => a.letter).join('');
  if (attemptText === word.text) {
    celebrate();
  } else {
    const msg = document.getElementById('feedback-msg');
    msg.classList.remove('gentle');
    void msg.offsetWidth;
    msg.textContent = 'Try again! 🙂';
    msg.classList.add('gentle');
    speakGentle('Try again!');
  }
}

function celebrate() {
  const overlay = document.getElementById('celebration');
  const textEl = document.getElementById('celebration-text');
  const emojiOptions = ['🎉', '⭐', '🥳', '🏆'];
  document.getElementById('celebration-emoji').textContent =
    emojiOptions[Math.floor(Math.random() * emojiOptions.length)];
  const phrase = speakPraise();
  textEl.textContent = phrase;
  spawnConfetti(overlay);
  overlay.hidden = false;
}

function spawnConfetti(overlay) {
  overlay.querySelectorAll('.confetti').forEach((el) => el.remove());
  const colors = ['#ff6f61', '#4cd97b', '#ffd166', '#4cc9f0', '#c77dff'];
  for (let i = 0; i < 18; i++) {
    const span = document.createElement('span');
    span.className = 'confetti';
    span.style.left = Math.random() * 100 + '%';
    span.style.background = colors[Math.floor(Math.random() * colors.length)];
    span.style.animationDuration = (1.5 + Math.random() * 1.2) + 's';
    span.style.animationDelay = (Math.random() * 0.4) + 's';
    overlay.appendChild(span);
  }
}

function nextWord() {
  document.getElementById('celebration').hidden = true;
  appState.currentIndex++;
  if (appState.currentIndex >= appState.playOrder.length) {
    appState.playOrder = shuffle(appState.words.map((w) => w.id));
    appState.currentIndex = 0;
  }
  startWord();
}
