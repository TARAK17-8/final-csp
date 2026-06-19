// ═══════════════════════════════════════════════════════════════
// samaramAI — Animated ECG Heartbeat Waveform (SVG)
// Thin, semi-transparent, self-drawing, looping heartbeat line
// ═══════════════════════════════════════════════════════════════

import { memo } from 'react';
import { motion } from 'framer-motion';

function ECGWaveform({ className = '' }: { className?: string }) {
  // Realistic ECG waveform path
  const ecgPath = `
    M 0 50
    L 40 50
    L 50 50
    L 55 48
    L 60 50
    L 80 50
    L 85 50
    L 90 30
    L 95 70
    L 100 10
    L 105 80
    L 110 45
    L 115 50
    L 140 50
    L 145 42
    L 150 50
    L 170 50
    L 200 50
    L 210 50
    L 215 48
    L 220 50
    L 240 50
    L 245 50
    L 250 30
    L 255 70
    L 260 10
    L 265 80
    L 270 45
    L 275 50
    L 300 50
    L 305 42
    L 310 50
    L 330 50
    L 360 50
    L 370 50
    L 375 48
    L 380 50
    L 400 50
    L 405 50
    L 410 30
    L 415 70
    L 420 10
    L 425 80
    L 430 45
    L 435 50
    L 460 50
    L 465 42
    L 470 50
    L 490 50
    L 520 50
    L 530 50
    L 535 48
    L 540 50
    L 560 50
    L 565 50
    L 570 30
    L 575 70
    L 580 10
    L 585 80
    L 590 45
    L 595 50
    L 620 50
    L 625 42
    L 630 50
    L 650 50
    L 700 50
  `;

  const pathLength = 1800;

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        bottom: '15%',
        left: 0,
        right: 0,
        height: '100px',
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity: 0.2,
      }}
    >
      <svg
        viewBox="0 0 700 100"
        preserveAspectRatio="none"
        style={{ width: '100%', height: '100%' }}
      >
        <motion.path
          d={ecgPath}
          fill="none"
          stroke="var(--color-teal-400)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ strokeDasharray: pathLength, strokeDashoffset: pathLength }}
          animate={{ strokeDashoffset: [pathLength, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </svg>
    </div>
  );
}

export default memo(ECGWaveform);
