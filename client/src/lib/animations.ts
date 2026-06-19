// ═══════════════════════════════════════════════════════════════
// samaramAI — Shared Framer Motion Animation Variants
// ═══════════════════════════════════════════════════════════════

import type { Variants, Transition } from 'framer-motion';

// ── Easing curves ──
const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];
const easeOutQuart: [number, number, number, number] = [0.25, 1, 0.5, 1];

// ── Cinematic transition preset ──
export const cinematicTransition: Transition = {
  duration: 0.8,
  ease: easeOutExpo,
};

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 100,
  damping: 20,
  mass: 0.8,
};

// ── Fade in from below with blur ──
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    filter: 'blur(8px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.7,
      ease: easeOutExpo,
    },
  },
};

// ── Fade in without movement ──
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: easeOutQuart },
  },
};

// ── Slide from right (for onboarding step transitions) ──
export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { ...springTransition },
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: { duration: 0.3, ease: easeOutQuart },
  },
};

// ── Slide from left ──
export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { ...springTransition },
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: { duration: 0.3, ease: easeOutQuart },
  },
};

// ── Stagger container ──
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

// ── Scale on hover ──
export const scaleOnHover: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.03,
    y: -4,
    transition: { duration: 0.3, ease: easeOutExpo },
  },
  tap: {
    scale: 0.97,
    transition: { duration: 0.1 },
  },
};

// ── Card lift on hover ──
export const cardLift: Variants = {
  rest: {
    y: 0,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
  },
  hover: {
    y: -6,
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
    transition: { duration: 0.3, ease: easeOutExpo },
  },
};

// ── Number count up (for stats) ──
export const countUp: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: easeOutExpo },
  },
};

// ── Parallax layer helpers ──
export const parallaxSlow = { speed: 0.15 };
export const parallaxMedium = { speed: 0.3 };
export const parallaxFast = { speed: 0.5 };

// ── Viewport defaults ──
export const viewportOnce = {
  once: true,
  amount: 0.25 as const,
};

// ── Emergency screen entrance ──
export const emergencyEnter: Variants = {
  hidden: { opacity: 0, scale: 1.05 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
};

// ── Glass card float (unique per card via custom property) ──
export const glassFloat = (
  amplitude: number = 12,
  duration: number = 6,
  phase: number = 0
): Variants => ({
  animate: {
    y: [0, -amplitude, 0],
    rotate: [0, amplitude * 0.1, 0],
    transition: {
      y: {
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: phase,
      },
      rotate: {
        duration: duration * 1.2,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: phase,
      },
    },
  },
});
