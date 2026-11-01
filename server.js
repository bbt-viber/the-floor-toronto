// Full-Featured Real-Time Server for The Floor Toronto
// Built with pure Node.js standard library - zero external dependencies!

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const GAMES_DIR = path.join(__dirname, 'games');

// Dynamic Category Registry (auto-loads all game packs from ./games)
const GAMES_MAP = new Map();

function loadAllGamePacks() {
  if (!fs.existsSync(GAMES_DIR)) return;
  const files = fs.readdirSync(GAMES_DIR);

  for (const file of files) {
    if (file === 'index.json' || file === 'games-manifest.js') continue;
    const ext = path.extname(file).toLowerCase();
    if (ext !== '.json' && ext !== '.js') continue;

    const fullPath = path.join(GAMES_DIR, file);
    try {
      const pack = ext === '.js'
        ? require(fullPath)
        : JSON.parse(fs.readFileSync(fullPath, 'utf8'));

      if (pack && pack.id && Array.isArray(pack.clues)) {
        GAMES_MAP.set(String(pack.id).toLowerCase().trim(), pack);
      }
    } catch (e) {
      console.warn(`[GamesLoader] Could not load ${file}:`, e.message);
    }
  }
}

function getGamePack(gameId) {
  if (!gameId) return null;
  const id = String(gameId).toLowerCase().trim();
  if (GAMES_MAP.has(id)) return GAMES_MAP.get(id);

  // Dynamic fallback if a new JSON category was added while server is running
  const jsonFile = path.join(GAMES_DIR, `${id}.json`);
  if (fs.existsSync(jsonFile)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
      if (parsed && parsed.id && Array.isArray(parsed.clues)) {
        GAMES_MAP.set(id, parsed);
        return parsed;
      }
    } catch (e) {
      console.warn(`[GamesLoader] Could not parse ${id}.json:`, e.message);
    }
  }
  return null;
}

loadAllGamePacks();
const defaultPack = getGamePack('car-logos') || Array.from(GAMES_MAP.values())[0] || {
  id: 'car-logos',
  title: 'Car Logos',
  defaultTimer: 45,
  clues: []
};

// Authoritative Server Game State
const state = {
  title: defaultPack.title,
  gameId: defaultPack.id,
  p1: { name: 'Player 1', timeRemaining: 45, maxTime: 45 },
  p2: { name: 'Player 2', timeRemaining: 45, maxTime: 45 },
  activePlayer: 1, // 1 or 2
  status: 'ready', // 'ready' | 'countdown' | 'running' | 'paused' | 'gameover' | 'tie'
  countdownVal: 0,
  isPassing: false,
  passRemaining: 0,
  passedAnswer: '',
  isCorrect: false,
  correctAnswer: '',
  lastCorrectAnswer: '',
  clues: [...defaultPack.clues],
  clueIndex: 0,
  roundTime: defaultPack.defaultTimer || 45,
  passPenaltySeconds: 3,
  winner: null,
  tieCount: 0,
  territory: null,
  activeChallenger: null,
  adjacentDefenders: [],
  isReigningWinner: false,
  isFloorConquered: false,
  grandChampion: null,
  duelTerritoryResolved: false,
  lastTickTime: null
};

let countdownTimer = null;
let passTimer = null;
let correctTimer = null;

// Connected SSE Clients (Players and Hosts)
const sseClients = new Set();

