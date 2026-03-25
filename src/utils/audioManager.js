// Gerenciador de Áudio Sintético para o Math Adventure+
// Cria sons no estilo Duolingo usando a Web Audio API diretamente no navegador (Zero Arquivos Externos)

let audioCtx = null;

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

const playTone = (frequency, duration, type = 'sine', volume = 0.5) => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  
  // Envelope attack/release suave
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
};

let bgmProcess = null;

export const playSound = {
  // Duolingo style "ding-ding!" (Mi5, Dó6)
  success: () => {
    setTimeout(() => playTone(659.25, 0.2, 'sine', 0.6), 0);
    setTimeout(() => playTone(1046.50, 0.4, 'sine', 0.8), 120);
  },
  // "Uh-oh" / Ba-bow (Ré4, Lá3)
  error: () => {
    setTimeout(() => playTone(293.66, 0.2, 'triangle', 0.5), 0);
    setTimeout(() => playTone(220.00, 0.3, 'sawtooth', 0.4), 150);
  },
  // Fanfarra de Level Up (Dó5, Mi5, Sol5, Dó6)
  levelUp: () => {
    setTimeout(() => playTone(523.25, 0.15, 'sine', 0.6), 0);
    setTimeout(() => playTone(659.25, 0.15, 'sine', 0.6), 150);
    setTimeout(() => playTone(783.99, 0.15, 'sine', 0.6), 300);
    setTimeout(() => playTone(1046.50, 0.6, 'sine', 0.8), 450);
  },
  // Som de bolha (Pop) de Moeda/XP
  xp: () => {
    playTone(987.77, 0.15, 'sine', 0.3);
  },
  // Clique UI (Blip rápido)
  click: () => {
    playTone(700, 0.05, 'sine', 0.1);
  },
  
  // BGM Sintética Suave (Ambient Loop)
  startBGM: () => {
    if (bgmProcess) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    // Função interna para tocar um acorde suave
    const playChord = () => {
      const now = ctx.currentTime;
      [130.81, 164.81, 196.00].forEach((freq, i) => { // C3, E3, G3
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.02, now + 1);
        gain.gain.linearRampToValueAtTime(0, now + 4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 4);
      });
    };

    bgmProcess = setInterval(playChord, 3000);
    playChord();
  },

  stopBGM: () => {
    if (bgmProcess) {
      clearInterval(bgmProcess);
      bgmProcess = null;
    }
  }
};
