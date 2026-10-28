// Full-Featured Real-Time Server for The Floor Toronto
// Built with pure Node.js standard library - zero external dependencies!

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

// Load initial game packs
let sampleLandmarks = [];
let iceCreamGame = null;
let countriesGame = null;
let hairstylesGame = null;
let watchBrandsGame = null;
let dogBreedsGame = null;
let tennisGame = null;
let marvelGame = null;

try {
  sampleLandmarks = require('./sample-data.js');
} catch (e) {
  console.warn('Could not load sample-data.js', e.message);
}

try {
  marvelGame = require('./games/marvel-characters.js');
} catch (e) {
  console.warn('Could not load marvel-characters.js', e.message);
}

try {
  iceCreamGame = require('./games/ice-cream-flavours.js');
} catch (e) {
  console.warn('Could not load ice-cream-flavours.js', e.message);
}

try {
  countriesGame = require('./games/countries.js');
} catch (e) {
  console.warn('Could not load countries.js', e.message);
}

try {
  hairstylesGame = require('./games/hairstyles.js');
} catch (e) {
  console.warn('Could not load hairstyles.js', e.message);
}

try {
  watchBrandsGame = require('./games/watch-brands.js');
} catch (e) {
  console.warn('Could not load watch-brands.js', e.message);
}

try {
  dogBreedsGame = require('./games/dog-breeds.js');
} catch (e) {
  console.warn('Could not load dog-breeds.js', e.message);
}

try {
  tennisGame = require('./games/tennis.js');
} catch (e) {
  console.warn('Could not load tennis.js', e.message);
}

// Authoritative Server Game State
const state = {
  title: iceCreamGame ? iceCreamGame.title : "Ice Cream Flavours",
  gameId: iceCreamGame ? iceCreamGame.id : "ice-cream-flavours",
  p1: { name: "Player 1", timeRemaining: 45, maxTime: 45 },
  p2: { name: "Player 2", timeRemaining: 45, maxTime: 45 },
  activePlayer: 1, // 1 or 2
  status: 'ready', // 'ready' | 'countdown' | 'running' | 'paused' | 'gameover'
  countdownVal: 0,
  isPassing: false,
  passRemaining: 0,
  passedAnswer: '',
  isCorrect: false,
  correctAnswer: '',
  lastCorrectAnswer: '',
  clues: iceCreamGame ? [...iceCreamGame.clues] : [],
  clueIndex: 0,
  roundTime: 45,
  passPenaltySeconds: 3,
  winner: null,
  territory: null,
  activeChallenger: null,
  adjacentDefenders: [],
  isReigningWinner: false,
  duelTerritoryResolved: false,
  lastTickTime: null,
  lastEvent: null
};

let countdownTimer = null;
let passTimer = null;
let correctTimer = null;

// Connected SSE Clients (Players and Hosts)
const sseClients = new Set();

