// ═══════════════════════════════════════════════════════════════
// samaramAI — Section Reveal Wrapper
// Fades in while rising with blur-to-focus on viewport entry
// ═══════════════════════════════════════════════════════════════

import { type ReactNode, memo } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, viewportOnce } from '@/lib/animations';

interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
  delay?: number;
  style?: React.CSSProperties;
}

function SectionReveal({
  children,
  className = '',
  stagger = false,
  delay = 0,
  style,
}: SectionRevealProps) {
  return (
    <motion.div
      variants={stagger ? staggerContainer : fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      transition={delay ? { delay } : undefined}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// Child item for use inside stagger container
export function RevealItem({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div variants={fadeInUp} className={className} style={style}>
      {children}
    </motion.div>
  );
}

export default memo(SectionReveal);
