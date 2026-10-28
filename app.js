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
    // Views
    viewLanding: document.getElementById('viewLanding'),
    viewTerritory: document.getElementById('viewTerritory'),
    viewArena: document.getElementById('viewArena'),
    viewDirectory: document.getElementById('viewDirectory'),
    viewSetup: document.getElementById('viewSetup'),

    // Nav
    btnLogoHome: document.getElementById('btnLogoHome'),
    btnNavLanding: document.getElementById('btnNavLanding'),
    btnNavTerritory: document.getElementById('btnNavTerritory'),
    btnNavArena: document.getElementById('btnNavArena'),
    btnNavDirectory: document.getElementById('btnNavDirectory'),
    btnNavSetup: document.getElementById('btnNavSetup'),

    // Landing Page
    btnLandingCreateGame: document.getElementById('btnLandingCreateGame'),
    btnLandingLoadGame: document.getElementById('btnLandingLoadGame'),
    landingSavedStatusText: document.getElementById('landingSavedStatusText'),

    // Create Game Modal
    modalCreateGame: document.getElementById('modalCreateGame'),
    inputPlayerNames: document.getElementById('inputPlayerNames'),
    createGameCountBadge: document.getElementById('createGameCountBadge'),
    createGameGridBadge: document.getElementById('createGameGridBadge'),
    btnCloseCreateGameModal: document.getElementById('btnCloseCreateGameModal'),
    btnCancelCreateGame: document.getElementById('btnCancelCreateGame'),
    btnSubmitPlayers: document.getElementById('btnSubmitPlayers'),
    btnPreset9: document.getElementById('btnPreset9'),
    btnPreset16: document.getElementById('btnPreset16'),
    btnPreset25: document.getElementById('btnPreset25'),
    btnPreset49: document.getElementById('btnPreset49'),
    btnPreset100: document.getElementById('btnPreset100'),
    playerRosterContainer: document.getElementById('playerRosterContainer'),
    btnAddRosterPlayer: document.getElementById('btnAddRosterPlayer'),
    btnRandomizeCategories: document.getElementById('btnRandomizeCategories'),
    btnToggleBulkPaste: document.getElementById('btnToggleBulkPaste'),
    bulkPasteBox: document.getElementById('bulkPasteBox'),
    btnApplyBulkPaste: document.getElementById('btnApplyBulkPaste'),

    // Territory View
    btnTerritoryHome: document.getElementById('btnTerritoryHome'),
    btnTerritoryNewGame: document.getElementById('btnTerritoryNewGame'),
    btnTerritorySaveGame: document.getElementById('btnTerritorySaveGame'),
    btnTerritoryGoArena: document.getElementById('btnTerritoryGoArena'),
    territoryPlayerCount: document.getElementById('territoryPlayerCount'),
    territoryGrid: document.getElementById('territoryGrid'),

    // Territory Randomizer & Challenge Elements
    btnTerritoryRandomizer: document.getElementById('btnTerritoryRandomizer'),
    btnRandomizerText: document.getElementById('btnRandomizerText'),
    territoryBanner: document.getElementById('territoryBanner'),
    territoryBannerDefault: document.getElementById('territoryBannerDefault'),
    territoryBannerActive: document.getElementById('territoryBannerActive'),
    bannerChallengerName: document.getElementById('bannerChallengerName'),
    bannerSubtext: document.getElementById('bannerSubtext'),
    btnBannerReturnToFloor: document.getElementById('btnBannerReturnToFloor'),
    btnCancelChallenger: document.getElementById('btnCancelChallenger'),
    btnRerollRandomizer: document.getElementById('btnRerollRandomizer'),

    // Duel Matchup Modal
    modalDuelMatchup: document.getElementById('modalDuelMatchup'),
    btnCloseMatchupModal: document.getElementById('btnCloseMatchupModal'),
    matchupP1Name: document.getElementById('matchupP1Name'),
    matchupP2Name: document.getElementById('matchupP2Name'),
    selectMatchupCategory: document.getElementById('selectMatchupCategory'),
    btnCancelMatchup: document.getElementById('btnCancelMatchup'),
    btnConfirmStartDuel: document.getElementById('btnConfirmStartDuel'),

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
    if (el.pauseLabel) el.pauseLabel.textContent = 'PAUSE (ESC)';
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
    if (el.pauseLabel) el.pauseLabel.textContent = 'RESUME (ESC)';
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
    if (el.pauseLabel) el.pauseLabel.textContent = 'START (ESC / SPACE)';

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
      if (el.pauseLabel) el.pauseLabel.textContent = 'START DUEL (SPACE)';
    } else if (state.status === 'countdown') {
      if (el.startingSoonOverlay) el.startingSoonOverlay.style.display = 'none';
      if (el.countdownOverlay) el.countdownOverlay.style.display = 'flex';
      if (el.countdownNumber) el.countdownNumber.textContent = state.countdownVal || 3;
      if (el.passOverlay) el.passOverlay.style.display = 'none';
      if (el.correctOverlay) el.correctOverlay.style.display = 'none';
      if (el.stageAnswerPill) el.stageAnswerPill.style.display = 'none';
      el.clueImage.style.display = 'none';
      if (el.pauseLabel) el.pauseLabel.textContent = `STARTING IN ${state.countdownVal || 3}...`;
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

  // Unlock audio context on first user interaction
  window.addEventListener('pointerdown', () => {
    window.soundEngine?.init();
  }, { once: true });

  // Dock & Control Button Listeners (if present on view)
  if (el.btnCorrect) {
    el.btnCorrect.addEventListener('click', () => {
      window.soundEngine.init();
      handleCorrect();
    });
  }

  if (el.btnPass) {
    el.btnPass.addEventListener('click', () => {
      window.soundEngine.init();
      handlePass();
    });
  }

  if (el.btnPause) {
    el.btnPause.addEventListener('click', () => {
      window.soundEngine.init();
      togglePause();
    });
  }

  if (el.btnReset) {
    el.btnReset.addEventListener('click', () => {
      window.soundEngine.init();
      if (confirm('Reset the duel round?')) {
        resetRound();
      }
    });
  }

  if (el.btnResume) {
    el.btnResume.addEventListener('click', () => {
      startRunning();
    });
  }

  if (el.btnRematch) {
    el.btnRematch.addEventListener('click', () => {
      resetRound();
      startRunning();
    });
  }

  if (el.btnBackToSetup) {
    el.btnBackToSetup.addEventListener('click', () => {
      resetRound();
      switchToView('setup');
    });
  }

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

        // Territory Sync
        if (d.territory) {
          territoryGame = d.territory;
          try {
            localStorage.setItem('the_floor_territory_game', JSON.stringify(territoryGame));
            updateLandingSavedStatus();
          } catch (e) {}
        }

        // Territory Events
        if (d.eventType === 'return_to_territory') {
          if (el.victoryModal) el.victoryModal.classList.remove('active');
          if (el.pauseModal) el.pauseModal.classList.remove('active');

          if (d.isFloorConquered && d.grandChampion) {
            clearChallengerState();
            renderTerritoryGrid();
            switchToView('territory');
            triggerChampionCelebration(d.grandChampion);
            return;
          }

          if (d.activeChallenger) {
            activeChallenger = d.activeChallenger;
            if (el.bannerChallengerName) {
              const catLabel = d.activeChallenger.categoryTitle || d.activeChallenger.category || '';
              el.bannerChallengerName.textContent = catLabel
                ? `${d.activeChallenger.name} (🎯 ${catLabel})`
                : d.activeChallenger.name;
            }
            if (el.territoryBannerDefault) el.territoryBannerDefault.style.display = 'none';
            if (el.territoryBannerActive) el.territoryBannerActive.style.display = 'flex';
            if (el.bannerSubtext) {
              el.bannerSubtext.textContent = d.isReigningWinner
                ? 'won the duel! Decision: Challenge another player or Return to the Floor!'
                : 'Host is selecting the defender to duel!';
            }
            if (el.btnBannerReturnToFloor) {
              el.btnBannerReturnToFloor.style.display = d.isReigningWinner ? 'inline-block' : 'none';
            }
            renderTerritoryGrid();
          } else {
            clearChallengerState();
          }
          switchToView('territory');
          return;
        }

        if (d.eventType === 'randomizer_spin' && d.challenger) {
          if (el.btnBannerReturnToFloor) el.btnBannerReturnToFloor.style.display = 'none';
          runTerritoryRandomizerAnimation(d.challenger, d.adjacentDefenders || []);
          return;
        }

        if (d.eventType === 'challenger_cancelled') {
          if (el.btnBannerReturnToFloor) el.btnBannerReturnToFloor.style.display = 'none';
          clearChallengerState();
          return;
        }

        if (d.eventType === 'duel_players_set') {
          state.p1 = d.p1 || state.p1;
          state.p2 = d.p2 || state.p2;
          state.status = 'ready';
          state.activePlayer = 1;
          state.clueIndex = 0;
          state.winner = null;
          state.isPassing = false;
          state.isCorrect = false;
          state.correctAnswer = '';
          state.lastCorrectAnswer = '';
          updateArenaUI();
          switchToView('arena');
          return;
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

  // Territory Floor State & Contestant Presets
  let territoryGame = {
    players: [],
    cols: 4,
    rows: 4,
    grid: []
  };

  const SAMPLE_NAMES = [
    "Alex", "Jordan", "Sam", "Taylor", "Morgan", "Casey", "Riley", "Chris",
    "Avery", "Dakota", "Jamie", "Kendall", "Reese", "Quinn", "Skyler", "Jesse",
    "Cameron", "Drew", "Hayden", "Logan", "Peyton", "Rowan", "Sydney", "Adrian",
    "Bailey", "Harper", "Finley", "Emerson", "Sage", "River", "Dallas", "Phoenix",
    "Elliott", "Sawyer", "Kai", "Rory", "Parker", "Eden", "Shiloh", "Amari",
    "Lennon", "Milan", "Remy", "Oakley", "Tatum", "Blair", "Sutton", "Ellis",
    "Hollis", "Winter", "Robin", "Frankie", "Stevie", "Murphy", "Chandler", "Corey",
    "Marley", "Wren", "Kieran", "Briar", "Shay", "Jules", "Lennox", "August",
    "Justice", "Monroe", "Sterling", "Campbell", "Linden", "Zephyr", "Raine", "Toby",
    "Micah", "Nico", "Bellamy", "Bowie", "Greer", "Denver", "Harley", "Salem",
    "Keegan", "Onyx", "Shiloh", "Sloan", "Navy", "Palmer", "Aspen", "Cypress",
    "Indigo", "Haven", "True", "Atlas", "Echo", "Jordy", "Lyric", "Nova",
    "Orion", "Pax", "Storm", "Vale"
  ];

  function getPlayerColor(index, total) {
    const hue = Math.round((index * 137.508) % 360);
    return `hsl(${hue}, 88%, 62%)`;
  }

  let rosterState = [];

  function getAvailableCategories() {
    if (typeof GameRegistry !== 'undefined' && typeof GameRegistry.getAll === 'function') {
      const all = GameRegistry.getAll();
      if (all && all.length > 0) {
        return all.map(g => ({ id: g.id, title: g.title }));
      }
    }
    return [
      { id: 'tennis', title: 'Tennis' },
      { id: 'dog-breeds', title: 'Dog Breeds' },
      { id: 'watch-brands', title: 'Watch Brands' },
      { id: 'countries', title: 'Countries' },
      { id: 'hairstyles', title: 'Hairstyles' },
      { id: 'ice-cream-flavours', title: 'Ice Cream Flavours' },
      { id: 'toronto-landmarks', title: 'Landmarks of Toronto' }
    ];
  }

  function parsePlayerNames(text) {
    if (!text) return [];
    return text
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(Boolean);
  }

  function updateCreateGameBadges() {
    const count = rosterState.length;
    const cols = count > 0 ? Math.ceil(Math.sqrt(count)) : 0;
    const rows = count > 0 ? Math.ceil(count / cols) : 0;

    if (el.createGameCountBadge) {
      el.createGameCountBadge.textContent = `${count} Player${count === 1 ? '' : 's'}`;
    }
    if (el.createGameGridBadge) {
      el.createGameGridBadge.textContent = `Grid: ${cols} × ${rows}`;
    }
  }

  function renderRosterRows() {
    if (!el.playerRosterContainer) return;
    el.playerRosterContainer.innerHTML = '';
    const categories = getAvailableCategories();

    updateCreateGameBadges();

    rosterState.forEach((player, idx) => {
      const row = document.createElement('div');
      row.className = 'player-roster-row';

      const numSpan = document.createElement('span');
      numSpan.className = 'player-roster-num';
      numSpan.textContent = `#${idx + 1}`;

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.className = 'form-input player-roster-name';
      nameInput.value = player.name;
      nameInput.placeholder = `Player ${idx + 1} Name`;
      nameInput.addEventListener('input', (e) => {
        player.name = e.target.value;
      });

      const catSelect = document.createElement('select');
      catSelect.className = 'form-input player-roster-category';
      categories.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.title;
        if (c.id === player.category) opt.selected = true;
        catSelect.appendChild(opt);
      });
      catSelect.addEventListener('change', (e) => {
        const selected = categories.find(c => c.id === e.target.value);
        player.category = e.target.value;
        player.categoryTitle = selected ? selected.title : e.target.value;
      });

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'btn-remove-roster-row';
      removeBtn.textContent = '✕';
      removeBtn.title = 'Remove player';
      removeBtn.addEventListener('click', () => {
        rosterState.splice(idx, 1);
        renderRosterRows();
      });

      row.appendChild(numSpan);
      row.appendChild(nameInput);
      row.appendChild(catSelect);
      row.appendChild(removeBtn);
      el.playerRosterContainer.appendChild(row);
    });
  }

  function initRosterWithPreset(count) {
    const categories = getAvailableCategories();
    rosterState = [];
    for (let i = 0; i < count; i++) {
      const sampleName = SAMPLE_NAMES[i % SAMPLE_NAMES.length];
      const cat = categories[i % categories.length];
      rosterState.push({
        name: sampleName,
        category: cat.id,
        categoryTitle: cat.title
      });
    }
    renderRosterRows();
  }

  function openCreateGameModal() {
    if (el.modalCreateGame) {
      el.modalCreateGame.classList.add('active');
      if (rosterState.length === 0) {
        initRosterWithPreset(16);
      } else {
        renderRosterRows();
      }
    }
  }

  function closeCreateGameModal() {
    if (el.modalCreateGame) el.modalCreateGame.classList.remove('active');
  }

  function handleCreateGameSubmit() {
    const validRows = rosterState.filter(r => r.name.trim().length > 0);
    if (validRows.length < 2) {
      alert('Please enter at least 2 player names to build the territory floor.');
      return;
    }

    const availableCats = getAvailableCategories();
    const cols = Math.ceil(Math.sqrt(validRows.length));
    const rows = Math.ceil(validRows.length / cols);

    const players = validRows.map((r, idx) => {
      const catObj = availableCats.find(c => c.id === r.category) || availableCats[idx % availableCats.length];
      return {
        id: 'p_' + (idx + 1),
        number: idx + 1,
        name: r.name.trim(),
        category: r.category || catObj.id,
        categoryTitle: r.categoryTitle || catObj.title,
        color: getPlayerColor(idx, validRows.length),
        territoryCount: 1,
        active: true,
        hasDueled: false
      };
    });

    const grid = players.map((p, idx) => ({
      squareIndex: idx,
      playerId: p.id,
      playerName: p.name,
      playerCategory: p.category,
      playerCategoryTitle: p.categoryTitle,
      color: p.color
    }));

    territoryGame = {
      createdAt: Date.now(),
      players: players,
      cols: cols,
      rows: rows,
      grid: grid
    };

    saveTerritoryGame();
    closeCreateGameModal();
    renderTerritoryGrid();
    switchToView('territory');
  }

  function saveTerritoryGame() {
    try {
      localStorage.setItem('the_floor_territory_game', JSON.stringify(territoryGame));
      updateLandingSavedStatus();
      sendServerCommand('sync_territory', { territory: territoryGame });
    } catch (e) {
      console.warn('Could not persist territory game to localStorage', e);
    }
  }

  function loadTerritoryGame() {
    try {
      const saved = localStorage.getItem('the_floor_territory_game');
      if (saved) {
        territoryGame = JSON.parse(saved);
        sendServerCommand('sync_territory', { territory: territoryGame });
        return true;
      }
    } catch (e) {
      console.warn('Error loading territory game', e);
    }
    return false;
  }

  function handleLoadGameClick() {
    if (loadTerritoryGame()) {
      sendServerCommand('sync_territory', { territory: territoryGame });
      renderTerritoryGrid();
      switchToView('territory');
    } else {
      alert('No saved territory game found! Let\'s create one now.');
      openCreateGameModal();
    }
  }

  function updateLandingSavedStatus() {
    if (!el.landingSavedStatusText) return;
    try {
      const saved = localStorage.getItem('the_floor_territory_game');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.players && parsed.players.length > 0) {
          el.landingSavedStatusText.innerHTML = `Saved Floor: <strong>${parsed.players.length} Players</strong> (${parsed.cols}×${parsed.rows} Grid). Click <strong>LOAD GAME</strong> to continue!`;
          return;
        }
      }
    } catch (e) {}
    el.landingSavedStatusText.innerHTML = `Click <strong>CREATE GAME</strong> to start your first territory battle!`;
  }

  let activeChallenger = null;
  let pendingDefender = null;
  let isRandomizerSpinning = false;

  // Calculate all competitors whose territory directly shares an orthogonal edge with challenger's territory
  function getAdjacentCompetitors(challengerId) {
    if (!territoryGame || !territoryGame.grid || !territoryGame.players) return [];
    const cols = territoryGame.cols;
    const rows = territoryGame.rows;

    const challengerSquares = territoryGame.grid.filter(sq => sq.playerId === challengerId);
    if (challengerSquares.length === 0) return [];

    const adjacentPlayerMap = new Map();

    challengerSquares.forEach(cs => {
      const r = Math.floor(cs.squareIndex / cols);
      const c = cs.squareIndex % cols;

      // Orthogonal neighbors: North, South, West, East
      const neighbors = [
        { r: r - 1, c: c },
        { r: r + 1, c: c },
        { r: r, c: c - 1 },
        { r: r, c: c + 1 }
      ];

      neighbors.forEach(n => {
        if (n.r >= 0 && n.r < rows && n.c >= 0 && n.c < cols) {
          const neighborIdx = n.r * cols + n.c;
          const neighborSq = territoryGame.grid[neighborIdx];
          if (neighborSq && neighborSq.playerId && neighborSq.playerId !== challengerId) {
            const competitor = territoryGame.players.find(p => p.id === neighborSq.playerId);
            if (competitor && competitor.active !== false) {
              if (!adjacentPlayerMap.has(competitor.id)) {
                adjacentPlayerMap.set(competitor.id, {
                  player: competitor,
                  squareIndices: []
                });
              }
              adjacentPlayerMap.get(competitor.id).squareIndices.push(neighborIdx);
            }
          }
        }
      });
    });

    // Fallback: If no orthogonal neighbors found (e.g., small or diagonal-only layout), check 8-way diagonal neighbors
    if (adjacentPlayerMap.size === 0) {
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
              const sq = territoryGame.grid[idx];
              if (sq && sq.playerId && sq.playerId !== challengerId) {
                const comp = territoryGame.players.find(p => p.id === sq.playerId);
                if (comp && comp.active !== false && !adjacentPlayerMap.has(comp.id)) {
                  adjacentPlayerMap.set(comp.id, { player: comp, squareIndices: [idx] });
                }
              }
            }
          }
        }
      });
    }

    return Array.from(adjacentPlayerMap.values());
  }

  function setChallengerState(challenger) {
    activeChallenger = challenger;
    pendingDefender = null;

    if (el.bannerChallengerName) {
      const catLabel = challenger.categoryTitle || challenger.category || '';
      el.bannerChallengerName.textContent = catLabel
        ? `${challenger.name} (🎯 ${catLabel})`
        : challenger.name;
    }
    if (el.bannerSubtext) {
      el.bannerSubtext.textContent = 'Host is selecting the defender to duel!';
    }
    if (el.btnBannerReturnToFloor) {
      el.btnBannerReturnToFloor.style.display = 'none';
    }
    if (el.territoryBannerDefault) el.territoryBannerDefault.style.display = 'none';
    if (el.territoryBannerActive) el.territoryBannerActive.style.display = 'flex';

    renderTerritoryGrid();
  }

  function clearChallengerState() {
    activeChallenger = null;
    pendingDefender = null;

    if (el.btnBannerReturnToFloor) {
      el.btnBannerReturnToFloor.style.display = 'none';
    }
    if (el.territoryBannerDefault) el.territoryBannerDefault.style.display = 'flex';
    if (el.territoryBannerActive) el.territoryBannerActive.style.display = 'none';

    renderTerritoryGrid();
  }

  // Triggered when Host Remote commands the Randomizer to run
  function runTerritoryRandomizerAnimation(chosenPlayer, adjacentDefenders = []) {
    if (isRandomizerSpinning) return;
    if (!territoryGame || !territoryGame.grid || territoryGame.grid.length === 0) return;

    switchToView('territory');

    activeChallenger = null;
    pendingDefender = null;
    isRandomizerSpinning = true;

    if (el.territoryBannerDefault) el.territoryBannerDefault.style.display = 'none';
    if (el.territoryBannerActive) el.territoryBannerActive.style.display = 'flex';
    if (el.bannerChallengerName) el.bannerChallengerName.textContent = '🎲 SPINNING...';

    renderTerritoryGrid();

    const tiles = Array.from(el.territoryGrid.querySelectorAll('.territory-tile'));
    const totalHops = 24;
    let hop = 0;

    function stepRoulette() {
      tiles.forEach(t => t.classList.remove('is-spin-highlight'));

      if (hop >= totalHops) {
        // Find tiles for chosen player
        const targetTiles = tiles.filter((_, i) => {
          const sq = territoryGame.grid[i];
          return sq && sq.playerId === chosenPlayer.id;
        });

        targetTiles.forEach(t => t.classList.add('is-spin-highlight'));
        window.soundEngine?.playVictory();

        setTimeout(() => {
          tiles.forEach(t => t.classList.remove('is-spin-highlight'));
          isRandomizerSpinning = false;
          setChallengerState(chosenPlayer);
        }, 500);
        return;
      }

      const randomTile = tiles[Math.floor(Math.random() * tiles.length)];
      if (randomTile) {
        randomTile.classList.add('is-spin-highlight');
        window.soundEngine?.playTick();
      }

      hop++;
      const delay = Math.round(40 + Math.pow(hop / totalHops, 2) * 140);
      setTimeout(stepRoulette, delay);
    }

    stepRoulette();
  }

  function renderTerritoryGrid() {
    if (!el.territoryGrid) return;
    el.territoryGrid.innerHTML = '';

    if (!territoryGame || !territoryGame.grid || territoryGame.grid.length === 0) {
      if (el.territoryPlayerCount) el.territoryPlayerCount.textContent = '0';
      el.territoryGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 60px 20px; text-align: center; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 12px;">🗺️</div>
          <h3 style="color: #fff; font-size: 1.4rem; margin-bottom: 8px;">No Territory Created Yet</h3>
          <p style="margin-bottom: 20px;">Create a game to generate the floor grid.</p>
          <button id="btnEmptyCreateGame" class="btn-launch" style="padding: 10px 24px;">⚡ Create Game</button>
        </div>
      `;
      const emptyBtn = document.getElementById('btnEmptyCreateGame');
      if (emptyBtn) emptyBtn.addEventListener('click', openCreateGameModal);
      return;
    }

    if (el.territoryPlayerCount) {
      const activeCount = territoryGame.players.filter(p => p.active !== false).length;
      el.territoryPlayerCount.textContent = activeCount;
    }

    el.territoryGrid.style.gridTemplateColumns = `repeat(${territoryGame.cols}, minmax(0, 1fr))`;

    // 1. Group squares by player to determine merged territory and centroid primary tile
    const playerSquaresMap = new Map();
    territoryGame.grid.forEach(sq => {
      if (!playerSquaresMap.has(sq.playerId)) {
        playerSquaresMap.set(sq.playerId, []);
      }
      playerSquaresMap.get(sq.playerId).push(sq);
    });

    const primarySquareMap = new Map(); // playerId -> primary squareIndex
    playerSquaresMap.forEach((squares, pId) => {
      if (squares.length === 1) {
        primarySquareMap.set(pId, squares[0].squareIndex);
        return;
      }
      let sumR = 0, sumC = 0;
      squares.forEach(sq => {
        const r = Math.floor(sq.squareIndex / territoryGame.cols);
        const c = sq.squareIndex % territoryGame.cols;
        sumR += r;
        sumC += c;
      });
      const avgR = sumR / squares.length;
      const avgC = sumC / squares.length;

      let bestIdx = squares[0].squareIndex;
      let minDistance = Infinity;
      squares.forEach(sq => {
        const r = Math.floor(sq.squareIndex / territoryGame.cols);
        const c = sq.squareIndex % territoryGame.cols;
        const dist = Math.hypot(r - avgR, c - avgC);
        if (dist < minDistance) {
          minDistance = dist;
          bestIdx = sq.squareIndex;
        }
      });
      primarySquareMap.set(pId, bestIdx);
    });

    // 2. Check if the floor has been conquered by a Grand Champion (1 player holds all squares)
    const activeContestants = territoryGame.players.filter(p => p.active !== false);
    const isFloorConquered = (activeContestants.length === 1 && territoryGame.grid.length > 1);
    const champion = isFloorConquered ? activeContestants[0] : null;

    if (isFloorConquered && champion) {
      el.territoryGrid.classList.add('is-conquered-floor');
      if (!isCelebrationActive) {
        triggerChampionCelebration(champion);
      }
    } else {
      el.territoryGrid.classList.remove('is-conquered-floor');
      isCelebrationActive = false;
    }

    // Determine adjacent targets if a challenger is selected
    let adjacentPlayerIds = new Set();
    if (activeChallenger) {
      const adjCompetitors = getAdjacentCompetitors(activeChallenger.id);
      adjacentPlayerIds = new Set(adjCompetitors.map(c => c.player.id));
    }

    territoryGame.grid.forEach((sq, idx) => {
      const tile = document.createElement('div');
      tile.className = 'territory-tile';
      tile.dataset.playerId = sq.playerId;

      const owner = territoryGame.players.find(p => p.id === sq.playerId);
      const tileColor = owner ? owner.color : sq.color;
      const playerName = owner ? owner.name : sq.playerName;
      const count = owner ? (owner.territoryCount || 1) : 1;

      const playerSquares = playerSquaresMap.get(sq.playerId) || [];
      const isOwnedMultiple = (playerSquares.length > 1);
      const isPrimaryTile = (!isOwnedMultiple || sq.squareIndex === primarySquareMap.get(sq.playerId));
      const isExtensionTile = (isOwnedMultiple && !isPrimaryTile);

      tile.style.setProperty('--tile-color', tileColor);
      tile.style.setProperty('--tile-glow', `${tileColor}66`);

      // Determine contiguous neighbors for border-merging
      const r = Math.floor(idx / territoryGame.cols);
      const c = idx % territoryGame.cols;
      const topSq = (r > 0) ? territoryGame.grid[(r - 1) * territoryGame.cols + c] : null;
      const bottomSq = (r < territoryGame.rows - 1) ? territoryGame.grid[(r + 1) * territoryGame.cols + c] : null;
      const leftSq = (c > 0) ? territoryGame.grid[r * territoryGame.cols + (c - 1)] : null;
      const rightSq = (c < territoryGame.cols - 1) ? territoryGame.grid[r * territoryGame.cols + (c + 1)] : null;

      const sameTop = Boolean(topSq && topSq.playerId === sq.playerId);
      const sameBottom = Boolean(bottomSq && bottomSq.playerId === sq.playerId);
      const sameLeft = Boolean(leftSq && leftSq.playerId === sq.playerId);
      const sameRight = Boolean(rightSq && rightSq.playerId === sq.playerId);

      if (isOwnedMultiple) {
        tile.classList.add('is-merged-territory');
        if (sameTop) tile.classList.add('merge-top');
        if (sameBottom) tile.classList.add('merge-bottom');
        if (sameLeft) tile.classList.add('merge-left');
        if (sameRight) tile.classList.add('merge-right');

        if (sameBottom && sameRight) {
          const cornerBridge = document.createElement('div');
          cornerBridge.className = 'tile-corner-bridge';
          tile.appendChild(cornerBridge);
        }
      }

      if (isExtensionTile) {
        tile.classList.add('is-merged-extension');
        tile.title = `${playerName}'s territory (${count} territories)`;
        // Extension tile displays subtle coordinate only, NO duplicate name or category
        const numSpan = document.createElement('span');
        numSpan.className = 'territory-tile-num';
        numSpan.textContent = `#${idx + 1}`;
        tile.appendChild(numSpan);
      } else {
        // Primary tile (single territory, or the chosen central tile for a multi-territory player):
        // CONTAINS ALL INFO ONLY ONCE: name, category, number of territories owned!
        if (isOwnedMultiple) {
          tile.classList.add('is-merged-primary');
        }

        const numSpan = document.createElement('span');
        numSpan.className = 'territory-tile-num';
        numSpan.textContent = isOwnedMultiple ? `👑` : `#${idx + 1}`;

        const labelDiv = document.createElement('div');
        labelDiv.className = 'territory-player-label';
        labelDiv.textContent = playerName;

        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'territory-player-category';
        const catText = (owner && (owner.categoryTitle || owner.category)) 
          || sq.playerCategoryTitle 
          || sq.playerCategory 
          || 'General';
        categoryDiv.textContent = catText;
        categoryDiv.title = `Category: ${catText}`;

        const footerSpan = document.createElement('span');
        footerSpan.className = 'territory-tile-footer';
        footerSpan.textContent = isOwnedMultiple ? `👑 ${count} Territories` : `${count} Territory`;

        tile.appendChild(numSpan);
        tile.appendChild(labelDiv);
        tile.appendChild(categoryDiv);
        tile.appendChild(footerSpan);
      }

      // Synchronized Hover across all tiles of this player's territory
      tile.addEventListener('mouseenter', () => {
        const selector = `.territory-tile[data-player-id="${sq.playerId}"]`;
        el.territoryGrid.querySelectorAll(selector).forEach(t => t.classList.add('is-hovered-territory'));
      });
      tile.addEventListener('mouseleave', () => {
        const selector = `.territory-tile[data-player-id="${sq.playerId}"]`;
        el.territoryGrid.querySelectorAll(selector).forEach(t => t.classList.remove('is-hovered-territory'));
      });

      // Apply Challenger, Adjacent Target, or Dimmed visual states
      if (activeChallenger) {
        if (sq.playerId === activeChallenger.id) {
          tile.classList.add('is-challenger');
          if (isPrimaryTile) {
            const challengerTag = document.createElement('span');
            challengerTag.className = 'territory-tile-challenger-tag';
            challengerTag.textContent = (count > 1) ? '👑 WINNER' : '👑 CHALLENGER';
            tile.appendChild(challengerTag);
          }
        } else if (adjacentPlayerIds.has(sq.playerId)) {
          tile.classList.add('is-adjacent-target');
          if (isPrimaryTile) {
            const targetTag = document.createElement('span');
            targetTag.className = 'territory-tile-target-tag';
            targetTag.textContent = '⚔️ CAN CHALLENGE';
            tile.appendChild(targetTag);
          }
          const catText = (owner && (owner.categoryTitle || owner.category)) || 'General';
          tile.title = `Adjacent competitor: ${playerName} (Category: ${catText})`;

          // Interactive challenge on click of ANY of their tiles
          tile.addEventListener('click', () => {
            const defender = territoryGame.players.find(p => p.id === sq.playerId);
            if (defender && activeChallenger) {
              const defCat = defender.categoryTitle || defender.category || 'General';
              if (confirm(`Challenge ${defender.name} to a duel on category: "${defCat}"?`)) {
                sendServerCommand('select_defender', {
                  challengerId: activeChallenger.id,
                  challengerName: activeChallenger.name,
                  defenderId: defender.id,
                  defenderName: defender.name,
                  category: defender.category
                });
              }
            }
          });
        } else {
          tile.classList.add('is-dimmed');
        }
      } else {
        tile.addEventListener('click', () => {
          window.soundEngine?.playTick();
          const selector = `.territory-tile[data-player-id="${sq.playerId}"]`;
          el.territoryGrid.querySelectorAll(selector).forEach(t => {
            t.style.transform = 'scale(0.96)';
            setTimeout(() => t.style.transform = '', 150);
          });
        });
      }

      el.territoryGrid.appendChild(tile);
    });
  }

  // Header Nav & View Switcher
  function switchToView(viewName) {
    // Hide all views & remove active nav classes
    if (el.viewLanding) el.viewLanding.classList.remove('active');
    if (el.viewTerritory) el.viewTerritory.classList.remove('active');
    if (el.viewArena) el.viewArena.classList.remove('active');
    if (el.viewDirectory) el.viewDirectory.classList.remove('active');
    if (el.viewSetup) el.viewSetup.classList.remove('active');

    if (el.btnNavLanding) el.btnNavLanding.classList.remove('active');
    if (el.btnNavTerritory) el.btnNavTerritory.classList.remove('active');
    if (el.btnNavArena) el.btnNavArena.classList.remove('active');
    if (el.btnNavDirectory) el.btnNavDirectory.classList.remove('active');
    if (el.btnNavSetup) el.btnNavSetup.classList.remove('active');

    if (viewName === 'landing') {
      if (el.viewLanding) el.viewLanding.classList.add('active');
      if (el.btnNavLanding) el.btnNavLanding.classList.add('active');
      updateLandingSavedStatus();
    } else if (viewName === 'territory') {
      if (el.viewTerritory) el.viewTerritory.classList.add('active');
      if (el.btnNavTerritory) el.btnNavTerritory.classList.add('active');
      renderTerritoryGrid();
    } else if (viewName === 'arena') {
      if (el.viewArena) el.viewArena.classList.add('active');
      if (el.btnNavArena) el.btnNavArena.classList.add('active');
      updateArenaUI();
    } else if (viewName === 'directory') {
      if (el.viewDirectory) el.viewDirectory.classList.add('active');
      if (el.btnNavDirectory) el.btnNavDirectory.classList.add('active');
      renderDirectory();
    } else if (viewName === 'setup') {
      if (el.viewSetup) el.viewSetup.classList.add('active');
      if (el.btnNavSetup) el.btnNavSetup.classList.add('active');
      renderSetupForm();
    }
  }

  // Nav Button Listeners
  if (el.btnLogoHome) el.btnLogoHome.addEventListener('click', () => switchToView('landing'));
  if (el.btnNavLanding) el.btnNavLanding.addEventListener('click', () => switchToView('landing'));
  if (el.btnNavTerritory) el.btnNavTerritory.addEventListener('click', () => switchToView('territory'));
  if (el.btnNavArena) el.btnNavArena.addEventListener('click', () => switchToView('arena'));
  if (el.btnNavDirectory) el.btnNavDirectory.addEventListener('click', () => {
    if (state.status === 'running') pauseRunning();
    switchToView('directory');
  });
  if (el.btnQuickChangeGame) el.btnQuickChangeGame.addEventListener('click', () => {
    if (state.status === 'running') pauseRunning();
    switchToView('directory');
  });
  if (el.btnNavSetup) el.btnNavSetup.addEventListener('click', () => {
    if (state.status === 'running') pauseRunning();
    switchToView('setup');
  });

  // Landing Page Buttons
  if (el.btnLandingCreateGame) el.btnLandingCreateGame.addEventListener('click', openCreateGameModal);
  if (el.btnLandingLoadGame) el.btnLandingLoadGame.addEventListener('click', handleLoadGameClick);

  // Territory View Buttons
  if (el.btnTerritoryHome) el.btnTerritoryHome.addEventListener('click', () => switchToView('landing'));
  if (el.btnTerritoryNewGame) el.btnTerritoryNewGame.addEventListener('click', openCreateGameModal);
  if (el.btnTerritorySaveGame) el.btnTerritorySaveGame.addEventListener('click', () => {
    saveTerritoryGame();
    alert('Territory floor saved successfully!');
  });
  if (el.btnTerritoryGoArena) el.btnTerritoryGoArena.addEventListener('click', () => switchToView('arena'));

  // Create Game Modal
  if (el.btnCloseCreateGameModal) el.btnCloseCreateGameModal.addEventListener('click', closeCreateGameModal);
  if (el.btnCancelCreateGame) el.btnCancelCreateGame.addEventListener('click', closeCreateGameModal);
  if (el.btnSubmitPlayers) el.btnSubmitPlayers.addEventListener('click', handleCreateGameSubmit);

  // Roster Sub-actions & Buttons
  if (el.btnAddRosterPlayer) {
    el.btnAddRosterPlayer.addEventListener('click', () => {
      const categories = getAvailableCategories();
      const cat = categories[rosterState.length % categories.length];
      rosterState.push({
        name: `Player ${rosterState.length + 1}`,
        category: cat.id,
        categoryTitle: cat.title
      });
      renderRosterRows();
      if (el.playerRosterContainer) {
        el.playerRosterContainer.scrollTop = el.playerRosterContainer.scrollHeight;
      }
    });
  }

  if (el.btnRandomizeCategories) {
    el.btnRandomizeCategories.addEventListener('click', () => {
      const categories = getAvailableCategories();
      if (categories.length === 0) return;
      rosterState.forEach(p => {
        const randCat = categories[Math.floor(Math.random() * categories.length)];
        p.category = randCat.id;
        p.categoryTitle = randCat.title;
      });
      renderRosterRows();
    });
  }

  if (el.btnToggleBulkPaste && el.bulkPasteBox) {
    el.btnToggleBulkPaste.addEventListener('click', () => {
      const isHidden = el.bulkPasteBox.style.display === 'none' || !el.bulkPasteBox.style.display;
      el.bulkPasteBox.style.display = isHidden ? 'block' : 'none';
      if (isHidden && el.inputPlayerNames) {
        el.inputPlayerNames.value = rosterState.map(p => p.name).join('\n');
        el.inputPlayerNames.focus();
      }
    });
  }

  if (el.btnApplyBulkPaste && el.inputPlayerNames) {
    el.btnApplyBulkPaste.addEventListener('click', () => {
      const lines = parsePlayerNames(el.inputPlayerNames.value);
      if (lines.length === 0) {
        alert('Please enter at least one player name.');
        return;
      }
      const categories = getAvailableCategories();
      rosterState = lines.map((name, i) => {
        const existing = rosterState[i];
        const cat = existing ? { id: existing.category, title: existing.categoryTitle } : categories[i % categories.length];
        return {
          name: name,
          category: cat.id,
          categoryTitle: cat.title
        };
      });
      if (el.bulkPasteBox) el.bulkPasteBox.style.display = 'none';
      renderRosterRows();
    });
  }

  // Preset Buttons
  if (el.btnPreset9) el.btnPreset9.addEventListener('click', () => initRosterWithPreset(9));
  if (el.btnPreset16) el.btnPreset16.addEventListener('click', () => initRosterWithPreset(16));
  if (el.btnPreset25) el.btnPreset25.addEventListener('click', () => initRosterWithPreset(25));
  if (el.btnPreset49) el.btnPreset49.addEventListener('click', () => initRosterWithPreset(49));
  if (el.btnPreset100) el.btnPreset100.addEventListener('click', () => initRosterWithPreset(100));

  // Reigning Winner Return to Floor Banner Button
  if (el.btnBannerReturnToFloor) {
    el.btnBannerReturnToFloor.addEventListener('click', () => {
      sendServerCommand('return_to_floor');
    });
  }

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

  // ==================== GRAND CHAMPION CELEBRATION ANIMATION ====================
  let isCelebrationActive = false;
  let championConfettiAnimId = null;

  function triggerChampionCelebration(champion) {
    if (!champion) return;
    isCelebrationActive = true;
    window.soundEngine?.playVictory();

    const winnerModal = document.getElementById('grandChampionModal');
    const winnerNameEl = document.getElementById('championWinnerName');
    const winnerCatEl = document.getElementById('championWinnerCategory');
    const statCountEl = document.getElementById('championStatCount');

    if (winnerNameEl) {
      winnerNameEl.textContent = champion.name;
      winnerNameEl.style.color = champion.color || 'var(--gold)';
      winnerNameEl.style.textShadow = `0 0 35px ${champion.color || 'var(--gold)'}, 0 4px 15px rgba(0,0,0,0.9)`;
    }
    if (winnerCatEl) {
      const cat = champion.categoryTitle || champion.category || 'General';
      winnerCatEl.textContent = `🎯 Category Master: ${cat}`;
    }
    if (statCountEl && territoryGame && territoryGame.grid) {
      statCountEl.textContent = `${territoryGame.grid.length} / ${territoryGame.grid.length}`;
    }

    if (winnerModal) {
      winnerModal.classList.add('active');
    }

    startChampionConfetti(champion.color);
  }

  function startChampionConfetti(primaryColor = '#00f0ff') {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (championConfettiAnimId) {
      cancelAnimationFrame(championConfettiAnimId);
      championConfettiAnimId = null;
    }

    const pieces = [];
    const colors = [primaryColor, '#ffd700', '#ff9f1c', '#00f2fe', '#ff2e63', '#ffffff', '#00e676'];

    for (let i = 0; i < 320; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        w: Math.random() * 12 + 6,
        h: Math.random() * 16 + 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        velY: Math.random() * 4 + 2.5,
        velX: (Math.random() - 0.5) * 3.5,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 6,
        isRibbon: Math.random() > 0.55
      });
    }

    let startTime = Date.now();
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const elapsed = Date.now() - startTime;

      pieces.forEach(p => {
        p.y += p.velY;
        p.x += p.velX + Math.sin(p.y * 0.02) * 1.5;
        p.rot += p.rotSpeed;

        if (p.y > canvas.height) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.isRibbon) {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w * 0.35, p.h * 1.8);
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      });

      if (isCelebrationActive || elapsed < 15000) {
        championConfettiAnimId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        championConfettiAnimId = null;
      }
    }
    championConfettiAnimId = requestAnimationFrame(animate);
  }

  // Champion Modal Buttons
  const btnChampionNewGame = document.getElementById('btnChampionNewGame');
  if (btnChampionNewGame) {
    btnChampionNewGame.addEventListener('click', () => {
      const modal = document.getElementById('grandChampionModal');
      if (modal) modal.classList.remove('active');
      isCelebrationActive = false;
      openCreateGameModal();
    });
  }

  const btnChampionCloseModal = document.getElementById('btnChampionCloseModal');
  if (btnChampionCloseModal) {
    btnChampionCloseModal.addEventListener('click', () => {
      const modal = document.getElementById('grandChampionModal');
      if (modal) modal.classList.remove('active');
    });
  }

  // Initialize
  loadPersistedGame();
  loadTerritoryGame();
  initServerEvents();
  updateArenaUI();
  updateLandingSavedStatus();
  switchToView('landing'); // Always the first page a user lands on!
  animationId = requestAnimationFrame(gameLoop);

})();