function sendSse(payload) {
  const dataStr = `data: ${JSON.stringify(payload)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(dataStr);
    } catch (e) {
      sseClients.delete(res);
    }
  }
}

// Broadcast Full Clue & Game State (when clue, status, or game changes)
function broadcastClueState(eventType = 'clue_sync') {
  const currentClue = state.clues[state.clueIndex] || null;
  const nextClue = state.clues[(state.clueIndex + 1) % state.clues.length] || null;
  const isPromptHidden = (state.status === 'ready' || state.status === 'countdown' || state.isPassing || state.isCorrect);

  const payload = {
    eventType,
    title: state.title,
    gameId: state.gameId,
    p1: state.p1,
    p2: state.p2,
    activePlayer: state.activePlayer,
    status: state.status,
    countdownVal: state.countdownVal,
    isPassing: state.isPassing,
    passRemaining: state.passRemaining,
    passedAnswer: state.isPassing ? (state.passedAnswer || (currentClue ? currentClue.answer : '')) : '',
    isCorrect: state.isCorrect,
    correctAnswer: state.isCorrect ? (state.correctAnswer || (currentClue ? currentClue.answer : '')) : '',
    lastCorrectAnswer: '', // When each next prompt is displayed, previous answer is hidden
    clueIndex: state.clueIndex,
    cluesCount: state.clues.length,
    // Stable clue pairings for host and players:
    promptAnswer: currentClue ? currentClue.answer : '',
    promptId: currentClue ? currentClue.id : '',
    promptImage: isPromptHidden ? '' : (currentClue ? currentClue.image : ''),
    nextAnswer: nextClue ? nextClue.answer : '',
    winner: state.winner,
    territory: state.territory,
    activeChallenger: state.activeChallenger,
    adjacentDefenders: state.adjacentDefenders,
    isReigningWinner: state.isReigningWinner || false,
    isFloorConquered: state.isFloorConquered || false,
    grandChampion: state.grandChampion || null,
    passPenaltySeconds: state.passPenaltySeconds
  };

  sendSse(payload);
}

// Resolves duel outcome on the Floor Territory grid:
// The loser is eliminated from the territory, and the winner claims all of the loser's squares.
function resolveDuelTerritory() {
  if (state.duelTerritoryResolved) return;
  if (!state.territory || !state.territory.players || !state.territory.grid) return;

  const winnerNum = state.winner; // 1 or 2
  const winnerInfo = winnerNum === 1 ? state.p1 : state.p2;
  const loserInfo = winnerNum === 1 ? state.p2 : state.p1;

  if (!winnerInfo || !loserInfo) return;

  const winnerPlayer = state.territory.players.find(p => 
    (winnerInfo.id && p.id === winnerInfo.id) || 
    p.name.trim().toLowerCase() === winnerInfo.name.trim().toLowerCase()
  );
  const loserPlayer = state.territory.players.find(p => 
    (loserInfo.id && p.id === loserInfo.id) || 
    p.name.trim().toLowerCase() === loserInfo.name.trim().toLowerCase()
  );

  if (!winnerPlayer || !loserPlayer) {
    console.warn('[Territory] Winner or loser contestant not found in territory roster:', winnerInfo.name, loserInfo.name);
    return;
  }

  // Category Inheritance Rule:
  // - If challenger wins (winnerNum === 1): challenger keeps their original category!
  // - If defender wins (winnerNum === 2): defender adopts the category of the challenger!
  const isChallengerWinner = (winnerNum === 1);
  if (!isChallengerWinner) {
    const prevCat = winnerPlayer.categoryTitle || winnerPlayer.category;
    winnerPlayer.category = loserPlayer.category;
    winnerPlayer.categoryTitle = loserPlayer.categoryTitle;
    console.log(`[Territory] Defender ${winnerPlayer.name} won and adopted challenger ${loserPlayer.name}'s category: ${winnerPlayer.categoryTitle || winnerPlayer.category} (was ${prevCat})`);
  } else {
    console.log(`[Territory] Challenger ${winnerPlayer.name} won and retains original category: ${winnerPlayer.categoryTitle || winnerPlayer.category}`);
  }

  // 1. All squares belonging to loser on the grid are conquered by the winner
  state.territory.grid.forEach(sq => {
    if (sq.playerId === loserPlayer.id || sq.playerName.trim().toLowerCase() === loserPlayer.name.trim().toLowerCase()) {
      sq.playerId = winnerPlayer.id;
      sq.playerName = winnerPlayer.name;
      sq.playerCategory = winnerPlayer.category;
      sq.playerCategoryTitle = winnerPlayer.categoryTitle;
      sq.color = winnerPlayer.color;
    } else if (sq.playerId === winnerPlayer.id) {
      sq.playerCategory = winnerPlayer.category;
      sq.playerCategoryTitle = winnerPlayer.categoryTitle;
    }
  });

  // 2. Remove loser from territory players roster
  state.territory.players = state.territory.players.filter(p => 
    p.id !== loserPlayer.id && 
    p.name.trim().toLowerCase() !== loserPlayer.name.trim().toLowerCase()
  );

  // 3. Update winner's territory count
  const ownedCount = state.territory.grid.filter(sq => sq.playerId === winnerPlayer.id).length;
  winnerPlayer.territoryCount = ownedCount;
  winnerPlayer.hasDueled = true;

  const isFloorConquered = (state.territory.players.length === 1 || ownedCount === state.territory.grid.length);
  if (isFloorConquered) {
    state.isFloorConquered = true;
    state.grandChampion = {
      id: winnerPlayer.id,
      name: winnerPlayer.name,
      category: winnerPlayer.category,
      categoryTitle: winnerPlayer.categoryTitle,
      color: winnerPlayer.color,
      territoryCount: ownedCount
    };
    console.log(`[GRAND CHAMPION] 🏆 ${winnerPlayer.name} has captured the ENTIRE FLOOR! (100% of ${ownedCount} squares)`);
  } else {
    state.isFloorConquered = false;
    state.grandChampion = null;
  }

  state.duelTerritoryResolved = true;
  console.log(`[Territory] Duel resolved: ${winnerPlayer.name} takes the floor! ${loserPlayer.name} eliminated. ${winnerPlayer.name} now holds ${ownedCount} squares. Remaining contestants: ${state.territory.players.length}`);
}

// High-Precision Server Clock Loop (ticks every 100ms)
setInterval(() => {
  if (state.status === 'running') {
    if (state.isCorrect) {
      // Clocks are paused during the brief correct reveal
      state.lastTickTime = null;
      return;
    }
    const now = Date.now();
    if (!state.lastTickTime) {
      state.lastTickTime = now;
    }
    const deltaSec = (now - state.lastTickTime) / 1000;
    state.lastTickTime = now;

    const player = state.activePlayer === 1 ? state.p1 : state.p2;
    player.timeRemaining = Math.max(0, player.timeRemaining - deltaSec);

    // Timeout (Game Over)
    if (player.timeRemaining <= 0) {
      state.status = 'gameover';
      state.winner = state.activePlayer === 1 ? 2 : 1;
      state.lastTickTime = null;
      resolveDuelTerritory();
      broadcastClueState('timeout');
      return;
    }

    // Lightweight timer tick ONLY (NEVER touches or modifies prompt/answer):
    sendSse({
      eventType: 'tick',
      p1Time: state.p1.timeRemaining,
      p2Time: state.p2.timeRemaining,
      activePlayer: state.activePlayer
    });
  } else {
    state.lastTickTime = null;
  }
}, 100);

