import confetti from "canvas-confetti";

/**
 * Dispara confetes na tela para feedback de vitória/acerto.
 * @param {boolean} isMobile - Se deve usar uma contagem reduzida de partículas.
 */
export const fireConfetti = (isMobile = false) => {
  const particleCount = isMobile ? 40 : 80;
  
  confetti({
    particleCount,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#22d3ee', '#9333ea', '#22c55e', '#facc15'],
    disableForReducedMotion: true
  });
};
