import * as React from 'react';

/**
 * ParticleBackground — Pure Canvas particle system (zero npm deps)
 * 80 neon floating particles with glow halos.
 */
const ParticleBackground = () => {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];

    const COLORS = [
      'rgba(0,229,255,',    // neon cyan
      'rgba(124,58,237,',   // vibrant purple
      'rgba(0,255,178,',    // mint green
      'rgba(255,255,255,',  // white
    ];

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = () => ({
      x:     Math.random() * (canvas.width || window.innerWidth),
      y:     (canvas.height || window.innerHeight) + Math.random() * 20,
      r:     Math.random() * 2.5 + 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.6 + 0.2,
      vx:    (Math.random() - 0.5) * 0.4,
      vy:    -(Math.random() * 0.5 + 0.15),
      life:  1,
      decay: Math.random() * 0.0015 + 0.0004,
    });

    const init = () => {
      resize();
      particles = Array.from({ length: 90 }, () => {
        const p = createParticle();
        p.y = Math.random() * canvas.height; // spread on load
        return p;
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0.02 || p.y < -20) {
          particles[i] = createParticle();
          continue;
        }

        const opacity = p.alpha * p.life;

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + opacity + ')';
        ctx.fill();

        // Glow halo
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        grad.addColorStop(0, p.color + (opacity * 0.35) + ')');
        grad.addColorStop(1, p.color + '0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    init();
    draw();

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
};

export default ParticleBackground;