// 3-Second Start Countdown Engine
function startDuelCountdown() {
  if (countdownTimer) clearInterval(countdownTimer);
  if (passTimer) clearInterval(passTimer);
  if (correctTimer) clearTimeout(correctTimer);
  countdownTimer = null;
  passTimer = null;
  correctTimer = null;
  state.isPassing = false;
  state.passRemaining = 0;
  state.passedAnswer = '';
  state.isCorrect = false;
  state.correctAnswer = '';
  state.lastCorrectAnswer = '';
  state.status = 'countdown';
  state.countdownVal = 3;
  broadcastClueState('countdown_start');

  countdownTimer = setInterval(() => {
    state.countdownVal--;
    if (state.countdownVal > 0) {
      sendSse({
        eventType: 'countdown_tick',
        countdownVal: state.countdownVal,
        status: 'countdown'
      });
    } else {
      clearInterval(countdownTimer);
      countdownTimer = null;
      state.status = 'running';
      state.countdownVal = 0;
      state.lastTickTime = Date.now();
      broadcastClueState('start');
    }
  }, 1000);
}

// Territory Adjacency Helper: finds competitors whose squares share an orthogonal edge with challenger
function getAdjacentCompetitors(challengerId, territory) {
  if (!territory || !territory.grid || !territory.players) return [];
  const cols = territory.cols;
  const rows = territory.rows;
  const challengerSquares = territory.grid.filter(sq => sq.playerId === challengerId);
  if (challengerSquares.length === 0) return [];

  const map = new Map();
  challengerSquares.forEach(cs => {
    const r = Math.floor(cs.squareIndex / cols);
    const c = cs.squareIndex % cols;
    const neighbors = [
      { r: r - 1, c: c },
      { r: r + 1, c: c },
      { r: r, c: c - 1 },
      { r: r, c: c + 1 }
    ];
    neighbors.forEach(n => {
      if (n.r >= 0 && n.r < rows && n.c >= 0 && n.c < cols) {
        const neighborIdx = n.r * cols + n.c;
        const neighborSq = territory.grid[neighborIdx];
        if (neighborSq && neighborSq.playerId && neighborSq.playerId !== challengerId) {
          const competitor = territory.players.find(p => p.id === neighborSq.playerId);
          if (competitor && competitor.active !== false) {
            if (!map.has(competitor.id)) {
              map.set(competitor.id, {
                id: competitor.id,
                name: competitor.name,
                category: competitor.category || '',
                categoryTitle: competitor.categoryTitle || competitor.category || '',
                color: competitor.color,
                territoryCount: competitor.territoryCount || 1,
                squareIndices: []
              });
            }
            map.get(competitor.id).squareIndices.push(neighborIdx);
          }
        }
      }
    });
  });

  // Fallback to diagonal if no orthogonal neighbors
  if (map.size === 0) {
    challengerSquares.forEach(cs => {
      const r = Math.floor(cs.squareIndex / cols);
      const c = cs.squareIndex % cols;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            const idx = nr * cols + nc;
            const sq = territory.grid[idx];
            if (sq && sq.playerId && sq.playerId !== challengerId) {
              const comp = territory.players.find(p => p.id === sq.playerId);
              if (comp && comp.active !== false && !map.has(comp.id)) {
                map.set(comp.id, {
                  id: comp.id,
                  name: comp.name,
                  category: comp.category || '',
                  categoryTitle: comp.categoryTitle || comp.category || '',
                  color: comp.color,
                  territoryCount: comp.territoryCount || 1,
                  squareIndices: [idx]
                });
              }
            }
          }
        }
      }
    });
  }

  return Array.from(map.values());
}

// Floor Randomizer Helper:
// The randomizer can only land on players that have 1 territory and have not already dueled.
function selectRandomChallengerFromFloor(territory) {
  if (!territory || !territory.players || territory.players.length < 2) return null;
  const activePlayers = territory.players.filter(p => p.active !== false);
  if (activePlayers.length < 2) return null;

  // Rule: "The randomizer can only land on players that have 1 territory. It cannot select players who have already dueled"
  const eligible1Territory = activePlayers.filter(p => (p.territoryCount || 1) === 1 && !p.hasDueled);

  let candidatePool = eligible1Territory;
  if (candidatePool.length === 0) {
    // If all remaining 1-territory contestants have dueled, fallback to 1-territory
    candidatePool = activePlayers.filter(p => (p.territoryCount || 1) === 1);
  }
  if (candidatePool.length === 0) {
    // Endgame fallback: all active players
    candidatePool = activePlayers;
  }

  // Prefer candidates with adjacent competitors to challenge
  const withNeighbors = candidatePool.filter(p => getAdjacentCompetitors(p.id, territory).length > 0);
  const finalPool = withNeighbors.length > 0 ? withNeighbors : candidatePool;

  const chosen = finalPool[Math.floor(Math.random() * finalPool.length)];
  return chosen;
}

