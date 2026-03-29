// Gerenciador de Áudio Sintético — Math Adventure+ v4.0 (Premium)
// Sons estilo Duolingo via Web Audio API — zero arquivos externos

let audioCtx = null;
let bgmGainNode = null;
let isMuted = false;

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create a dedicated gain node for BGM to allow instant muting
    bgmGainNode = audioCtx.createGain();
    const compressor = audioCtx.createDynamicsCompressor();
    bgmGainNode.connect(compressor);
    compressor.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// ─── Primitive: single oscillator tone ────────────────────────────────────────
const playTone = (frequency, duration, type = 'sine', volume = 0.5, delay = 0, isBGM = false) => {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  const oscillator = ctx.createOscillator();
  const gainNode   = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + delay);

  gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

  oscillator.connect(gainNode);
  
  if (isBGM && bgmGainNode) {
    gainNode.connect(bgmGainNode);
  } else {
    // Normal SFX connect to destination
    const compressor = ctx.createDynamicsCompressor();
    gainNode.connect(compressor);
    compressor.connect(ctx.destination);
  }

  oscillator.start(ctx.currentTime + delay);
  oscillator.stop(ctx.currentTime + delay + duration + 0.05);
};

// ─── BGM State ─────────────────────────────────────────────────────────────────
let bgmInterval = null;
let bgmStep = 0;

// Upbeat / Motivating Progression: C major, F major, A minor, G major
const BGM_CHORDS = [
  [130.81, 164.81, 196.00], // C3 E3 G3 (C Major)
  [174.61, 220.00, 261.63], // F3 A3 C4 (F Major)
  [110.00, 130.81, 164.81], // A2 C3 E3 (A Minor)
  [146.83, 196.00, 246.94], // D3 G3 B3 (G Major)
];

const playChord = (freqs, volume = 0.02) => {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;
  const now = ctx.currentTime;

  freqs.forEach((freq, i) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    // Bouncier, shorter envelope for an upbeat feel
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.1);
    gain.gain.setValueAtTime(volume, now + 0.4);
    gain.gain.linearRampToValueAtTime(0, now + 1.2);

    osc.connect(gain);
    if (bgmGainNode) {
      gain.connect(bgmGainNode);
    } else {
      gain.connect(ctx.destination);
    }
    
    osc.start(now);
    osc.stop(now + 1.5);
  });
};

// ─── Public Sound API ──────────────────────────────────────────────────────────
export const playSound = {

  setMuted: (muted) => {
    isMuted = muted;
    if (bgmGainNode && bgmGainNode.gain) {
      const ctx = getAudioContext();
      if (ctx) {
        // Drop volume instantly to 0 if muted
        bgmGainNode.gain.cancelScheduledValues(ctx.currentTime);
        bgmGainNode.gain.setValueAtTime(bgmGainNode.gain.value, ctx.currentTime);
        bgmGainNode.gain.linearRampToValueAtTime(muted ? 0 : 1, ctx.currentTime + 0.05);
      }
    }
  },

  // ✅ Premium Correct Sound (MP3 + fallback)
  success: () => {
    if (isMuted) return;
    try {
      const audio = new Audio("/sounds/correct.mp3");
      audio.volume = 0.4;
      audio.play().catch(e => {
        // Fallback to synthetic if file not found
        playTone(659.25, 0.18, 'sine', 0.55, 0.00);
        playTone(1046.50, 0.40, 'sine', 0.75, 0.12);
      });
    } catch (e) {
      playTone(659.25, 0.18, 'sine', 0.55, 0.00);
      playTone(1046.50, 0.40, 'sine', 0.75, 0.12);
    }
  },

  // ❌ Premium Error Sound (MP3 + fallback)
  error: () => {
    if (isMuted) return;
    try {
      const audio = new Audio("/sounds/error.mp3");
      audio.volume = 0.4;
      audio.play().catch(e => {
        // Fallback to synthetic
        playTone(293.66, 0.20, 'triangle', 0.45, 0.00);
        playTone(220.00, 0.35, 'sawtooth', 0.35, 0.18);
      });
    } catch (e) {
      playTone(293.66, 0.20, 'triangle', 0.45, 0.00);
      playTone(220.00, 0.35, 'sawtooth', 0.35, 0.18);
    }
  },

  // 🏆 Fanfare (MP3 + fallback)
  levelUp: () => {
    if (isMuted) return;
    try {
      const audio = new Audio("/sounds/levelup.mp3");
      audio.volume = 0.5;
      audio.play().catch(e => {
        // Fallback to synthetic
        playTone(523.25, 0.15, 'sine', 0.60, 0.00);
        playTone(659.25, 0.15, 'sine', 0.60, 0.15);
        playTone(783.99, 0.15, 'sine', 0.60, 0.30);
        playTone(1046.50, 0.60, 'sine', 0.80, 0.45);
      });
    } catch (e) {
      playTone(523.25, 0.15, 'sine', 0.60, 0.00);
      playTone(659.25, 0.15, 'sine', 0.60, 0.15);
      playTone(783.99, 0.15, 'sine', 0.60, 0.30);
      playTone(1046.50, 0.60, 'sine', 0.80, 0.45);
    }
  },

  // ⚡ Pop
  xp: () => {
    if (isMuted) return;
    playTone(987.77, 0.12, 'sine', 0.30, 0.00);
    playTone(1174.66, 0.08, 'sine', 0.20, 0.10);
  },

  // 🖱️ Soft UI Click
  click: () => {
    if (isMuted) return;
    playTone(720, 0.04, 'sine', 0.05, 0); // Very soft UI click
  },

  notify: () => {
    if (isMuted) return;
    playTone(880, 0.10, 'sine', 0.20, 0.00);
    playTone(1108, 0.10, 'sine', 0.15, 0.10);
  },

  // 🎵 Upbeat BGM Loop
  startBGM: () => {
    if (bgmInterval || isMuted) return;
    bgmStep = 0;

    const tick = () => {
      playChord(BGM_CHORDS[bgmStep % BGM_CHORDS.length]);
      bgmStep++;
    };

    tick(); 
    bgmInterval = setInterval(tick, 2000); // 120 BPM feel (pop bounce)
  },

  stopBGM: () => {
    if (bgmInterval) {
      clearInterval(bgmInterval);
      bgmInterval = null;
    }
    bgmStep = 0;
    
    // Immediate kill residual BGM
    if (bgmGainNode && bgmGainNode.gain) {
      const ctx = getAudioContext();
      if (ctx) {
         bgmGainNode.gain.cancelScheduledValues(ctx.currentTime);
         bgmGainNode.gain.setValueAtTime(0, ctx.currentTime);
         // Restore volume for next time startBGM is called
         bgmGainNode.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.1);
      }
    }
  },
};