function sendSse(payload) {
  if (sseClients.size === 0) return;
  const dataStr = `data: ${JSON.stringify(payload)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(dataStr);
    } catch (e) {
      sseClients.delete(res);
    }
  }
}

function clearDuelTimers() {
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
  if (passTimer) { clearInterval(passTimer); passTimer = null; }
  if (correctTimer) { clearTimeout(correctTimer); correctTimer = null; }
  state.countdownVal = 0;
  state.isPassing = false;
  state.passRemaining = 0;
  state.passedAnswer = '';
  state.isCorrect = false;
  state.correctAnswer = '';
  state.lastCorrectAnswer = '';
  state.lastTickTime = null;
}

function resetDuelRoundState(options = { resetTieCount: true }) {
  clearDuelTimers();
  state.status = 'ready';
  state.p1.timeRemaining = state.roundTime;
  state.p2.timeRemaining = state.roundTime;
  state.activePlayer = 1;
  state.clueIndex = 0;
  state.winner = null;
  if (options.resetTieCount) {
    state.tieCount = 0;
  }
}

function buildClueStatePayload(eventType = 'clue_sync') {
  const cluesLen = state.clues.length;
  const currentClue = cluesLen > 0 ? (state.clues[state.clueIndex] || null) : null;
  const nextClue = cluesLen > 0 ? (state.clues[(state.clueIndex + 1) % cluesLen] || null) : null;
  const isPromptHidden = (
    state.status === 'ready' ||
    state.status === 'countdown' ||
    state.isPassing ||
    state.isCorrect
  );

  return {
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
    lastCorrectAnswer: '',
    clueIndex: state.clueIndex,
    cluesCount: cluesLen,
    promptAnswer: currentClue ? currentClue.answer : '',
    promptId: currentClue ? currentClue.id : '',
    promptImage: isPromptHidden ? '' : (currentClue ? currentClue.image : ''),
    preloadImage: currentClue ? currentClue.image : '',
    nextImage: nextClue ? nextClue.image : '',
    nextAnswer: nextClue ? nextClue.answer : '',
    winner: state.winner,
    isTie: state.status === 'tie',
    tieCount: state.tieCount || 0,
    territory: state.territory,
    activeChallenger: state.activeChallenger,
    adjacentDefenders: state.adjacentDefenders,
    isReigningWinner: state.isReigningWinner || false,
    isFloorConquered: state.isFloorConquered || false,
    grandChampion: state.grandChampion || null,
    passPenaltySeconds: state.passPenaltySeconds
  };
}

function broadcastClueState(eventType = 'clue_sync') {
  sendSse(buildClueStatePayload(eventType));
}

function findTerritoryPlayer(info) {
  if (!info || !state.territory || !Array.isArray(state.territory.players)) return null;
  const targetName = String(info.name || '').trim().toLowerCase();
  return state.territory.players.find(p =>
    (info.id && p.id === info.id) ||
    p.name.trim().toLowerCase() === targetName
  ) || null;
}

// Resolves duel outcome on the Floor Territory grid:
// The loser is eliminated from the territory, and the winner claims all of the loser's squares.
function resolveDuelTerritory() {
  if (state.duelTerritoryResolved) return;
  if (!state.territory || !state.territory.players || !state.territory.grid) return;

  const winnerNum = state.winner; // 1 or 2
  const winnerPlayer = findTerritoryPlayer(winnerNum === 1 ? state.p1 : state.p2);
  const loserPlayer = findTerritoryPlayer(winnerNum === 1 ? state.p2 : state.p1);

  if (!winnerPlayer || !loserPlayer) {
    console.warn('[Territory] Winner or loser contestant not found in territory roster');
    return;
  }

  // Category Inheritance Rule:
  // - Challenger wins (winnerNum === 1): challenger keeps their original category
  // - Defender wins (winnerNum === 2): defender adopts the challenger's category
  if (winnerNum !== 1) {
    winnerPlayer.category = loserPlayer.category;
    winnerPlayer.categoryTitle = loserPlayer.categoryTitle;
  }

  const loserNameLower = loserPlayer.name.trim().toLowerCase();
  let ownedCount = 0;

  state.territory.grid.forEach(sq => {
    if (sq.playerId === loserPlayer.id || sq.playerName.trim().toLowerCase() === loserNameLower) {
      sq.playerId = winnerPlayer.id;
      sq.playerName = winnerPlayer.name;
      sq.playerCategory = winnerPlayer.category;
      sq.playerCategoryTitle = winnerPlayer.categoryTitle;
      sq.color = winnerPlayer.color;
    } else if (sq.playerId === winnerPlayer.id) {
      sq.playerCategory = winnerPlayer.category;
      sq.playerCategoryTitle = winnerPlayer.categoryTitle;
    }
    if (sq.playerId === winnerPlayer.id) ownedCount++;
  });

  state.territory.players = state.territory.players.filter(p =>
    p.id !== loserPlayer.id &&
    p.name.trim().toLowerCase() !== loserNameLower
  );

  winnerPlayer.territoryCount = ownedCount;
  winnerPlayer.hasDueled = true;

  if (state.territory.players.length === 1 || ownedCount === state.territory.grid.length) {
    state.isFloorConquered = true;
    state.grandChampion = {
      id: winnerPlayer.id,
      name: winnerPlayer.name,
      category: winnerPlayer.category,
      categoryTitle: winnerPlayer.categoryTitle,
      color: winnerPlayer.color,
      territoryCount: ownedCount
    };
  } else {
    state.isFloorConquered = false;
    state.grandChampion = null;
  }

  state.duelTerritoryResolved = true;
}

// High-Precision Server Clock Loop (ticks every 100ms)
setInterval(() => {
  if (state.status !== 'running') {
    state.lastTickTime = null;
    return;
  }
  if (state.isCorrect) {
    state.lastTickTime = null;
    return;
  }

  const now = Date.now();
  const deltaSec = state.lastTickTime ? (now - state.lastTickTime) / 1000 : 0;
  state.lastTickTime = now;

  const player = state.activePlayer === 1 ? state.p1 : state.p2;
  player.timeRemaining = Math.max(0, player.timeRemaining - deltaSec);

  if (player.timeRemaining <= 0) {
    state.status = 'gameover';
    state.winner = state.activePlayer === 1 ? 2 : 1;
    state.lastTickTime = null;
    resolveDuelTerritory();
    broadcastClueState('timeout');
    return;
  }

  sendSse({
    eventType: 'tick',
    p1Time: state.p1.timeRemaining,
    p2Time: state.p2.timeRemaining,
    activePlayer: state.activePlayer
  });
}, 100);

// 3-Second Start Countdown Engine
function startDuelCountdown() {
  clearDuelTimers();
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

// Territory Adjacency Helper
function getAdjacentCompetitors(challengerId, territory) {
  if (!territory || !territory.grid || !territory.players) return [];
  const { cols, rows, grid, players } = territory;
  const challengerSquares = grid.filter(sq => sq.playerId === challengerId);
  if (challengerSquares.length === 0) return [];

  const playerById = new Map(players.map(p => [p.id, p]));
  const neighborMap = new Map();

  const collectNeighbors = (offsets) => {
    for (const cs of challengerSquares) {
      const r = Math.floor(cs.squareIndex / cols);
      const c = cs.squareIndex % cols;
      for (const [dr, dc] of offsets) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          const neighborIdx = nr * cols + nc;
          const neighborSq = grid[neighborIdx];
          if (neighborSq && neighborSq.playerId && neighborSq.playerId !== challengerId) {
            const comp = playerById.get(neighborSq.playerId);
            if (comp && comp.active !== false) {
              if (!neighborMap.has(comp.id)) {
                neighborMap.set(comp.id, {
                  id: comp.id,
                  name: comp.name,
                  category: comp.category || '',
                  categoryTitle: comp.categoryTitle || comp.category || '',
                  color: comp.color,
                  territoryCount: comp.territoryCount || 1,
                  squareIndices: []
                });
              }
              neighborMap.get(comp.id).squareIndices.push(neighborIdx);
            }
          }
        }
      }
    }
  };

  // Orthogonal edges first, fallback to 8-directional if isolated
  collectNeighbors([[-1, 0], [1, 0], [0, -1], [0, 1]]);
  if (neighborMap.size === 0) {
    collectNeighbors([[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]);
  }

  return Array.from(neighborMap.values());
}

// Floor Randomizer Helper
function selectRandomChallengerFromFloor(territory) {
  if (!territory || !territory.players || territory.players.length < 2) return null;
  const activePlayers = territory.players.filter(p => p.active !== false);
  if (activePlayers.length < 2) return null;

  let pool = activePlayers.filter(p => (p.territoryCount || 1) === 1 && !p.hasDueled);
  if (pool.length === 0) pool = activePlayers.filter(p => (p.territoryCount || 1) === 1);
  if (pool.length === 0) pool = activePlayers;

  const withNeighbors = pool.filter(p => getAdjacentCompetitors(p.id, territory).length > 0);
  const finalPool = withNeighbors.length > 0 ? withNeighbors : pool;
  return finalPool[Math.floor(Math.random() * finalPool.length)];
}

// Switch active category into server state
function loadCategoryIntoState(gameId) {
  const pack = getGamePack(gameId);
  if (!pack) return false;

  state.title = pack.title;
  state.gameId = pack.id;
  state.clues = [...pack.clues];
  state.roundTime = pack.defaultTimer || 45;
  state.p1.maxTime = state.roundTime;
  state.p1.timeRemaining = state.roundTime;
  state.p2.maxTime = state.roundTime;
  state.p2.timeRemaining = state.roundTime;
  return true;
}

// Resolves duel tie when all prompts are completed without any player's clock reaching 0
function handleDuelTie() {
  clearDuelTimers();
  state.status = 'tie';
  state.winner = null;
  state.tieCount = (state.tieCount || 0) + 1;

  sendSse({
    eventType: 'duel_tie',
    status: 'tie',
    title: state.title,
    cluesCount: state.clues.length,
    p1: state.p1,
    p2: state.p2,
    p1Time: state.p1.timeRemaining,
    p2Time: state.p2.timeRemaining,
    tieCount: state.tieCount
  });

  broadcastClueState('duel_tie');
}

function spinFloorRandomizer() {
  if (!state.territory || !state.territory.players || state.territory.players.length < 2) return;
  const chosenChallenger = selectRandomChallengerFromFloor(state.territory);
  if (!chosenChallenger) return;

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

// Modular Host Command Dispatch Table
const COMMAND_HANDLERS = {
  start_duel() {
    if (state.status === 'ready') {
      startDuelCountdown();
    } else if (state.status === 'paused') {
      state.status = 'running';
      state.lastTickTime = Date.now();
      broadcastClueState('resume');
    }
  },

  start_game() {
    COMMAND_HANDLERS.start_duel();
  },

  correct() {
    if (state.status === 'gameover' || state.status === 'tie') return;
    if (state.status === 'ready') return startDuelCountdown();
    if (state.status === 'paused') {
      state.status = 'running';
      state.lastTickTime = Date.now();
      return broadcastClueState('resume');
    }
    if (state.status === 'countdown' || state.isPassing || state.isCorrect) return;

    const currentClue = state.clues[state.clueIndex] || null;
    const ans = currentClue ? currentClue.answer : '';
    state.isCorrect = true;
    state.correctAnswer = ans;
    state.lastCorrectAnswer = ans;
    state.lastTickTime = null;

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
      state.lastCorrectAnswer = '';
      state.activePlayer = state.activePlayer === 1 ? 2 : 1;

      if (state.clues.length > 0 && state.clueIndex + 1 >= state.clues.length) {
        handleDuelTie();
        return;
      }
      if (state.clues.length > 0) state.clueIndex++;
      state.lastTickTime = Date.now();
      broadcastClueState('correct_complete');
    }, 1000);
  },

  pass() {
    if (state.status !== 'running' || state.isPassing || state.isCorrect) return;

    if (correctTimer) { clearTimeout(correctTimer); correctTimer = null; }
    state.isCorrect = false;
    state.correctAnswer = '';

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

        if (state.clues.length > 0 && state.clueIndex + 1 >= state.clues.length) {
          handleDuelTie();
          return;
        }
        if (state.clues.length > 0) state.clueIndex++;
        broadcastClueState('pass_complete');
      }
    }, 1000);
  },

  toggle_pause() {
    if (state.status === 'gameover' || state.status === 'tie') return;
    if (state.status === 'countdown') {
      clearDuelTimers();
      state.status = 'ready';
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
  },

  reset() {
    resetDuelRoundState({ resetTieCount: true });
    broadcastClueState('reset');
  },

  select_game(payload) {
    loadCategoryIntoState(payload.gameId);
    resetDuelRoundState({ resetTieCount: false });
    broadcastClueState('game_change');
  },

  sync_custom_game(payload) {
    if (!payload.game || !Array.isArray(payload.game.clues)) return;
    state.title = payload.game.title || 'Custom Duel';
    state.gameId = payload.game.id || ('custom-' + Date.now());
    state.clues = [...payload.game.clues];
    state.roundTime = payload.game.defaultTimer || 45;
    state.p1.maxTime = state.roundTime;
    state.p2.maxTime = state.roundTime;
    GAMES_MAP.set(String(state.gameId).toLowerCase(), {
      id: state.gameId,
      title: state.title,
      defaultTimer: state.roundTime,
      clues: state.clues
    });
    resetDuelRoundState({ resetTieCount: false });
    broadcastClueState('game_change');
  },

  sync_territory(payload) {
    if (!payload.territory) return;
    state.territory = payload.territory;
    state.activeChallenger = null;
    state.adjacentDefenders = [];
    state.isReigningWinner = false;
    state.isFloorConquered = false;
    state.grandChampion = null;
    state.duelTerritoryResolved = false;
    broadcastClueState('territory_update');
  },

  trigger_randomizer() {
    spinFloorRandomizer();
  },

  return_to_floor() {
    spinFloorRandomizer();
  },

  select_defender(payload) {
    const challengerName = payload.challengerName || (state.activeChallenger ? state.activeChallenger.name : 'Player 1');
    const defenderName = payload.defenderName || (payload.defender ? payload.defender.name : 'Player 2');
    const challengerId = payload.challengerId || (state.activeChallenger ? state.activeChallenger.id : null);
    const defenderId = payload.defenderId || (payload.defender ? payload.defender.id : null);

    const challengerPlayer = findTerritoryPlayer({ id: challengerId, name: challengerName });
    const defenderPlayer = findTerritoryPlayer({ id: defenderId, name: defenderName });

    if (challengerPlayer) challengerPlayer.hasDueled = true;
    if (defenderPlayer) defenderPlayer.hasDueled = true;

    const defenderCat = (defenderPlayer && (defenderPlayer.category || defenderPlayer.categoryId)) || payload.category;
    if (defenderCat) loadCategoryIntoState(defenderCat);

    resetDuelRoundState({ resetTieCount: true });

    state.p1.id = challengerPlayer ? challengerPlayer.id : challengerId;
    state.p1.name = challengerPlayer ? challengerPlayer.name : String(challengerName).trim();
    state.p1.category = challengerPlayer ? (challengerPlayer.category || '') : '';
    state.p1.categoryTitle = challengerPlayer ? (challengerPlayer.categoryTitle || challengerPlayer.category || '') : '';

    state.p2.id = defenderPlayer ? defenderPlayer.id : defenderId;
    state.p2.name = defenderPlayer ? defenderPlayer.name : String(defenderName).trim();
    state.p2.category = defenderPlayer ? (defenderPlayer.category || '') : '';
    state.p2.categoryTitle = defenderPlayer ? (defenderPlayer.categoryTitle || defenderPlayer.category || '') : '';

    state.activeChallenger = null;
    state.adjacentDefenders = [];
    state.isReigningWinner = false;
    state.duelTerritoryResolved = false;

    broadcastClueState('duel_players_set');
  },

  cancel_challenger() {
    state.activeChallenger = null;
    state.adjacentDefenders = [];
    state.isReigningWinner = false;
    sendSse({
      eventType: 'challenger_cancelled',
      territory: state.territory
    });
  },

  return_to_territory() {
    const winnerPlayer = state.winner
      ? findTerritoryPlayer(state.winner === 1 ? state.p1 : state.p2)
      : null;

    resetDuelRoundState({ resetTieCount: true });
    state.duelTerritoryResolved = false;

    if (winnerPlayer && state.territory && state.territory.players.length > 1) {
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
      isFloorConquered,
      grandChampion,
      status: 'ready'
    });
  },

  set_clock(payload) {
    if (payload.p1Time !== undefined) state.p1.timeRemaining = Math.max(0, Number(payload.p1Time));
    if (payload.p2Time !== undefined) state.p2.timeRemaining = Math.max(0, Number(payload.p2Time));
    sendSse({
      eventType: 'tick',
      p1Time: state.p1.timeRemaining,
      p2Time: state.p2.timeRemaining,
      activePlayer: state.activePlayer
    });
  },

  set_duel_players(payload) {
    if (payload.p1Name) state.p1.name = String(payload.p1Name).trim();
    if (payload.p2Name) state.p2.name = String(payload.p2Name).trim();
    if (payload.gameId && payload.gameId !== state.gameId) {
      loadCategoryIntoState(payload.gameId);
    }
    resetDuelRoundState({ resetTieCount: true });
    state.activeChallenger = null;
    state.adjacentDefenders = [];
    broadcastClueState('duel_players_set');
  }
};

function handleHostCommand(cmd, payload = {}) {
  const handler = COMMAND_HANDLERS[cmd];
  if (handler) handler(payload);
}

// MIME Types & Cache Policy
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

const CACHEABLE_IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.svg', '.webp', '.ico']);

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
    res.write(`data: ${JSON.stringify(buildClueStatePayload('initial_state'))}\n\n`);
    req.on('close', () => sseClients.delete(res));
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

  // --- API: Territory & State Endpoints ---
  if (pathname === '/api/territory' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(state.territory || {}));
    return;
  }

  if (pathname === '/api/state' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(state));
    return;
  }

  // --- Static File Serving ---
  let reqPath = decodeURI(pathname);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

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
    const cacheControl = CACHEABLE_IMAGE_EXTS.has(ext)
      ? 'public, max-age=3600'
      : 'no-cache';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': cacheControl
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
  console.log('========================================================\n');
});