// Helper to switch active category into server state
function loadCategoryIntoState(gameId) {
  if (!gameId) return false;
  const id = String(gameId).toLowerCase().trim();

  if (id === 'marvel-characters' && marvelGame) {
    state.title = marvelGame.title;
    state.gameId = marvelGame.id;
    state.clues = [...marvelGame.clues];
    state.roundTime = marvelGame.defaultTimer || 45;
  } else if (id === 'tennis' && tennisGame) {
    state.title = tennisGame.title;
    state.gameId = tennisGame.id;
    state.clues = [...tennisGame.clues];
    state.roundTime = tennisGame.defaultTimer || 45;
  } else if (id === 'dog-breeds' && dogBreedsGame) {
    state.title = dogBreedsGame.title;
    state.gameId = dogBreedsGame.id;
    state.clues = [...dogBreedsGame.clues];
    state.roundTime = dogBreedsGame.defaultTimer || 45;
  } else if (id === 'watch-brands' && watchBrandsGame) {
    state.title = watchBrandsGame.title;
    state.gameId = watchBrandsGame.id;
    state.clues = [...watchBrandsGame.clues];
    state.roundTime = watchBrandsGame.defaultTimer || 45;
  } else if (id === 'hairstyles' && hairstylesGame) {
    state.title = hairstylesGame.title;
    state.gameId = hairstylesGame.id;
    state.clues = [...hairstylesGame.clues];
    state.roundTime = hairstylesGame.defaultTimer || 45;
  } else if (id === 'countries' && countriesGame) {
    state.title = countriesGame.title;
    state.gameId = countriesGame.id;
    state.clues = [...countriesGame.clues];
    state.roundTime = countriesGame.defaultTimer || 45;
  } else if (id === 'toronto-landmarks') {
    state.title = "Landmarks of Toronto";
    state.gameId = 'toronto-landmarks';
    state.clues = [...sampleLandmarks];
    state.roundTime = 45;
  } else if (id === 'ice-cream-flavours' && iceCreamGame) {
    state.title = iceCreamGame.title;
    state.gameId = iceCreamGame.id;
    state.clues = [...iceCreamGame.clues];
    state.roundTime = iceCreamGame.defaultTimer || 45;
  } else {
    try {
      const jsonFile = path.join(__dirname, 'games', `${id}.json`);
      if (fs.existsSync(jsonFile)) {
        const parsed = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
        state.title = parsed.title;
        state.gameId = parsed.id;
        state.clues = [...parsed.clues];
        state.roundTime = parsed.defaultTimer || 45;
      }
    } catch (e) {
      console.warn('Could not load game from json', id, e.message);
      return false;
    }
  }

  state.p1.maxTime = state.roundTime;
  state.p1.timeRemaining = state.roundTime;
  state.p2.maxTime = state.roundTime;
  state.p2.timeRemaining = state.roundTime;
  console.log(`[Category Loaded for Duel] ${state.title} (${state.clues.length} clues)`);
  return true;
}

