// ═══════════════════════════════════════════════════════════════
// samaramAI — Floating Glassmorphism Card
// Independent sine-wave float, weightless drift
// ═══════════════════════════════════════════════════════════════

import { type ReactNode, memo } from 'react';
import { motion } from 'framer-motion';
import { glassFloat, cardLift } from '@/lib/animations';

interface FloatingCardProps {
  children: ReactNode;
  amplitude?: number;
  duration?: number;
  phase?: number;
  className?: string;
  style?: React.CSSProperties;
}

function FloatingCard({
  children,
  amplitude = 12,
  duration = 6,
  phase = 0,
  className = '',
  style = {},
}: FloatingCardProps) {
  const floatVariants = glassFloat(amplitude, duration, phase);

  return (
    <motion.div
      variants={{ ...floatVariants, ...cardLift }}
      animate="animate"
      initial="rest"
      whileHover="hover"
      className={`glass ${className}`}
      style={{
        borderRadius: 'var(--radius-xl)',
        padding: '1.25rem',
        cursor: 'default',
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

export default memo(FloatingCard);
