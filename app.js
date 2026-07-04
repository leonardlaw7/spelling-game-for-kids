// Entry point: wires up navigation and initial load.
document.addEventListener('DOMContentLoaded', () => {
  migrateLegacyDataIfNeeded();

  document.querySelectorAll('#screen-profile [data-profile]').forEach((btn) => {
    btn.addEventListener('click', () => selectProfile(btn.dataset.profile));
  });

  document.getElementById('btn-switch-profile').addEventListener('click', switchProfile);

  document.getElementById('btn-play').addEventListener('click', () => {
    showScreen('difficulty');
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

function beginGame(difficulty) {
  const state = loadState(appState.profile);
  if (state.words.length === 0) {
    alert('Please add some words first!');
    renderWordList();
    resetAddForm();
    showScreen('manage');
    return;
  }
  startGame(difficulty, state.words);
}
