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

try {
  sampleLandmarks = require('./sample-data.js');
} catch (e) {
  console.warn('Could not load sample-data.js', e.message);
}

try {
  iceCreamGame = require('./games/ice-cream-flavours.js');
} catch (e) {
  console.warn('Could not load ice-cream-flavours.js', e.message);
}

// Authoritative Server Game State
const state = {
  title: iceCreamGame ? iceCreamGame.title : "Ice Cream Flavours",
  gameId: iceCreamGame ? iceCreamGame.id : "ice-cream-flavours",
  p1: { name: "Player 1", timeRemaining: 45, maxTime: 45 },
  p2: { name: "Player 2", timeRemaining: 45, maxTime: 45 },
  activePlayer: 1, // 1 or 2
  status: 'ready', // 'ready' | 'running' | 'paused' | 'gameover'
  clues: iceCreamGame ? [...iceCreamGame.clues] : [],
  clueIndex: 0,
  roundTime: 45,
  passPenaltySeconds: 3,
  winner: null,
  lastTickTime: null,
  lastEvent: null
};

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

  const payload = {
    eventType,
    title: state.title,
    gameId: state.gameId,
    p1: state.p1,
    p2: state.p2,
    activePlayer: state.activePlayer,
    status: state.status,
    clueIndex: state.clueIndex,
    cluesCount: state.clues.length,
    // Stable, explicit clue pairings for host and players:
    promptAnswer: currentClue ? currentClue.answer : '',
    promptId: currentClue ? currentClue.id : '',
    promptImage: currentClue ? currentClue.image : '',
    nextAnswer: nextClue ? nextClue.answer : '',
    winner: state.winner,
    passPenaltySeconds: state.passPenaltySeconds
  };

  sendSse(payload);
}

// High-Precision Server Clock Loop (ticks every 100ms)
setInterval(() => {
  if (state.status === 'running') {
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

// Host Command Processor
function handleHostCommand(cmd, payload = {}) {
  if (cmd === 'correct') {
    if (state.status === 'gameover') return;
    if (state.status === 'ready' || state.status === 'paused') {
      state.status = 'running';
      state.lastTickTime = Date.now();
      broadcastClueState('start');
      return;
    }

    // Switch active player
    state.activePlayer = state.activePlayer === 1 ? 2 : 1;
    // Advance clue
    if (state.clues.length > 0) {
      state.clueIndex = (state.clueIndex + 1) % state.clues.length;
    }
    broadcastClueState('correct');
  } 
  else if (cmd === 'pass') {
    if (state.status !== 'running') return;
    const penalty = state.passPenaltySeconds || 0;
    const player = state.activePlayer === 1 ? state.p1 : state.p2;

    if (penalty > 0) {
      player.timeRemaining = Math.max(0, player.timeRemaining - penalty);
    }

    if (player.timeRemaining <= 0) {
      state.status = 'gameover';
      state.winner = state.activePlayer === 1 ? 2 : 1;
      state.lastTickTime = null;
      broadcastClueState('timeout');
      return;
    }

    // Keep turn with same player, serve next clue
    if (state.clues.length > 0) {
      state.clueIndex = (state.clueIndex + 1) % state.clues.length;
    }
    broadcastClueState('pass');
  } 
  else if (cmd === 'toggle_pause') {
    if (state.status === 'gameover') return;
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
    const gameId = payload.gameId;
    if (gameId === 'toronto-landmarks') {
      state.title = "Landmarks of Toronto";
      state.gameId = 'toronto-landmarks';
      state.clues = [...sampleLandmarks];
    } else if (gameId === 'ice-cream-flavours' && iceCreamGame) {
      state.title = iceCreamGame.title;
      state.gameId = iceCreamGame.id;
      state.clues = [...iceCreamGame.clues];
    }
    state.status = 'ready';
    state.p1.timeRemaining = state.roundTime;
    state.p2.timeRemaining = state.roundTime;
    state.clueIndex = 0;
    state.winner = null;
    broadcastClueState('game_change');
  } 
  else if (cmd === 'sync_custom_game') {
    if (payload.game && Array.isArray(payload.game.clues)) {
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
    const initialData = {
      eventType: 'initial_state',
      title: state.title,
      gameId: state.gameId,
      p1: state.p1,
      p2: state.p2,
      activePlayer: state.activePlayer,
      status: state.status,
      clueIndex: state.clueIndex,
      cluesCount: state.clues.length,
      promptAnswer: currentClue ? currentClue.answer : '',
      promptId: currentClue ? currentClue.id : '',
      promptImage: currentClue ? currentClue.image : '',
      nextAnswer: nextClue ? nextClue.answer : '',
      winner: state.winner,
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
