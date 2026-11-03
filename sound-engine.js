// Web Audio API Synthesized Game Show Sound Effects
class GameSoundEngine {
  constructor() {
    this.ctx = null;
    this._muted = false;
    this.soundtrackTimer = null;
    this.soundtrackGain = null;
    this.soundtrackPlaying = false;
    this.noiseBuffer = null;
  }

  get muted() {
    return this._muted;
  }

  set muted(val) {
    this._muted = !!val;
    if (this.soundtrackGain && this.ctx) {
      try {
        this.soundtrackGain.gain.setValueAtTime(this._muted ? 0 : 0.32, this.ctx.currentTime);
      } catch (e) {}
    }
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  initSoundtrack() {
    this.init();
    if (!this.soundtrackGain && this.ctx) {
      this.soundtrackGain = this.ctx.createGain();
      this.soundtrackGain.gain.setValueAtTime(this.muted ? 0 : 0.32, this.ctx.currentTime);
      this.soundtrackGain.connect(this.ctx.destination);
    }
  }

  getNoiseBuffer() {
    if (!this.ctx) return null;
    if (!this.noiseBuffer) {
      const duration = 0.05;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = buffer;
    }
    return this.noiseBuffer;
  }

  startDuelSoundtrack() {
    this.init();
    if (!this.ctx) return;
    this.initSoundtrack();

    if (this.soundtrackPlaying) return; // Already running
    this.soundtrackPlaying = true;

    if (this.soundtrackGain) {
      try {
        const t = this.ctx.currentTime;
        this.soundtrackGain.gain.cancelScheduledValues(t);
        this.soundtrackGain.gain.setValueAtTime(0.001, t);
        this.soundtrackGain.gain.linearRampToValueAtTime(this.muted ? 0 : 0.32, t + 0.15);
      } catch (e) {}
    }

    // Riff 2A: 4-Chord Cinematic Minor Arpeggio (Cm -> Ab -> Bb -> G) @ 130 BPM
    const chordRoots = [
      [65.41, 77.78, 98.00, 130.81],   // Cm (C2, Eb2, G2, C3)
      [51.91, 65.41, 77.78, 103.83],   // Ab (Ab1, C2, Eb2, Ab2)
      [58.27, 73.42, 87.31, 116.54],   // Bb (Bb1, D2, F2, Bb2)
      [49.00, 73.42, 98.00, 146.83]    // G (G1, D2, G2, D3)
    ];
    const bellNotes = [523.25, 415.30, 466.16, 392.00]; // C5, Ab4, Bb4, G4

    let step = 0;
    const bpm = 130;
    const stepIntervalMs = (60 / bpm / 4) * 1000; // ~115.38 ms

    if (this.soundtrackTimer) clearInterval(this.soundtrackTimer);
    this.soundtrackTimer = setInterval(() => {
      if (!this.soundtrackPlaying || !this.ctx || this.ctx.state === 'suspended') return;

      const t = this.ctx.currentTime + 0.02;
      const chordIdx = Math.floor((step % 64) / 16);
      const chord = chordRoots[chordIdx];
      const stepInChord = step % 16;
      const freq = chord[stepInChord % chord.length];

      // 1. 16th Arp Synth Bass with resonant lowpass filter
      try {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(420 + Math.sin(step / 4) * 160, t);
        filter.Q.setValueAtTime(3.5, t);

        gain.gain.setValueAtTime(0.24, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.soundtrackGain);

        osc.start(t);
        osc.stop(t + 0.11);
      } catch (e) {}

      // 2. Electro Kick on quarters (steps 0, 4, 8, 12)
      if (step % 4 === 0) {
        try {
          const kickOsc = this.ctx.createOscillator();
          const kickGain = this.ctx.createGain();
          kickOsc.type = 'sine';
          kickOsc.frequency.setValueAtTime(135, t);
          kickOsc.frequency.exponentialRampToValueAtTime(35, t + 0.12);

          kickGain.gain.setValueAtTime(0.55, t);
          kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

          kickOsc.connect(kickGain);
          kickGain.connect(this.soundtrackGain);
          kickOsc.start(t);
          kickOsc.stop(t + 0.15);
        } catch (e) {}
      }

      // 3. Crisp Off-Beat Hi-Hat (steps 2, 6, 10, 14)
      if (step % 4 === 2) {
        try {
          const noiseBuf = this.getNoiseBuffer();
          if (noiseBuf) {
            const noiseSrc = this.ctx.createBufferSource();
            noiseSrc.buffer = noiseBuf;
            const nFilter = this.ctx.createBiquadFilter();
            nFilter.type = 'highpass';
            nFilter.frequency.setValueAtTime(7500, t);
            const nGain = this.ctx.createGain();
            nGain.gain.setValueAtTime(0.12, t);
            nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

            noiseSrc.connect(nFilter);
            nFilter.connect(nGain);
            nGain.connect(this.soundtrackGain);
            noiseSrc.start(t);
          }
        } catch (e) {}
      }

      // 4. Staccato Synth Bell Ping on bar turnaround (every 16 steps)
      if (stepInChord === 0) {
        try {
          const bellOsc = this.ctx.createOscillator();
          const bellGain = this.ctx.createGain();
          bellOsc.type = 'triangle';
          bellOsc.frequency.setValueAtTime(bellNotes[chordIdx], t);

          bellGain.gain.setValueAtTime(0.001, t);
          bellGain.gain.linearRampToValueAtTime(0.18, t + 0.03);
          bellGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

          bellOsc.connect(bellGain);
          bellGain.connect(this.soundtrackGain);
          bellOsc.start(t);
          bellOsc.stop(t + 0.5);
        } catch (e) {}
      }

      step++;
    }, stepIntervalMs);
  }

  stopDuelSoundtrack() {
    if (!this.soundtrackPlaying && !this.soundtrackTimer) return;
    this.soundtrackPlaying = false;

    if (this.soundtrackTimer) {
      clearInterval(this.soundtrackTimer);
      this.soundtrackTimer = null;
    }

    if (this.soundtrackGain && this.ctx) {
      try {
        const t = this.ctx.currentTime;
        this.soundtrackGain.gain.cancelScheduledValues(t);
        this.soundtrackGain.gain.linearRampToValueAtTime(0.001, t + 0.2);
      } catch (e) {}
    }
  }

  pauseDuelSoundtrack() {
    if (this.soundtrackTimer) {
      clearInterval(this.soundtrackTimer);
      this.soundtrackTimer = null;
    }
    this.soundtrackPlaying = false;
    if (this.soundtrackGain && this.ctx) {
      try {
        const t = this.ctx.currentTime;
        this.soundtrackGain.gain.cancelScheduledValues(t);
        this.soundtrackGain.gain.setValueAtTime(0.001, t);
      } catch (e) {}
    }
  }

  resumeDuelSoundtrack() {
    this.startDuelSoundtrack();
  }

  playTick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.04);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  playUrgentTick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.setValueAtTime(950, t + 0.03);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  playCorrect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    // Classic game-show high rising two-tone chime (F5 -> A5 -> C6)
    const notes = [698.46, 880.00, 1046.50];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime + (i * 0.06);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.38);
    });
  }

  playPass() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Descending whoosh / buzz for pass
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.28);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  playTimeout() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    // Loud, low game show buzzer horn
    const freqs = [140, 147]; // slight discord
    freqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 1.2);
    });
  }

  playVictory() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    // Fanfare chord arpeggio
    const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime + (idx * 0.12);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (idx === chord.length - 1 ? 1.4 : 0.45));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 1.5);
    });
  }

  playCountdownBeep(isFinal = false) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isFinal ? 'triangle' : 'sine';
    const freq = isFinal ? 1046.50 : 523.25; // High C6 for GO! / C5 for 3, 2, 1
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(isFinal ? 0.35 : 0.22, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (isFinal ? 0.6 : 0.25));

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + (isFinal ? 0.65 : 0.3));
  }

  playTie() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    // Dramatic two-tone clash chord followed by rising suspense arpeggio
    const clashFreqs = [220.00, 311.13, 440.00, 622.25]; // A3, Eb4 (tritone tension), A4, Eb5
    const resolveFreqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 triumph
    const t = this.ctx.currentTime;

    // Phase 1: Heavy dramatic tension clash
    clashFreqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.65);
    });

    // Phase 2: Rising suspense bells (Tiebreaker Fanfare)
    resolveFreqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = t + 0.45 + (idx * 0.12);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.25, noteTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.85);
    });
  }
}

const soundEngine = new GameSoundEngine();

if (typeof window !== 'undefined') {
  window.soundEngine = soundEngine;
} else if (typeof global !== 'undefined') {
  global.soundEngine = soundEngine;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = soundEngine;
}

