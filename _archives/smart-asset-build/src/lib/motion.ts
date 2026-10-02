/**
 * Framer Motion Animation Library
 * Choreographed animations for Smart Asset Intelligence
 */

// Easing curves (custom, not default ease-in-out)
export const easings = {
  motion: 'cubic-bezier(0.16, 1, 0.3, 1)',       // smooth, snappy
  snappy: 'cubic-bezier(0.2, 1, 0.25, 1)',       // crisp
  gentle: 'cubic-bezier(0.34, 1.56, 0.64, 1)',   // bouncy
};

// Durations
export const durations = {
  fast: 0.2,
  normal: 0.4,
  slow: 0.6,
  verySlowly: 1,
};

// ============================================================================
// Reveal Animations
// ============================================================================

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: durations.normal, ease: easings.motion },
};

export const slideUpIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: durations.normal, ease: easings.motion },
};

export const slideLeftIn = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: durations.normal, ease: easings.motion },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: durations.normal, ease: easings.snappy },
};

// ============================================================================
// Stagger Container (for choreographed sequences)
// ============================================================================

export const staggerContainer = (stagger = 0.1) => ({
  animate: {
    transition: {
      staggerChildren: stagger,
      delayChildren: 0.1,
    },
  },
});

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

// ============================================================================
// Key Moment: AI Diagnosis Reveal
// ============================================================================

export const diagnosisReveal = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  transition: { duration: durations.slow, ease: easings.motion },
};

export const diagnosisBadge = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: durations.normal, ease: easings.snappy, delay: 0.2 },
};

// ============================================================================
// Workflow Timeline Animation
// ============================================================================

export const timelineStage = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
};

export const timelineStageContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

// ============================================================================
// Page Transitions
// ============================================================================

export const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: durations.normal, ease: easings.motion },
};

// ============================================================================
// Utility: Stagger delay for index
// ============================================================================

export const getStaggerDelay = (index: number, baseDelay = 0.05) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: durations.normal,
    ease: easings.motion,
    delay: index * baseDelay,
  },
});
