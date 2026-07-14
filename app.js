// Entry point: wires up navigation and initial load.
document.addEventListener('DOMContentLoaded', () => {
  migrateLegacyDataIfNeeded();

  document.querySelectorAll('#screen-profile [data-profile]').forEach((btn) => {
    btn.addEventListener('click', () => selectProfile(btn.dataset.profile));
  });

  document.getElementById('btn-switch-profile').addEventListener('click', switchProfile);

  document.getElementById('btn-play').addEventListener('click', () => {
    const state = loadState(appState.profile);
    const sections = getAvailableSections(state.words);
    if (sections.length > 1) {
      renderWordSetChoices(sections);
      showScreen('wordset');
    } else {
      appState.wordSet = null;
      showScreen('difficulty');
    }
  });

  document.getElementById('btn-manage').addEventListener('click', () => {
    renderWordList();
    resetAddForm();
    showScreen('manage');
  });

  document.querySelectorAll('.btn-home').forEach((btn) => {
    btn.addEventListener('click', () => showScreen('menu'));
  });

  document.getElementById('btn-easy').addEventListener('click', () => beginGame('easy'));
  document.getElementById('btn-hard').addEventListener('click', () => beginGame('hard'));

  document.getElementById('btn-listen').addEventListener('click', () => {
    const word = getCurrentWord();
    if (word) speakWord(word.text);
  });

  document.getElementById('btn-clear').addEventListener('click', clearAttempt);
  document.getElementById('btn-next-word').addEventListener('click', nextWord);

  initManageWordsScreen();

  showScreen('profile');
});

const WORDSET_META = {
  'This Week': { emoji: '🗓️', label: 'This Week' },
  'Recap': { emoji: '🔁', label: 'Recap' }
};

function renderWordSetChoices(sections) {
  const container = document.getElementById('wordset-choices');
  container.innerHTML = '';
  sections.forEach((section) => {
    const meta = WORDSET_META[section] || { emoji: '📝', label: section };
    const btn = document.createElement('button');
    btn.className = 'big-btn choice-btn';
    btn.type = 'button';

    const emojiSpan = document.createElement('span');
    emojiSpan.className = 'choice-emoji';
    emojiSpan.textContent = meta.emoji;
    const labelSpan = document.createElement('span');
    labelSpan.textContent = meta.label;
    btn.appendChild(emojiSpan);
    btn.appendChild(labelSpan);

    btn.addEventListener('click', () => {
      appState.wordSet = section;
      showScreen('difficulty');
    });
    container.appendChild(btn);
  });
}

function beginGame(difficulty) {
  const state = loadState(appState.profile);
  const words = appState.wordSet
    ? state.words.filter((w) => w.section === appState.wordSet)
    : state.words;

  if (words.length === 0) {
    alert('Please add some words first!');
    renderWordList();
    resetAddForm();
    showScreen('manage');
    return;
  }
  startGame(difficulty, words);
}
