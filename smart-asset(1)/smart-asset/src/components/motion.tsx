'use client';
import { motion, useInView, animate } from 'framer-motion';
import { useEffect, useRef, useState, ReactNode } from 'react';

export const ease = [0.22, 1, 0.36, 1] as const;

export function FadeIn({ children, delay = 0, y = 16, className = '' }:
  { children: ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.55, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Tilt + glow card that reacts to the pointer. */
export function MotionCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  function onMove(e: React.MouseEvent) {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${(-py * 6).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(px * 8).toFixed(2)}deg`);
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }
  function reset() {
    const el = ref.current; if (!el) return;
    el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg');
  }
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={`glass glass-hover relative overflow-hidden ${className}`}
      style={{ transform: 'perspective(900px) rotateX(var(--rx,0)) rotateY(var(--ry,0))', transition: 'transform .15s ease' }}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 hover:opacity-100"
        style={{ background: 'radial-gradient(360px circle at var(--mx) var(--my), rgba(34,211,238,0.12), transparent 40%)' }}
      />
      {children}
    </div>
  );
}

export function AnimatedCounter({ to, decimals = 0, suffix = '', prefix = '' }:
  { to: number; decimals?: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.4, ease,
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, to]);
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{val.toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  );
}

export { motion };
