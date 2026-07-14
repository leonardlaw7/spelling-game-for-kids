// In-memory app state + screen navigation helper.
const appState = {
  screen: 'profile',
  profile: null,
  difficulty: null,
  wordSet: null, // section name to practice (e.g. 'This Week'), or null for all words
  words: [],
  playOrder: [],
  currentIndex: 0,
  attempt: [] // array of {letter, tileEl} or null per blank slot
};

function showScreen(name) {
  document.querySelectorAll('.screen').forEach((el) => {
    el.hidden = el.id !== 'screen-' + name;
  });
  appState.screen = name;
}
