// Toronto Landmarks Game Pack
const _clues = typeof TORONTO_STARTER_PACK !== 'undefined' 
  ? TORONTO_STARTER_PACK 
  : (typeof require !== 'undefined' ? require('../sample-data.js') : []);

const GAME_TORONTO_LANDMARKS = {
  id: "toronto-landmarks",
  title: "Landmarks of Toronto",
  description: "The classic Floor Toronto duel! Identify iconic Toronto landmarks, historic architecture, and local culture.",
  category: "Toronto & Canada",
  difficulty: "Mixed Classics",
  cluesCount: _clues.length,
  defaultTimer: 45,
  bannerColor: "linear-gradient(135deg, #0b192c 0%, #1e3e62 50%, #d65a31 100%)",
  clues: _clues
};

if (typeof window !== 'undefined') {
  window.GAME_TORONTO_LANDMARKS = GAME_TORONTO_LANDMARKS;
} else if (typeof global !== 'undefined') {
  global.GAME_TORONTO_LANDMARKS = GAME_TORONTO_LANDMARKS;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GAME_TORONTO_LANDMARKS;
}

