// ═══════════════════════════════════════════════════════════════
// samaramAI — Canvas Particle System
// Soft circles drifting upward — organic, barely visible, cinematic
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef, memo } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  speedY: number;
  speedX: number;
  phase: number;
}

function ParticleCanvas({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener('resize', resize);

    // Initialize particles
    const count = Math.min(50, Math.floor(canvas.offsetWidth / 25));
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      radius: Math.random() * 2.5 + 1,
      opacity: Math.random() * 0.15 + 0.03,
      speedY: -(Math.random() * 0.4 + 0.1),
      speedX: (Math.random() - 0.5) * 0.2,
      phase: Math.random() * Math.PI * 2,
    }));

    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      time += 0.008;

      for (const p of particlesRef.current) {
        p.y += p.speedY;
        p.x += Math.sin(time + p.phase) * 0.3 + p.speedX;

        // Wrap around
        if (p.y < -10) {
          p.y = canvas.offsetHeight + 10;
          p.x = Math.random() * canvas.offsetWidth;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(13, 148, 136, ${p.opacity})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
}

export default memo(ParticleCanvas);