// Host Command Processor
function handleHostCommand(cmd, payload = {}) {
  if (cmd === 'start_duel' || cmd === 'start_game') {
    if (state.status === 'ready') {
      startDuelCountdown();
      return;
    } else if (state.status === 'paused') {
      state.status = 'running';
      state.lastTickTime = Date.now();
      broadcastClueState('resume');
      return;
    }
  }
  else if (cmd === 'correct') {
    if (state.status === 'gameover') return;
    if (state.status === 'ready') {
      startDuelCountdown();
      return;
    }
    if (state.status === 'paused') {
      state.status = 'running';
      state.lastTickTime = Date.now();
      broadcastClueState('resume');
      return;
    }
    if (state.status === 'countdown' || state.isPassing || state.isCorrect) {
      return; // Ignore correct action during countdown, pass, or correct reveal
    }

    // 1. Capture the answer of the clue that was just answered correctly
    const currentClue = state.clues[state.clueIndex] || null;
    const ans = currentClue ? currentClue.answer : '';
    state.isCorrect = true;
    state.correctAnswer = ans;
    state.lastCorrectAnswer = ans;
    state.lastTickTime = null; // Pause clock during 1s correct answer display

    sendSse({
      eventType: 'correct_start',
      isCorrect: true,
      correctAnswer: ans,
      activePlayer: state.activePlayer,
      clueIndex: state.clueIndex,
      promptAnswer: ans,
      promptImage: currentClue ? currentClue.image : ''
    });

    if (correctTimer) clearTimeout(correctTimer);
    correctTimer = setTimeout(() => {
      correctTimer = null;
      if (state.status !== 'running') {
        state.isCorrect = false;
        state.correctAnswer = '';
        return;
      }
      state.isCorrect = false;
      state.correctAnswer = '';
      state.lastCorrectAnswer = ''; // When next prompt is displayed, hide previous answer!

      // Switch active player turn
      state.activePlayer = state.activePlayer === 1 ? 2 : 1;
      // Advance to next prompt!
      if (state.clues.length > 0) {
        state.clueIndex = (state.clueIndex + 1) % state.clues.length;
      }
      state.lastTickTime = Date.now();
      broadcastClueState('correct_complete');
    }, 1000);
  } 
  else if (cmd === 'pass') {
    if (state.status !== 'running' || state.isPassing || state.isCorrect) return;

    if (correctTimer) clearTimeout(correctTimer);
    correctTimer = null;
    state.isCorrect = false;
    state.correctAnswer = '';

    // DO NOT subtract 3 seconds immediately from clock!
    // Clock continues to tick down naturally during the 3-second recovery delay.
    // The current prompt is removed immediately, the answer is displayed to all players,
    // and 3 seconds later the next prompt is introduced.
    const currentClue = state.clues[state.clueIndex] || null;
    state.passedAnswer = currentClue ? currentClue.answer : '';
    state.lastCorrectAnswer = '';
    state.isPassing = true;
    state.passRemaining = 3;
    broadcastClueState('pass_start');

    let passCount = 3;
    if (passTimer) clearInterval(passTimer);
    passTimer = setInterval(() => {
      if (state.status !== 'running') {
        clearInterval(passTimer);
        passTimer = null;
        state.isPassing = false;
        state.passRemaining = 0;
        state.passedAnswer = '';
        state.lastCorrectAnswer = '';
        return;
      }
      passCount--;
      if (passCount > 0) {
        state.passRemaining = passCount;
        sendSse({
          eventType: 'pass_tick',
          isPassing: true,
          passRemaining: passCount,
          passedAnswer: state.passedAnswer,
          lastCorrectAnswer: ''
        });
      } else {
        clearInterval(passTimer);
        passTimer = null;
        state.isPassing = false;
        state.passRemaining = 0;
        state.passedAnswer = '';
        state.lastCorrectAnswer = '';
        // 3 seconds later: introduce next prompt and hide previous answer!
        if (state.clues.length > 0) {
          state.clueIndex = (state.clueIndex + 1) % state.clues.length;
        }
        broadcastClueState('pass_complete');
      }
    }, 1000);
  } 
  else if (cmd === 'toggle_pause') {
    if (state.status === 'gameover') return;
    if (state.status === 'countdown') {
      if (countdownTimer) clearInterval(countdownTimer);
      countdownTimer = null;
      state.status = 'ready';
      state.countdownVal = 0;
      broadcastClueState('reset');
      return;
    }
    if (state.status === 'running') {
      state.status = 'paused';
      state.lastTickTime = null;
      broadcastClueState('pause');
    } else {
      state.status = 'running';
      state.lastTickTime = Date.now();
      broadcastClueState('resume');
    }
  } 
  else if (cmd === 'reset') {
    if (countdownTimer) clearInterval(countdownTimer);
    if (passTimer) clearInterval(passTimer);
    if (correctTimer) clearTimeout(correctTimer);
    countdownTimer = null;
    passTimer = null;
    correctTimer = null;
    state.countdownVal = 0;
    state.isPassing = false;
    state.passRemaining = 0;
    state.passedAnswer = '';
    state.isCorrect = false;
    state.correctAnswer = '';
    state.lastCorrectAnswer = '';
    state.status = 'ready';
    state.p1.timeRemaining = state.roundTime;
    state.p2.timeRemaining = state.roundTime;
    state.activePlayer = 1;
    state.clueIndex = 0;
    state.winner = null;
    state.lastTickTime = null;
    broadcastClueState('reset');
  } 
  else if (cmd === 'select_game') {
    if (countdownTimer) clearInterval(countdownTimer);
    if (passTimer) clearInterval(passTimer);
    if (correctTimer) clearTimeout(correctTimer);
    countdownTimer = null;
    passTimer = null;
    correctTimer = null;
    state.countdownVal = 0;
    state.isPassing = false;
    state.passRemaining = 0;
    state.isCorrect = false;
    state.correctAnswer = '';
    state.lastCorrectAnswer = '';
    loadCategoryIntoState(payload.gameId);
    state.status = 'ready';
    state.p1.timeRemaining = state.roundTime;
    state.p2.timeRemaining = state.roundTime;
    state.clueIndex = 0;
    state.winner = null;
    broadcastClueState('game_change');
  } 
  else if (cmd === 'sync_custom_game') {
    if (payload.game && Array.isArray(payload.game.clues)) {
      if (countdownTimer) clearInterval(countdownTimer);
      if (passTimer) clearInterval(passTimer);
      if (correctTimer) clearTimeout(correctTimer);
      countdownTimer = null;
      passTimer = null;
      correctTimer = null;
      state.isPassing = false;
      state.passRemaining = 0;
      state.isCorrect = false;
      state.correctAnswer = '';
      state.lastCorrectAnswer = '';
      state.title = payload.game.title || "Custom Duel";
      state.gameId = payload.game.id || 'custom-' + Date.now();
      state.clues = [...payload.game.clues];
      state.roundTime = payload.game.defaultTimer || 45;
      state.p1.maxTime = state.roundTime;
      state.p1.timeRemaining = state.roundTime;
      state.p2.maxTime = state.roundTime;
      state.p2.timeRemaining = state.roundTime;
      state.status = 'ready';
      state.clueIndex = 0;
      state.winner = null;
      broadcastClueState('game_change');
    }
  }
  else if (cmd === 'sync_territory') {
    if (payload.territory) {
      state.territory = payload.territory;
      state.activeChallenger = null;
      state.adjacentDefenders = [];
      state.isReigningWinner = false;
      state.isFloorConquered = false;
      state.grandChampion = null;
      state.duelTerritoryResolved = false;
      broadcastClueState('territory_update');
    }
  }
  else if (cmd === 'trigger_randomizer') {
    if (!state.territory || !state.territory.players || state.territory.players.length < 2) {
      console.warn('Cannot trigger randomizer: territory has fewer than 2 contestants');
      return;
    }
    const chosenChallenger = selectRandomChallengerFromFloor(state.territory);
    if (!chosenChallenger) {
      console.warn('Cannot trigger randomizer: no eligible contestants');
      return;
    }
    const adjacent = getAdjacentCompetitors(chosenChallenger.id, state.territory);

    state.activeChallenger = chosenChallenger;
    state.adjacentDefenders = adjacent;
    state.isReigningWinner = false;

    sendSse({
      eventType: 'randomizer_spin',
      challenger: chosenChallenger,
      adjacentDefenders: adjacent,
      territory: state.territory
    });
  }
  else if (cmd === 'select_defender') {
    const challengerName = payload.challengerName || (state.activeChallenger ? state.activeChallenger.name : 'Player 1');
    const defenderName = payload.defenderName || (payload.defender ? payload.defender.name : 'Player 2');
    let challengerId = payload.challengerId || (state.activeChallenger ? state.activeChallenger.id : null);
    let defenderId = payload.defenderId || (payload.defender ? payload.defender.id : null);

    let challengerPlayer = null;
    let defenderPlayer = null;

    if (state.territory && state.territory.players) {
      challengerPlayer = state.territory.players.find(p => 
        (challengerId && p.id === challengerId) || 
        p.name.trim().toLowerCase() === String(challengerName).trim().toLowerCase()
      );
      defenderPlayer = state.territory.players.find(p => 
        (defenderId && p.id === defenderId) || 
        p.name.trim().toLowerCase() === String(defenderName).trim().toLowerCase()
      );

      if (challengerPlayer) {
        challengerId = challengerPlayer.id;
        challengerPlayer.hasDueled = true;
      }
      if (defenderPlayer) {
        defenderId = defenderPlayer.id;
        defenderPlayer.hasDueled = true;
      }
    }

    // Rule: The duel will be on the defender's category!
    const defenderCat = (defenderPlayer && (defenderPlayer.category || defenderPlayer.categoryId)) || payload.category;
    if (defenderCat) {
      loadCategoryIntoState(defenderCat);
    }

    if (countdownTimer) clearInterval(countdownTimer);
    if (passTimer) clearInterval(passTimer);
    if (correctTimer) clearTimeout(correctTimer);
    countdownTimer = null;
    passTimer = null;
    correctTimer = null;
    state.countdownVal = 0;
    state.isPassing = false;
    state.passRemaining = 0;
    state.passedAnswer = '';
    state.isCorrect = false;
    state.correctAnswer = '';
    state.lastCorrectAnswer = '';

    // Challenger is Player 1
    state.p1.id = challengerId;
    state.p1.name = challengerPlayer ? challengerPlayer.name : String(challengerName).trim();
    state.p1.category = challengerPlayer ? (challengerPlayer.category || '') : '';
    state.p1.categoryTitle = challengerPlayer ? (challengerPlayer.categoryTitle || challengerPlayer.category || '') : '';
    state.p1.timeRemaining = state.roundTime;

    // Defender is Player 2
    state.p2.id = defenderId;
    state.p2.name = defenderPlayer ? defenderPlayer.name : String(defenderName).trim();
    state.p2.category = defenderPlayer ? (defenderPlayer.category || '') : '';
    state.p2.categoryTitle = defenderPlayer ? (defenderPlayer.categoryTitle || defenderPlayer.category || '') : '';
    state.p2.timeRemaining = state.roundTime;

    // Rule: The challenger will be the first player to go in the duel
    state.activePlayer = 1;
    state.clueIndex = 0;
    state.winner = null;
    state.status = 'ready';
    state.lastTickTime = null;
    state.activeChallenger = null;
    state.adjacentDefenders = [];
    state.isReigningWinner = false;
    state.duelTerritoryResolved = false;

    console.log(`[Duel Prepared] Challenger: ${state.p1.name} vs Defender: ${state.p2.name} on DEFENDER CATEGORY: "${state.title}" (Challenger plays first)`);
    broadcastClueState('duel_players_set');
  }
  else if (cmd === 'cancel_challenger') {
    state.activeChallenger = null;
    state.adjacentDefenders = [];
    state.isReigningWinner = false;
    sendSse({
      eventType: 'challenger_cancelled',
      territory: state.territory
    });
  }
  else if (cmd === 'return_to_territory') {
    if (countdownTimer) clearInterval(countdownTimer);
    if (passTimer) clearInterval(passTimer);
    if (correctTimer) clearTimeout(correctTimer);
    countdownTimer = null;
    passTimer = null;
    correctTimer = null;
    state.countdownVal = 0;
    state.isPassing = false;
    state.passRemaining = 0;
    state.passedAnswer = '';
    state.isCorrect = false;
    state.correctAnswer = '';
    state.lastCorrectAnswer = '';

    // Identify the winner of the duel that just concluded
    let winnerPlayer = null;
    if (state.winner && state.territory && state.territory.players) {
      const winnerInfo = state.winner === 1 ? state.p1 : state.p2;
      winnerPlayer = state.territory.players.find(p => 
        (winnerInfo.id && p.id === winnerInfo.id) || 
        p.name.trim().toLowerCase() === winnerInfo.name.trim().toLowerCase()
      );
    }

    state.status = 'ready';
    state.clueIndex = 0;
    state.activePlayer = 1;
    state.winner = null;
    state.lastTickTime = null;
    state.duelTerritoryResolved = false;
    state.p1.timeRemaining = state.roundTime;
    state.p2.timeRemaining = state.roundTime;

    if (winnerPlayer && state.territory.players.length > 1) {
      state.activeChallenger = winnerPlayer;
      state.adjacentDefenders = getAdjacentCompetitors(winnerPlayer.id, state.territory);
      state.isReigningWinner = true;
    } else {
      state.activeChallenger = null;
      state.adjacentDefenders = [];
      state.isReigningWinner = false;
    }

    const isFloorConquered = Boolean(state.isFloorConquered || (state.territory && state.territory.players.length === 1));
    const grandChampion = state.grandChampion || ((state.territory && state.territory.players.length === 1) ? state.territory.players[0] : null);

    sendSse({
      eventType: 'return_to_territory',
      territory: state.territory,
      activeChallenger: state.activeChallenger,
      adjacentDefenders: state.adjacentDefenders,
      isReigningWinner: state.isReigningWinner,
      isFloorConquered: isFloorConquered,
      grandChampion: grandChampion,
      status: 'ready'
    });
  }
  else if (cmd === 'return_to_floor') {
    const chosenChallenger = selectRandomChallengerFromFloor(state.territory);
    if (!chosenChallenger) {
      console.warn('Cannot return to floor: no eligible contestants');
      return;
    }
    const adjacent = getAdjacentCompetitors(chosenChallenger.id, state.territory);
    state.activeChallenger = chosenChallenger;
    state.adjacentDefenders = adjacent;
    state.isReigningWinner = false;

    sendSse({
      eventType: 'randomizer_spin',
      challenger: chosenChallenger,
      adjacentDefenders: adjacent,
      territory: state.territory
    });
  }
  else if (cmd === 'set_clock') {
    if (payload.p1Time !== undefined) state.p1.timeRemaining = Math.max(0, Number(payload.p1Time));
    if (payload.p2Time !== undefined) state.p2.timeRemaining = Math.max(0, Number(payload.p2Time));
    sendSse({
      eventType: 'tick',
      p1Time: state.p1.timeRemaining,
      p2Time: state.p2.timeRemaining,
      activePlayer: state.activePlayer
    });
  }
  else if (cmd === 'set_duel_players') {
    if (countdownTimer) clearInterval(countdownTimer);
    if (passTimer) clearInterval(passTimer);
    if (correctTimer) clearTimeout(correctTimer);
    countdownTimer = null;
    passTimer = null;
    correctTimer = null;
    state.countdownVal = 0;
    state.isPassing = false;
    state.passRemaining = 0;
    state.passedAnswer = '';
    state.isCorrect = false;
    state.correctAnswer = '';
    state.lastCorrectAnswer = '';
    if (payload.p1Name) {
      state.p1.name = String(payload.p1Name).trim();
    }
    if (payload.p2Name) {
      state.p2.name = String(payload.p2Name).trim();
    }
    if (payload.gameId && payload.gameId !== state.gameId) {
      const gId = payload.gameId;
      if (gId === 'marvel-characters' && marvelGame) {
        state.title = marvelGame.title;
        state.gameId = marvelGame.id;
        state.clues = [...marvelGame.clues];
      } else if (gId === 'tennis' && tennisGame) {
        state.title = tennisGame.title;
        state.gameId = tennisGame.id;
        state.clues = [...tennisGame.clues];
      } else if (gId === 'dog-breeds' && dogBreedsGame) {
        state.title = dogBreedsGame.title;
        state.gameId = dogBreedsGame.id;
        state.clues = [...dogBreedsGame.clues];
      } else if (gId === 'watch-brands' && watchBrandsGame) {
        state.title = watchBrandsGame.title;
        state.gameId = watchBrandsGame.id;
        state.clues = [...watchBrandsGame.clues];
      } else if (gId === 'hairstyles' && hairstylesGame) {
        state.title = hairstylesGame.title;
        state.gameId = hairstylesGame.id;
        state.clues = [...hairstylesGame.clues];
      } else if (gId === 'countries' && countriesGame) {
        state.title = countriesGame.title;
        state.gameId = countriesGame.id;
        state.clues = [...countriesGame.clues];
      } else if (gId === 'toronto-landmarks') {
        state.title = "Landmarks of Toronto";
        state.gameId = 'toronto-landmarks';
        state.clues = [...sampleLandmarks];
      } else if (gId === 'ice-cream-flavours' && iceCreamGame) {
        state.title = iceCreamGame.title;
        state.gameId = iceCreamGame.id;
        state.clues = [...iceCreamGame.clues];
      }
    }
    state.p1.timeRemaining = state.roundTime;
    state.p2.timeRemaining = state.roundTime;
    state.activePlayer = 1;
    state.clueIndex = 0;
    state.winner = null;
    state.status = 'ready';
    state.lastTickTime = null;
    state.activeChallenger = null;
    state.adjacentDefenders = [];
    broadcastClueState('duel_players_set');
  }
}

