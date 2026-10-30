// Central Game Directory Manifest for The Floor Toronto
const GAMES_DIRECTORY = [
  typeof GAME_CAR_LOGOS !== 'undefined' ? GAME_CAR_LOGOS : null,
  typeof GAME_MARVEL_CHARACTERS !== 'undefined' ? GAME_MARVEL_CHARACTERS : null,
  typeof GAME_TENNIS !== 'undefined' ? GAME_TENNIS : null,
  typeof GAME_DOG_BREEDS !== 'undefined' ? GAME_DOG_BREEDS : null,
  typeof GAME_WATCH_BRANDS !== 'undefined' ? GAME_WATCH_BRANDS : null,
  typeof GAME_COUNTRIES !== 'undefined' ? GAME_COUNTRIES : null,
  typeof GAME_HAIRSTYLES !== 'undefined' ? GAME_HAIRSTYLES : null,
  typeof GAME_ICE_CREAM !== 'undefined' ? GAME_ICE_CREAM : null,
  typeof GAME_TORONTO_LANDMARKS !== 'undefined' ? GAME_TORONTO_LANDMARKS : null
].filter(Boolean);

// Helper functions for accessing and managing games
const GameRegistry = {
  getAll: function () {
    const list = [...GAMES_DIRECTORY];
    try {
      const customSaved = localStorage.getItem('the_floor_custom_games');
      if (customSaved) {
        const parsed = JSON.parse(customSaved);
        if (Array.isArray(parsed)) {
          list.push(...parsed);
        }
      }
    } catch (e) {
      console.warn('Could not load custom games', e);
    }
    return list;
  },

  getById: function (id) {
    const all = this.getAll();
    return all.find(g => g.id === id) || null;
  },

  saveCustom: function (game) {
    try {
      const customSaved = localStorage.getItem('the_floor_custom_games');
      let parsed = customSaved ? JSON.parse(customSaved) : [];
      const idx = parsed.findIndex(g => g.id === game.id);
      if (idx >= 0) {
        parsed[idx] = game;
      } else {
        parsed.unshift(game);
      }
      localStorage.setItem('the_floor_custom_games', JSON.stringify(parsed));
    } catch (e) {
      console.warn('Could not save custom game', e);
    }
  }
};
