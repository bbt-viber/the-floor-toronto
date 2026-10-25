// Main Game Engine for The Floor Toronto
(function () {
  'use strict';

  // BroadcastChannel for cross-window / dual-screen sync
  const channel = ('BroadcastChannel' in window) ? new BroadcastChannel('the-floor-toronto') : null;

  // Initial State
  const initialPack = (typeof GAME_ICE_CREAM !== 'undefined') ? GAME_ICE_CREAM : (typeof TORONTO_STARTER_PACK !== 'undefined' ? { title: "Landmarks of Toronto", clues: TORONTO_STARTER_PACK } : { title: "The Floor Toronto", clues: [] });

  const defaultGameData = {
    title: initialPack.title,
    p1Name: "Player 1",
    p2Name: "Player 2",
    roundTime: 45,
    passPenaltySeconds: 3,
    clues: [...initialPack.clues]
  };

  const state = {
    title: defaultGameData.title,
    p1: { name: defaultGameData.p1Name, timeRemaining: 45, maxTime: 45 },
    p2: { name: defaultGameData.p2Name, timeRemaining: 45, maxTime: 45 },
    activePlayer: 1, // 1 or 2
    status: 'ready', // 'ready' | 'countdown' | 'running' | 'paused' | 'gameover'
    countdownVal: 0,
    isPassing: false,
    passRemaining: 0,
    passedAnswer: '',
    isCorrect: false,
    correctAnswer: '',
    correctTimer: null,
    lastCorrectAnswer: '',
    countdownTimer: null,
    passTimer: null,
    clues: [...defaultGameData.clues],
    clueIndex: 0,
    roundTime: 45,
    passPenaltySeconds: 3,
    passLockUntil: 0,
    answerBlurred: true,
    lastFrameTime: null,
    winner: null
  };

  // DOM Elements
  const el = {
    viewArena: document.getElementById('viewArena'),
    viewDirectory: document.getElementById('viewDirectory'),
    viewSetup: document.getElementById('viewSetup'),
    btnNavArena: document.getElementById('btnNavArena'),
    btnNavDirectory: document.getElementById('btnNavDirectory'),
    btnNavSetup: document.getElementById('btnNavSetup'),
    btnHostQr: document.getElementById('btnHostQr'),
    btnStageQr: document.getElementById('btnStageQr'),
    btnQuickChangeGame: document.getElementById('btnQuickChangeGame'),
    directoryGrid: document.getElementById('directoryGrid'),
    qrModal: document.getElementById('qrModal'),
    qrCodeContainer: document.getElementById('qrCodeContainer'),
    qrHostUrlText: document.getElementById('qrHostUrlText'),
    btnCopyHostLink: document.getElementById('btnCopyHostLink'),
    btnOpenHostTab: document.getElementById('btnOpenHostTab'),
    btnCloseQrModal: document.getElementById('btnCloseQrModal'),
    btnSoundToggle: document.getElementById('btnSoundToggle'),
    btnFullscreen: document.getElementById('btnFullscreen'),
    btnDualScreen: document.getElementById('btnDualScreen'),

    // Arena elements
    categoryTitle: document.getElementById('categoryTitle'),
    clueImage: document.getElementById('clueImage'),
    clueCounter: document.getElementById('clueCounter'),
    flashOverlay: document.getElementById('flashOverlay'),
    flashText: document.getElementById('flashText'),
    flashAnswer: document.getElementById('flashAnswer'),
    stageAnswerPill: document.getElementById('stageAnswerPill'),
    stageAnswerText: document.getElementById('stageAnswerText'),
    hostAnswerText: document.getElementById('hostAnswerText'),
    btnToggleAnswer: document.getElementById('btnToggleAnswer'),
    startingSoonOverlay: document.getElementById('startingSoonOverlay'),
    countdownOverlay: document.getElementById('countdownOverlay'),
    countdownNumber: document.getElementById('countdownNumber'),
    passOverlay: document.getElementById('passOverlay'),
    passRevealedAnswer: document.getElementById('passRevealedAnswer'),
    passRecoveryDigits: document.getElementById('passRecoveryDigits'),
    passRecoveryBar: document.getElementById('passRecoveryBar'),
    correctOverlay: document.getElementById('correctOverlay'),
    correctRevealedAnswer: document.getElementById('correctRevealedAnswer'),

    p1Podium: document.getElementById('p1Podium'),
    p1Name: document.getElementById('p1Name'),
    p1TimerBox: document.getElementById('p1TimerBox'),
    p1TimerDigits: document.getElementById('p1TimerDigits'),
    p1TimerBar: document.getElementById('p1TimerBar'),

    p2Podium: document.getElementById('p2Podium'),
    p2Name: document.getElementById('p2Name'),
    p2TimerBox: document.getElementById('p2TimerBox'),
    p2TimerDigits: document.getElementById('p2TimerDigits'),
    p2TimerBar: document.getElementById('p2TimerBar'),

    // Dock Buttons
    btnCorrect: document.getElementById('btnCorrect'),
    btnPass: document.getElementById('btnPass'),
    btnPause: document.getElementById('btnPause'),
    btnReset: document.getElementById('btnReset'),
    pauseLabel: document.getElementById('pauseLabel'),

    // Modals
    victoryModal: document.getElementById('victoryModal'),
    victoryWinnerName: document.getElementById('victoryWinnerName'),
    victoryDetails: document.getElementById('victoryDetails'),
    btnRematch: document.getElementById('btnRematch'),
    btnBackToSetup: document.getElementById('btnBackToSetup'),

    pauseModal: document.getElementById('pauseModal'),
    btnResume: document.getElementById('btnResume'),

    // Setup Form
    inputGameTitle: document.getElementById('inputGameTitle'),
    inputP1Name: document.getElementById('inputP1Name'),
    inputP2Name: document.getElementById('inputP2Name'),
    inputRoundTime: document.getElementById('inputRoundTime'),
    labelRoundTime: document.getElementById('labelRoundTime'),
    selectPassRule: document.getElementById('selectPassRule'),
    dropzone: document.getElementById('dropzone'),
    fileInput: document.getElementById('fileInput'),
    clueListGrid: document.getElementById('clueListGrid'),
    clueCountBadge: document.getElementById('clueCountBadge'),
    btnLoadIceCream: document.getElementById('btnLoadIceCream'),
    btnLoadStarter: document.getElementById('btnLoadStarter'),
    btnExportJson: document.getElementById('btnExportJson'),
    btnImportJson: document.getElementById('btnImportJson'),
    importFileInput: document.getElementById('importFileInput'),
    btnClearAll: document.getElementById('btnClearAll'),
    btnLaunchDuel: document.getElementById('btnLaunchDuel')
  };

  // Local Storage Save/Load
  function loadPersistedGame() {
    try {
      const saved = localStorage.getItem('the_floor_game_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.clues && parsed.clues.length > 0) {
          state.title = parsed.title || defaultGameData.title;
          state.p1.name = parsed.p1Name || defaultGameData.p1Name;
          state.p2.name = parsed.p2Name || defaultGameData.p2Name;
          state.roundTime = parsed.roundTime || defaultGameData.roundTime;
          state.p1.maxTime = state.roundTime;
          state.p2.maxTime = state.roundTime;
          state.p1.timeRemaining = state.roundTime;
          state.p2.timeRemaining = state.roundTime;
          state.passPenaltySeconds = parsed.passPenaltySeconds !== undefined ? parsed.passPenaltySeconds : 3;
          state.clues = parsed.clues;
        }
      }
    } catch (e) {
      console.warn('Could not load saved game from localStorage', e);
    }
  }

  function persistCurrentGame() {
    try {
      const toSave = {
        title: state.title,
        p1Name: state.p1.name,
        p2Name: state.p2.name,
        roundTime: state.roundTime,
        passPenaltySeconds: state.passPenaltySeconds,
        clues: state.clues
      };
      localStorage.setItem('the_floor_game_data', JSON.stringify(toSave));
    } catch (e) {
      console.warn('Could not persist to localStorage (quota exceeded if many images)', e);
    }
  }

  // Animation Frame Game Loop
  let animationId = null;
  let lastSecondPlayed = null;

  function gameLoop(timestamp) {
    if (state.status === 'running') {
      if (!state.lastFrameTime) {
        state.lastFrameTime = timestamp;
      }
      const deltaSec = (timestamp - state.lastFrameTime) / 1000;
      state.lastFrameTime = timestamp;

      // Active player timer countdown
      const player = state.activePlayer === 1 ? state.p1 : state.p2;
      player.timeRemaining = Math.max(0, player.timeRemaining - deltaSec);

      // Sound ticking
      const currentWholeSec = Math.ceil(player.timeRemaining);
      if (currentWholeSec !== lastSecondPlayed && currentWholeSec > 0) {
        lastSecondPlayed = currentWholeSec;
        if (player.timeRemaining <= 10) {
          window.soundEngine.playUrgentTick();
        } else {
          window.soundEngine.playTick();
        }
      }

      // Check timeout (Game Over)
      if (player.timeRemaining <= 0) {
        handleTimeout(state.activePlayer);
        return;
      }

      updateTimerUI();
      broadcastSync();
    } else {
      state.lastFrameTime = null;
    }

    animationId = requestAnimationFrame(gameLoop);
  }

  function startRunningDirect() {
    state.status = 'running';
    state.countdownVal = 0;
    state.isPassing = false;
    state.lastFrameTime = null;
    lastSecondPlayed = null;
    el.pauseLabel.textContent = 'PAUSE (ESC)';
    el.pauseModal.classList.remove('active');
    updateArenaUI();
    broadcastSync();
    if (!animationId) {
      animationId = requestAnimationFrame(gameLoop);
    }
  }

  function startRunning() {
    if (sendServerCommand('start_duel')) return;
    if (state.status === 'ready') {
      startDuelCountdownLocal();
    } else {
      startRunningDirect();
    }
  }

  function startDuelCountdownLocal() {
    if (state.countdownTimer) clearInterval(state.countdownTimer);
    if (state.passTimer) clearInterval(state.passTimer);
    state.countdownTimer = null;
    state.passTimer = null;
    state.isPassing = false;
    state.passRemaining = 0;
    state.status = 'countdown';
    state.countdownVal = 3;
    if (window.soundEngine?.playCountdownBeep) window.soundEngine.playCountdownBeep(false);
    updateArenaUI();
    broadcastSync();

    state.countdownTimer = setInterval(() => {
      state.countdownVal--;
      if (state.countdownVal > 0) {
        if (window.soundEngine?.playCountdownBeep) window.soundEngine.playCountdownBeep(false);
        updateArenaUI();
        broadcastSync();
      } else {
        clearInterval(state.countdownTimer);
        state.countdownTimer = null;
        if (window.soundEngine?.playCountdownBeep) window.soundEngine.playCountdownBeep(true);
        startRunningDirect();
      }
    }, 1000);
  }

  function pauseRunning() {
    state.status = 'paused';
    state.lastFrameTime = null;
    el.pauseLabel.textContent = 'RESUME (ESC)';
    el.pauseModal.classList.add('active');
    updateArenaUI();
    broadcastSync();
  }

  function handleTimeout(losingPlayerId) {
    state.status = 'gameover';
    state.winner = losingPlayerId === 1 ? 2 : 1;
    const winnerName = state.winner === 1 ? state.p1.name : state.p2.name;
    const loserName = losingPlayerId === 1 ? state.p1.name : state.p2.name;
    const winningTime = (state.winner === 1 ? state.p1.timeRemaining : state.p2.timeRemaining).toFixed(1);

    window.soundEngine.playTimeout();
    setTimeout(() => {
      window.soundEngine.playVictory();
      triggerConfetti();
    }, 400);

    el.victoryWinnerName.textContent = `${winnerName} Wins!`;
    el.victoryDetails.textContent = `${loserName}'s clock reached 0.0s! ${winnerName} takes the floor with ${winningTime}s remaining!`;
    el.victoryModal.classList.add('active');

    updateArenaUI();
    broadcastSync();
  }

  // Host Action: Correct Answer (SPACE)
  function handleCorrect() {
    if (sendServerCommand('correct')) return;

    if (state.status === 'gameover') return;
    if (state.status === 'ready') {
      startRunning();
      return;
    }
    if (state.status === 'paused') {
      startRunning();
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
    state.lastFrameTime = null; // Pause clock during 1s display

    window.soundEngine.playCorrect();
    updateArenaUI();
    broadcastSync();

    if (state.correctTimer) clearTimeout(state.correctTimer);
    state.correctTimer = setTimeout(() => {
      state.correctTimer = null;
      if (state.status !== 'running') {
        state.isCorrect = false;
        state.correctAnswer = '';
        return;
      }
      state.isCorrect = false;
      state.correctAnswer = '';
      state.lastCorrectAnswer = ''; // When next prompt is displayed, hide previous answer!

      // Switch turn to opponent
      state.activePlayer = state.activePlayer === 1 ? 2 : 1;
      // Advance to next clue
      nextClue();

      updateArenaUI();
      broadcastSync();
    }, 1000);
  }

  // Host Action: Pass (TAB)
  function handlePass() {
    if (sendServerCommand('pass')) return;

    if (state.status !== 'running' || state.isPassing || state.isCorrect) return;

    if (state.correctTimer) clearTimeout(state.correctTimer);
    state.correctTimer = null;
    state.isCorrect = false;
    state.correctAnswer = '';

    window.soundEngine.playPass();

    // DO NOT subtract 3 seconds immediately from clock!
    // Clock continues to tick down naturally during the 3-second recovery delay.
    // The current prompt is removed immediately, the answer is displayed to all players,
    // and 3 seconds later the next prompt is introduced.
    const curClue = state.clues[state.clueIndex];
    state.passedAnswer = curClue ? curClue.answer : '';
    state.lastCorrectAnswer = '';
    state.isPassing = true;
    state.passRemaining = 3;
    if (el.stageAnswerPill) {
      el.stageAnswerPill.style.display = 'none';
      if (el.stageAnswerText) el.stageAnswerText.textContent = '';
    }
    updateArenaUI();
    broadcastSync();

    let pCount = 3;
    if (state.passTimer) clearInterval(state.passTimer);
    state.passTimer = setInterval(() => {
      if (state.status !== 'running') {
        clearInterval(state.passTimer);
        state.isPassing = false;
        state.passRemaining = 0;
        state.passedAnswer = '';
        state.lastCorrectAnswer = '';
        if (el.stageAnswerPill) {
          el.stageAnswerPill.style.display = 'none';
          if (el.stageAnswerText) el.stageAnswerText.textContent = '';
        }
        return;
      }
      pCount--;
      if (pCount > 0) {
        state.passRemaining = pCount;
        updateArenaUI();
        broadcastSync();
      } else {
        clearInterval(state.passTimer);
        state.passTimer = null;
        state.isPassing = false;
        state.passRemaining = 0;
        state.passedAnswer = '';
        state.lastCorrectAnswer = '';
        if (el.stageAnswerPill) {
          el.stageAnswerPill.style.display = 'none';
          if (el.stageAnswerText) el.stageAnswerText.textContent = '';
        }
        nextClue();
        updateArenaUI();
        broadcastSync();
      }
    }, 1000);
  }

  function togglePause() {
    if (sendServerCommand('toggle_pause')) return;

    if (state.status === 'gameover') return;
    if (state.status === 'countdown') {
      if (state.countdownTimer) clearInterval(state.countdownTimer);
      state.countdownTimer = null;
      state.status = 'ready';
      state.countdownVal = 0;
      updateArenaUI();
      broadcastSync();
      return;
    }
    if (state.status === 'running') {
      pauseRunning();
    } else {
      startRunning();
    }
  }

  // Host Action: Reset Round (R)
  function resetRound() {
    sendServerCommand('reset');

    if (state.countdownTimer) clearInterval(state.countdownTimer);
    if (state.passTimer) clearInterval(state.passTimer);
    state.countdownTimer = null;
    state.passTimer = null;
    state.isPassing = false;
    state.passRemaining = 0;
    state.passedAnswer = '';
    state.lastCorrectAnswer = '';
    state.countdownVal = 0;
    state.status = 'ready';
    state.p1.timeRemaining = state.roundTime;
    state.p2.timeRemaining = state.roundTime;
    state.activePlayer = 1;
    state.clueIndex = 0;
    state.lastFrameTime = null;
    lastSecondPlayed = null;
    state.winner = null;

    el.victoryModal.classList.remove('active');
    el.pauseModal.classList.remove('active');
    el.pauseLabel.textContent = 'START (ESC / SPACE)';

    updateArenaUI();
    broadcastSync();
  }

  function nextClue() {
    if (state.clues.length === 0) return;
    state.clueIndex = (state.clueIndex + 1) % state.clues.length;
  }

  function flashScreen(text, className, answer = '') {
    el.flashText.textContent = text;
    if (el.flashAnswer) {
      if (answer) {
        el.flashAnswer.textContent = answer.toUpperCase();
        el.flashAnswer.style.display = 'block';
      } else {
        el.flashAnswer.style.display = 'none';
      }
    }
    if (el.stageAnswerPill && answer) {
      el.stageAnswerPill.style.display = 'inline-flex';
      el.stageAnswerText.textContent = answer.toUpperCase();
    }
    el.flashOverlay.className = `flash-overlay ${className}`;
    setTimeout(() => {
      el.flashOverlay.className = 'flash-overlay';
    }, 750);
  }

  // Update UI Elements
  function formatTime(seconds) {
    if (seconds <= 0) return "0.0";
    if (seconds < 10) return seconds.toFixed(1);
    return Math.ceil(seconds).toString();
  }

  function updateTimerUI() {
    // Player 1
    el.p1TimerDigits.textContent = formatTime(state.p1.timeRemaining);
    const p1Pct = Math.max(0, Math.min(100, (state.p1.timeRemaining / state.p1.maxTime) * 100));
    el.p1TimerBar.style.width = `${p1Pct}%`;
    if (state.p1.timeRemaining <= 10 && state.p1.timeRemaining > 0 && state.activePlayer === 1) {
      el.p1TimerBox.classList.add('urgent');
    } else {
      el.p1TimerBox.classList.remove('urgent');
    }

    // Player 2
    el.p2TimerDigits.textContent = formatTime(state.p2.timeRemaining);
    const p2Pct = Math.max(0, Math.min(100, (state.p2.timeRemaining / state.p2.maxTime) * 100));
    el.p2TimerBar.style.width = `${p2Pct}%`;
    if (state.p2.timeRemaining <= 10 && state.p2.timeRemaining > 0 && state.activePlayer === 2) {
      el.p2TimerBox.classList.add('urgent');
    } else {
      el.p2TimerBox.classList.remove('urgent');
    }
  }

  function updateArenaUI() {
    el.categoryTitle.textContent = state.title.toUpperCase();
    el.p1Name.textContent = state.p1.name;
    el.p2Name.textContent = state.p2.name;

    // Active podium indicator
    if (state.activePlayer === 1) {
      el.p1Podium.classList.add('active-turn');
      el.p2Podium.classList.remove('active-turn');
    } else {
      el.p2Podium.classList.add('active-turn');
      el.p1Podium.classList.remove('active-turn');
    }

    // Current Clue Image & Counter (Stable update, prevents image/DOM flicker)
    if (state.clues.length > 0 && state.clues[state.clueIndex]) {
      const cur = state.clues[state.clueIndex];
      const clueId = cur.id || ('clue_' + state.clueIndex);
      if (el.clueImage.getAttribute('data-clue-id') !== clueId) {
        el.clueImage.setAttribute('data-clue-id', clueId);
        el.clueImage.src = cur.image;
      }
      el.clueCounter.textContent = `${state.clueIndex + 1} / ${state.clues.length}`;
      if (el.hostAnswerText) el.hostAnswerText.textContent = cur.answer;
    } else {
      el.clueImage.removeAttribute('data-clue-id');
      el.clueImage.src = '';
      el.clueCounter.textContent = '0 / 0';
      if (el.hostAnswerText) el.hostAnswerText.textContent = 'No Clues';
    }

    if (el.hostAnswerText && el.btnToggleAnswer) {
      if (state.answerBlurred) {
        el.hostAnswerText.classList.add('blurred');
        el.btnToggleAnswer.textContent = 'REVEAL';
      } else {
        el.hostAnswerText.classList.remove('blurred');
        el.btnToggleAnswer.textContent = 'HIDE';
      }
    }

    // Stage Overlay Management
    if (state.status === 'ready') {
      if (el.startingSoonOverlay) el.startingSoonOverlay.style.display = 'flex';
      if (el.countdownOverlay) el.countdownOverlay.style.display = 'none';
      if (el.passOverlay) el.passOverlay.style.display = 'none';
      if (el.correctOverlay) el.correctOverlay.style.display = 'none';
      if (el.stageAnswerPill) el.stageAnswerPill.style.display = 'none';
      el.clueImage.style.display = 'none';
      el.pauseLabel.textContent = 'START DUEL (SPACE)';
    } else if (state.status === 'countdown') {
      if (el.startingSoonOverlay) el.startingSoonOverlay.style.display = 'none';
      if (el.countdownOverlay) el.countdownOverlay.style.display = 'flex';
      if (el.countdownNumber) el.countdownNumber.textContent = state.countdownVal || 3;
      if (el.passOverlay) el.passOverlay.style.display = 'none';
      if (el.correctOverlay) el.correctOverlay.style.display = 'none';
      if (el.stageAnswerPill) el.stageAnswerPill.style.display = 'none';
      el.clueImage.style.display = 'none';
      el.pauseLabel.textContent = `STARTING IN ${state.countdownVal || 3}...`;
    } else if (state.isPassing) {
      if (el.startingSoonOverlay) el.startingSoonOverlay.style.display = 'none';
      if (el.countdownOverlay) el.countdownOverlay.style.display = 'none';
      if (el.correctOverlay) el.correctOverlay.style.display = 'none';
      if (el.passOverlay) el.passOverlay.style.display = 'flex';
      if (el.passRevealedAnswer) el.passRevealedAnswer.textContent = (state.passedAnswer || '').toUpperCase();
      if (el.passRecoveryDigits) el.passRecoveryDigits.textContent = `${state.passRemaining || 3}s`;
      if (el.passRecoveryBar) el.passRecoveryBar.style.width = `${((state.passRemaining || 3) / 3) * 100}%`;
      if (el.stageAnswerPill) el.stageAnswerPill.style.display = 'none';
      el.clueImage.style.display = 'none';
    } else if (state.isCorrect) {
      if (el.startingSoonOverlay) el.startingSoonOverlay.style.display = 'none';
      if (el.countdownOverlay) el.countdownOverlay.style.display = 'none';
      if (el.passOverlay) el.passOverlay.style.display = 'none';
      if (el.correctOverlay) el.correctOverlay.style.display = 'flex';
      if (el.correctRevealedAnswer) el.correctRevealedAnswer.textContent = (state.correctAnswer || '').toUpperCase();
      if (el.stageAnswerPill) el.stageAnswerPill.style.display = 'none';
      el.clueImage.style.display = 'none';
    } else {
      // running, paused, gameover (NEXT PROMPT DISPLAYED - HIDE ALL PREVIOUS ANSWERS!)
      if (el.startingSoonOverlay) el.startingSoonOverlay.style.display = 'none';
      if (el.countdownOverlay) el.countdownOverlay.style.display = 'none';
      if (el.passOverlay) el.passOverlay.style.display = 'none';
      if (el.correctOverlay) el.correctOverlay.style.display = 'none';
      if (el.stageAnswerPill) el.stageAnswerPill.style.display = 'none';
      el.clueImage.style.display = 'block';
    }

    updateTimerUI();
  }

  // Cross-Window / Dual-Screen Broadcast Sync
  function broadcastSync() {
    if (!channel || isServerConnected) return; // Do NOT broadcast competing data when connected to live server
    channel.postMessage({
      type: 'STATE_SYNC',
      payload: {
        title: state.title,
        p1: state.p1,
        p2: state.p2,
        activePlayer: state.activePlayer,
        status: state.status,
        clueIndex: state.clueIndex,
        clue: state.clues[state.clueIndex] || null,
        cluesCount: state.clues.length,
        winner: state.winner
      }
    });
  }

  // Listen for broadcast messages from other windows (e.g. Host Window or Arena Window)
  if (channel) {
    channel.onmessage = (event) => {
      const msg = event.data;
      if (!msg) return;
      if (msg.type === 'HOST_CMD') {
        if (msg.cmd === 'correct') handleCorrect();
        else if (msg.cmd === 'pass') handlePass();
        else if (msg.cmd === 'pause') togglePause();
        else if (msg.cmd === 'reset') resetRound();
      }
    };
  }

  // Keyboard Controller
  window.addEventListener('keydown', (e) => {
    // If typing in input fields, don't trigger game controls
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) {
      return;
    }

    // Audio context initialization on first interaction
    window.soundEngine.init();

    // SPACE: Correct
    if (e.code === 'Space') {
      e.preventDefault();
      handleCorrect();
    }
    // TAB: Pass
    else if (e.code === 'Tab') {
      e.preventDefault();
      handlePass();
    }
    // ESCAPE: Pause / Resume
    else if (e.code === 'Escape') {
      e.preventDefault();
      togglePause();
    }
    // R: Reset Round
    else if (e.code === 'KeyR') {
      e.preventDefault();
      if (confirm('Reset the duel round?')) {
        resetRound();
      }
    }
  });

  // Dock & Control Button Listeners
  el.btnCorrect.addEventListener('click', () => {
    window.soundEngine.init();
    handleCorrect();
  });

  el.btnPass.addEventListener('click', () => {
    window.soundEngine.init();
    handlePass();
  });

  el.btnPause.addEventListener('click', () => {
    window.soundEngine.init();
    togglePause();
  });

  el.btnReset.addEventListener('click', () => {
    window.soundEngine.init();
    if (confirm('Reset the duel round?')) {
      resetRound();
    }
  });

  el.btnResume.addEventListener('click', () => {
    startRunning();
  });

  el.btnRematch.addEventListener('click', () => {
    resetRound();
    startRunning();
  });

  el.btnBackToSetup.addEventListener('click', () => {
    resetRound();
    switchToView('setup');
  });

  // Host Answer Peek Toggle (if present)
  if (el.btnToggleAnswer) {
    el.btnToggleAnswer.addEventListener('click', () => {
      state.answerBlurred = !state.answerBlurred;
      updateArenaUI();
    });
  }
  if (el.hostAnswerText) {
    el.hostAnswerText.addEventListener('click', () => {
      state.answerBlurred = !state.answerBlurred;
      updateArenaUI();
    });
  }

  // QR Code Host Remote Controller
  let qrCodeObj = null;

  function showQrModal() {
    let hostUrl = '';
    if (location.protocol.startsWith('http')) {
      hostUrl = `${window.location.origin}/host.html`;
    } else {
      hostUrl = 'host.html';
    }

    if (el.qrHostUrlText) el.qrHostUrlText.textContent = hostUrl;

    if (typeof QRCode !== 'undefined' && el.qrCodeContainer) {
      el.qrCodeContainer.innerHTML = '';
      qrCodeObj = new QRCode(el.qrCodeContainer, {
        text: hostUrl,
        width: 190,
        height: 190,
        colorDark: "#060911",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
      });
    }

    if (el.qrModal) el.qrModal.classList.add('active');
  }

  function hideQrModal() {
    if (el.qrModal) el.qrModal.classList.remove('active');
  }

  if (el.btnHostQr) el.btnHostQr.addEventListener('click', showQrModal);
  if (el.btnStageQr) el.btnStageQr.addEventListener('click', showQrModal);
  if (el.btnCloseQrModal) el.btnCloseQrModal.addEventListener('click', hideQrModal);

  if (el.btnOpenHostTab) {
    el.btnOpenHostTab.addEventListener('click', () => {
      window.open('host.html', '_blank');
    });
  }

  if (el.btnCopyHostLink) {
    el.btnCopyHostLink.addEventListener('click', () => {
      const url = el.qrHostUrlText ? el.qrHostUrlText.textContent : `${window.location.origin}/host.html`;
      navigator.clipboard.writeText(url).then(() => {
        el.btnCopyHostLink.textContent = '✓ Copied!';
        setTimeout(() => { if (el.btnCopyHostLink) el.btnCopyHostLink.textContent = '📋 Copy Link'; }, 2000);
      }).catch(() => {});
    });
  }

  // Server-Sent Events (SSE) Listener for Real-Time Wireless Sync
  let isServerConnected = false;
  let sseSource = null;

  function initServerEvents() {
    if (!location.protocol.startsWith('http')) return;

    sseSource = new EventSource('/api/events');
    sseSource.onopen = () => {
      isServerConnected = true;
    };
    sseSource.onerror = () => {
      isServerConnected = false;
    };

    sseSource.onmessage = (event) => {
      try {
        const d = JSON.parse(event.data);
        if (!d) return;

        // 1. Lightweight Timer Tick: ONLY update clock digits & progress bars!
        if (d.eventType === 'tick') {
          if (d.p1Time !== undefined) state.p1.timeRemaining = d.p1Time;
          if (d.p2Time !== undefined) state.p2.timeRemaining = d.p2Time;
          if (d.activePlayer !== undefined) state.activePlayer = d.activePlayer;
          updateTimerUI();
          return; // Prevents any image reloading, DOM flicker, or repainting!
        }

        // 2. Countdown Ticks
        if (d.eventType === 'countdown_start' || d.eventType === 'countdown_tick') {
          state.status = 'countdown';
          state.countdownVal = d.countdownVal !== undefined ? d.countdownVal : 3;
          state.isPassing = false;
          if (window.soundEngine?.playCountdownBeep) {
            window.soundEngine.playCountdownBeep(false);
          }
          updateArenaUI();
          return;
        }

        // 3. Pass Recovery Ticks (Prompt removed, Answer displayed to all for 3s recovery)
        if (d.eventType === 'pass_start' || d.eventType === 'pass_tick') {
          state.isPassing = true;
          state.isCorrect = false;
          state.passRemaining = d.passRemaining !== undefined ? d.passRemaining : 3;
          if (d.passedAnswer) state.passedAnswer = d.passedAnswer;
          state.lastCorrectAnswer = '';
          if (el.stageAnswerPill) el.stageAnswerPill.style.display = 'none';
          if (el.correctOverlay) el.correctOverlay.style.display = 'none';
          if (d.eventType === 'pass_start') {
            window.soundEngine?.playPass();
          }
          updateArenaUI();
          return;
        }

        if (d.eventType === 'pass_complete') {
          state.isPassing = false;
          state.passRemaining = 0;
          state.passedAnswer = '';
          state.lastCorrectAnswer = '';
          if (el.passOverlay) el.passOverlay.style.display = 'none';
          if (el.stageAnswerPill) el.stageAnswerPill.style.display = 'none';
        }

        // 4. Correct Reveal (Display answer for prompt gotten correct)
        if (d.eventType === 'correct_start' || d.isCorrect) {
          state.isCorrect = true;
          state.isPassing = false;
          state.correctAnswer = d.correctAnswer || d.promptAnswer || '';
          if (el.correctOverlay) el.correctOverlay.style.display = 'flex';
          if (el.correctRevealedAnswer) {
            el.correctRevealedAnswer.textContent = state.correctAnswer.toUpperCase();
          }
          if (el.passOverlay) el.passOverlay.style.display = 'none';
          if (el.stageAnswerPill) el.stageAnswerPill.style.display = 'none';
          if (d.eventType === 'correct_start') {
            window.soundEngine?.playCorrect();
          }
          updateArenaUI();
          return;
        }

        if (d.eventType === 'correct_complete') {
          state.isCorrect = false;
          state.correctAnswer = '';
          state.lastCorrectAnswer = '';
          if (el.correctOverlay) el.correctOverlay.style.display = 'none';
          if (el.stageAnswerPill) el.stageAnswerPill.style.display = 'none';
        }

        // 5. Sound & Animations on Clue Progression
        if (d.eventType === 'start') {
          state.status = 'running';
          state.isPassing = false;
          state.isCorrect = false;
          state.countdownVal = 0;
          if (window.soundEngine?.playCountdownBeep) {
            window.soundEngine.playCountdownBeep(true);
          }
        } else if (d.eventType === 'pause') {
          el.pauseModal.classList.add('active');
        } else if (d.eventType === 'resume') {
          el.pauseModal.classList.remove('active');
        } else if (d.eventType === 'reset') {
          state.isPassing = false;
          state.isCorrect = false;
          state.countdownVal = 0;
          state.lastCorrectAnswer = '';
          if (el.stageAnswerPill) el.stageAnswerPill.style.display = 'none';
          if (el.correctOverlay) el.correctOverlay.style.display = 'none';
          if (el.passOverlay) el.passOverlay.style.display = 'none';
          el.victoryModal.classList.remove('active');
          el.pauseModal.classList.remove('active');
        } else if (d.eventType === 'timeout') {
          handleTimeout(d.winner === 1 ? 2 : 1);
          return;
        }

        // 6. Full Clue Synchronization
        state.title = d.title || state.title;
        state.p1 = d.p1 || state.p1;
        state.p2 = d.p2 || state.p2;
        state.activePlayer = d.activePlayer || state.activePlayer;
        state.status = d.status || state.status;
        state.countdownVal = d.countdownVal !== undefined ? d.countdownVal : state.countdownVal;
        state.isPassing = d.isPassing !== undefined ? d.isPassing : state.isPassing;
        state.isCorrect = d.isCorrect !== undefined ? d.isCorrect : state.isCorrect;
        state.correctAnswer = d.correctAnswer || '';
        state.passRemaining = d.passRemaining !== undefined ? d.passRemaining : state.passRemaining;
        state.lastCorrectAnswer = ''; // When next prompt is displayed, hide previous answer!
        state.clueIndex = d.clueIndex !== undefined ? d.clueIndex : state.clueIndex;

        if (d.promptImage) {
          if (!state.clues[state.clueIndex]) state.clues[state.clueIndex] = {};
          state.clues[state.clueIndex].image = d.promptImage;
          state.clues[state.clueIndex].id = d.promptId || ('clue_' + state.clueIndex);
          state.clues[state.clueIndex].answer = d.promptAnswer;
        }

        updateArenaUI();
      } catch (err) {
        console.warn('Error handling server event', err);
      }
    };
  }

  // Forward local host commands to server when connected
  function sendServerCommand(cmd, payload = {}) {
    if (isServerConnected && location.protocol.startsWith('http')) {
      fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cmd, ...payload })
      }).catch(() => {});
      return true;
    }
    return false;
  }

  // Header Nav & View Switcher
  function switchToView(viewName) {
    // Hide all views & remove active nav classes
    el.viewArena.classList.remove('active');
    el.viewDirectory.classList.remove('active');
    el.viewSetup.classList.remove('active');

    el.btnNavArena.classList.remove('active');
    el.btnNavDirectory.classList.remove('active');
    el.btnNavSetup.classList.remove('active');

    if (viewName === 'arena') {
      el.viewArena.classList.add('active');
      el.btnNavArena.classList.add('active');
      updateArenaUI();
    } else if (viewName === 'directory') {
      el.viewDirectory.classList.add('active');
      el.btnNavDirectory.classList.add('active');
      renderDirectory();
    } else if (viewName === 'setup') {
      el.viewSetup.classList.add('active');
      el.btnNavSetup.classList.add('active');
      renderSetupForm();
    }
  }

  el.btnNavArena.addEventListener('click', () => switchToView('arena'));
  el.btnNavDirectory.addEventListener('click', () => {
    if (state.status === 'running') pauseRunning();
    switchToView('directory');
  });
  el.btnQuickChangeGame.addEventListener('click', () => {
    if (state.status === 'running') pauseRunning();
    switchToView('directory');
  });
  el.btnNavSetup.addEventListener('click', () => {
    if (state.status === 'running') pauseRunning();
    switchToView('setup');
  });

  // Render Game Directory / Library Index
  function renderDirectory() {
    if (!el.directoryGrid) return;
    el.directoryGrid.innerHTML = '';

    const games = (typeof GameRegistry !== 'undefined') 
      ? GameRegistry.getAll() 
      : [GAME_ICE_CREAM, GAME_TORONTO_LANDMARKS];

    games.forEach(game => {
      const card = document.createElement('div');
      card.className = 'game-card';

      // Banner with dynamic theme
      const banner = document.createElement('div');
      banner.className = 'game-card-banner';
      banner.style.background = game.bannerColor || 'linear-gradient(135deg, #1e3a8a, #3b82f6)';

      const icon = document.createElement('div');
      icon.className = 'game-card-icon';
      icon.textContent = game.id === 'hairstyles' ? '💈' : (game.id === 'countries' ? '🌍' : (game.id === 'ice-cream-flavours' ? '🍦' : (game.id === 'toronto-landmarks' ? '🏢' : '🎯')));

      const badge = document.createElement('div');
      badge.className = 'game-card-badge';
      badge.textContent = game.difficulty || 'Custom Pack';

      banner.appendChild(icon);
      banner.appendChild(badge);

      // Card Body
      const body = document.createElement('div');
      body.className = 'game-card-body';

      const title = document.createElement('h3');
      title.className = 'game-card-title';
      title.textContent = game.title;

      const desc = document.createElement('p');
      desc.className = 'game-card-desc';
      desc.textContent = game.description || 'Fast-paced 1v1 visual identification duel.';

      const meta = document.createElement('div');
      meta.className = 'game-card-meta';
      meta.innerHTML = `
        <span class="meta-pill">🖼️ ${game.clues.length} Prompts</span>
        <span class="meta-pill">⏱️ ${game.defaultTimer || 45}s</span>
        <span class="meta-pill">🏷️ ${game.category || 'General'}</span>
      `;

      const actions = document.createElement('div');
      actions.className = 'game-card-actions';

      const playBtn = document.createElement('button');
      playBtn.className = 'btn-play-game';
      playBtn.innerHTML = '▶ PLAY DUEL';
      playBtn.addEventListener('click', () => {
        loadGameToArena(game);
      });

      const editBtn = document.createElement('button');
      editBtn.className = 'btn-edit-game';
      editBtn.innerHTML = '⚙️ Customize';
      editBtn.addEventListener('click', () => {
        loadGameToSetup(game);
      });

      actions.appendChild(playBtn);
      actions.appendChild(editBtn);

      body.appendChild(title);
      body.appendChild(desc);
      body.appendChild(meta);
      body.appendChild(actions);

      card.appendChild(banner);
      card.appendChild(body);
      el.directoryGrid.appendChild(card);
    });

    // Create New Game Card
    const newCard = document.createElement('div');
    newCard.className = 'game-card game-card-new';
    newCard.innerHTML = `
      <div class="new-icon">➕</div>
      <h3 style="font-size: 1.35rem; margin-bottom: 6px; color: #fff;">Create Custom Game</h3>
      <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 16px; max-width: 280px;">
        Upload your own JPEG pictures and answers to build a brand new category
      </p>
      <button class="btn-secondary" style="border-color: var(--gold); color: var(--gold); font-weight: 700;">Open Game Builder</button>
    `;
    newCard.addEventListener('click', () => {
      switchToView('setup');
    });
    el.directoryGrid.appendChild(newCard);
  }

  function loadGameToArena(game) {
    state.title = game.title;
    state.clues = [...game.clues];
    state.roundTime = game.defaultTimer || 45;
    state.p1.maxTime = state.roundTime;
    state.p1.timeRemaining = state.roundTime;
    state.p2.maxTime = state.roundTime;
    state.p2.timeRemaining = state.roundTime;
    persistCurrentGame();
    sendServerCommand('select_game', { gameId: game.id });
    resetRound();
    switchToView('arena');
  }

  function loadGameToSetup(game) {
    state.title = game.title;
    state.clues = [...game.clues];
    state.roundTime = game.defaultTimer || 45;
    state.p1.maxTime = state.roundTime;
    state.p1.timeRemaining = state.roundTime;
    state.p2.maxTime = state.roundTime;
    state.p2.timeRemaining = state.roundTime;
    persistCurrentGame();
    switchToView('setup');
  }

  // Sound Toggle
  el.btnSoundToggle.addEventListener('click', () => {
    window.soundEngine.muted = !window.soundEngine.muted;
    el.btnSoundToggle.textContent = window.soundEngine.muted ? '🔇 Sound Off' : '🔊 Sound On';
  });

  // Fullscreen Toggle
  el.btnFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  // Dual Screen / Open Arena Window
  el.btnDualScreen.addEventListener('click', () => {
    window.open('arena.html', '_blank', 'width=1280,height=720');
  });

  // --- SETUP & UPLOADER MANAGER ---
  function renderSetupForm() {
    el.inputGameTitle.value = state.title;
    el.inputP1Name.value = state.p1.name;
    el.inputP2Name.value = state.p2.name;
    el.inputRoundTime.value = state.roundTime;
    el.labelRoundTime.textContent = `${state.roundTime}s`;
    el.selectPassRule.value = state.passPenaltySeconds.toString();
    renderClueGrid();
  }

  el.inputRoundTime.addEventListener('input', (e) => {
    el.labelRoundTime.textContent = `${e.target.value}s`;
  });

  function renderClueGrid() {
    el.clueListGrid.innerHTML = '';
    el.clueCountBadge.textContent = `${state.clues.length} clues`;

    state.clues.forEach((clue, idx) => {
      const card = document.createElement('div');
      card.className = 'clue-card';

      const thumb = document.createElement('img');
      thumb.className = 'clue-thumb';
      thumb.src = clue.image;

      const info = document.createElement('div');
      info.className = 'clue-info';

      const label = document.createElement('span');
      label.style.fontSize = '0.75rem';
      label.style.color = 'var(--text-muted)';
      label.textContent = `Clue #${idx + 1}`;

      const input = document.createElement('input');
      input.className = 'clue-answer-input';
      input.value = clue.answer;
      input.placeholder = "Enter expected answer...";
      input.addEventListener('input', (e) => {
        clue.answer = e.target.value;
        persistCurrentGame();
      });

      info.appendChild(label);
      info.appendChild(input);

      const delBtn = document.createElement('button');
      delBtn.className = 'clue-delete-btn';
      delBtn.innerHTML = '🗑️';
      delBtn.title = 'Delete clue';
      delBtn.addEventListener('click', () => {
        state.clues.splice(idx, 1);
        renderClueGrid();
        persistCurrentGame();
      });

      card.appendChild(thumb);
      card.appendChild(info);
      card.appendChild(delBtn);
      el.clueListGrid.appendChild(card);
    });
  }

  // Drag & Drop / File Upload Handler
  el.dropzone.addEventListener('click', () => el.fileInput.click());

  el.dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    el.dropzone.classList.add('drag-over');
  });

  el.dropzone.addEventListener('dragleave', () => {
    el.dropzone.classList.remove('drag-over');
  });

  el.dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    el.dropzone.classList.remove('drag-over');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files);
    }
  });

  el.fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesUpload(e.target.files);
    }
  });

  function cleanFileNameToAnswer(fileName) {
    // e.g. "01_CN-Tower.jpeg" -> "CN Tower"
    return fileName
      .replace(/\.[^/.]+$/, "") // strip extension
      .replace(/^[\d\s_\-\.]+/, "") // strip leading numbers/symbols
      .replace(/[-_]+/g, " ") // replace dash/underscore with space
      .trim();
  }

  function handleFilesUpload(files) {
    const fileList = Array.from(files);
    let loadedCount = 0;

    fileList.forEach(file => {
      if (!file.type.match(/^image\//i)) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const suggestedAnswer = cleanFileNameToAnswer(file.name);
        state.clues.push({
          id: 'clue_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
          answer: suggestedAnswer || "Answer",
          image: event.target.result
        });
        loadedCount++;
        if (loadedCount === fileList.length) {
          renderClueGrid();
          persistCurrentGame();
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // Load Ice Cream Pack
  if (el.btnLoadIceCream) {
    el.btnLoadIceCream.addEventListener('click', () => {
      if (typeof GAME_ICE_CREAM !== 'undefined') {
        if (confirm('Load Ice Cream Flavours Pack? (Replaces current clues)')) {
          state.clues = [...GAME_ICE_CREAM.clues];
          state.title = GAME_ICE_CREAM.title;
          renderSetupForm();
          persistCurrentGame();
        }
      }
    });
  }

  // Load Starter Pack
  el.btnLoadStarter.addEventListener('click', () => {
    if (confirm('Load Toronto Starter Pack? (Replaces current clues)')) {
      state.clues = [...TORONTO_STARTER_PACK];
      state.title = "Landmarks of Toronto";
      renderSetupForm();
      persistCurrentGame();
    }
  });

  // Clear All Clues
  el.btnClearAll.addEventListener('click', () => {
    if (confirm('Clear all visual clues?')) {
      state.clues = [];
      renderClueGrid();
      persistCurrentGame();
    }
  });

  // Export to JSON file
  el.btnExportJson.addEventListener('click', () => {
    const exportData = {
      app: "The Floor Toronto",
      version: "1.0",
      title: el.inputGameTitle.value || state.title,
      roundTime: parseInt(el.inputRoundTime.value, 10) || 45,
      passPenaltySeconds: parseInt(el.selectPassRule.value, 10),
      clues: state.clues
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(exportData.title || 'the-floor-game').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Import from JSON file
  el.btnImportJson.addEventListener('click', () => el.importFileInput.click());

  el.importFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.clues && Array.isArray(imported.clues)) {
          state.title = imported.title || state.title;
          state.roundTime = imported.roundTime || state.roundTime;
          state.passPenaltySeconds = imported.passPenaltySeconds !== undefined ? imported.passPenaltySeconds : state.passPenaltySeconds;
          state.clues = imported.clues;
          renderSetupForm();
          persistCurrentGame();
          alert(`Imported ${imported.clues.length} visual prompts successfully!`);
        } else {
          alert('Invalid game JSON file format.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  });

  // Launch Duel Button
  el.btnLaunchDuel.addEventListener('click', () => {
    state.title = el.inputGameTitle.value.trim() || "The Floor Toronto";
    state.p1.name = el.inputP1Name.value.trim() || "Player 1";
    state.p2.name = el.inputP2Name.value.trim() || "Player 2";
    state.roundTime = parseInt(el.inputRoundTime.value, 10) || 45;
    state.p1.maxTime = state.roundTime;
    state.p2.maxTime = state.roundTime;
    state.p1.timeRemaining = state.roundTime;
    state.p2.timeRemaining = state.roundTime;
    state.passPenaltySeconds = parseInt(el.selectPassRule.value, 10);

    if (state.clues.length === 0) {
      alert('Please upload at least 1 image or load the Toronto Starter Pack before launching!');
      return;
    }

    persistCurrentGame();
    resetRound();
    switchToView('arena');
  });

  // Simple Confetti effect for victory
  function triggerConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#00f0ff', '#ff2e63', '#ffd369', '#00e676', '#ffffff'];

    for (let i = 0; i < 150; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        w: Math.random() * 10 + 6,
        h: Math.random() * 14 + 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        velY: Math.random() * 4 + 3,
        velX: (Math.random() - 0.5) * 4,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 8
      });
    }

    let frames = 0;
    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.y += p.velY;
        p.x += p.velX;
        p.rot += p.rotSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      frames++;
      if (frames < 240 && state.status === 'gameover') {
        requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    render();
  }

  // Initialize
  loadPersistedGame();
  initServerEvents();
  updateArenaUI();
  animationId = requestAnimationFrame(gameLoop);

})();