// MIME Types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  return addresses;
}

// HTTP Server
const server = http.createServer((req, res) => {
  // Enable CORS for mobile browsers & local network devices
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  // --- API: Server-Sent Events (SSE) Stream ---
  if (pathname === '/api/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write('\n');
    sseClients.add(res);

    // Send immediate full state on connect
    const currentClue = state.clues[state.clueIndex] || null;
    const nextClue = state.clues[(state.clueIndex + 1) % state.clues.length] || null;
    const isPromptHidden = (state.status === 'ready' || state.status === 'countdown' || state.isPassing || state.isCorrect);
    const initialData = {
      eventType: 'initial_state',
      title: state.title,
      gameId: state.gameId,
      p1: state.p1,
      p2: state.p2,
      activePlayer: state.activePlayer,
      status: state.status,
      countdownVal: state.countdownVal,
      isPassing: state.isPassing,
      passRemaining: state.passRemaining,
      passedAnswer: state.isPassing ? (state.passedAnswer || '') : '',
      isCorrect: state.isCorrect,
      correctAnswer: state.isCorrect ? (state.correctAnswer || '') : '',
      lastCorrectAnswer: '',
      clueIndex: state.clueIndex,
      cluesCount: state.clues.length,
      promptAnswer: currentClue ? currentClue.answer : '',
      promptId: currentClue ? currentClue.id : '',
      promptImage: isPromptHidden ? '' : (currentClue ? currentClue.image : ''),
      nextAnswer: nextClue ? nextClue.answer : '',
      winner: state.winner,
      territory: state.territory,
      activeChallenger: state.activeChallenger,
      adjacentDefenders: state.adjacentDefenders,
      isReigningWinner: state.isReigningWinner || false,
      isFloorConquered: state.isFloorConquered || false,
      grandChampion: state.grandChampion || null,
      passPenaltySeconds: state.passPenaltySeconds
    };
    res.write(`data: ${JSON.stringify(initialData)}\n\n`);

    req.on('close', () => {
      sseClients.delete(res);
    });
    return;
  }

  // --- API: Host Command Endpoint ---
  if (pathname === '/api/command' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        handleHostCommand(parsed.cmd, parsed);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON command' }));
      }
    });
    return;
  }

  // --- API: Territory Endpoint ---
  if (pathname === '/api/territory' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(state.territory || {}));
    return;
  }

  // --- API: State Snapshot Endpoint ---
  if (pathname === '/api/state' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(state));
    return;
  }

  // --- Static File Serving ---
  let reqPath = decodeURI(pathname);
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, reqPath);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIpAddresses();
  const primaryIp = ips.length > 0 ? ips[0] : 'localhost';

  console.log('========================================================');
  console.log('       🍁 THE FLOOR TORONTO - GAME SERVER ONLINE 🍁      ');
  console.log('========================================================');
  console.log(`📺 Player View (TV / Main Screen):`);
  console.log(`   http://localhost:${PORT}`);
  if (primaryIp !== 'localhost') {
    console.log(`   http://${primaryIp}:${PORT}`);
  }
  console.log(`\n📱 Host Controller View (Mobile Remote):`);
  console.log(`   http://${primaryIp}:${PORT}/host.html`);
  console.log('========================================================');
  console.log('Host Shortcuts (Desktop):');
  console.log('  [SPACE]  Correct answer (switches timer immediately)');
  console.log('  [TAB]    Pass (penalty & advances prompt)');
  console.log('  [ESC]    Pause / Resume game');
  console.log('  [R]      Reset round');
  console.log('========================================================\n');
});
