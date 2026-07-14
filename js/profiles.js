// Profile selection: two hardcoded players, each with their own word list.
const PROFILE_LABELS = { dalton: 'Dalton', giselle: 'Giselle' };

function selectProfile(profileId) {
  appState.profile = profileId;
  updateProfileBadge();
  showScreen('menu');
}

function switchProfile() {
  appState.profile = null;
  appState.difficulty = null;
  appState.wordSet = null;
  appState.words = [];
  appState.playOrder = [];
  appState.currentIndex = 0;
  appState.attempt = [];
  showScreen('profile');
}

function updateProfileBadge() {
  document.getElementById('profile-name').textContent = PROFILE_LABELS[appState.profile] || '';
}
