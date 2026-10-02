"use client";
import { useEffect } from "react";
import type { Variants } from "framer-motion";

/* ============================================================
   Système de mouvement — IDENTIQUE dans les deux thèmes.
   Tout le monde importe d'ici. Personne ne réinvente une anim.
   ============================================================ */

// Courbes signature
export const EASE = {
  outExpo: [0.16, 1, 0.3, 1],
  outQuart: [0.25, 1, 0.5, 1],
  inOutQuint: [0.83, 0, 0.17, 1],
} as const;

// Durées (secondes)
export const DUR = { instant: 0.12, fast: 0.2, base: 0.32, slow: 0.52, reveal: 0.7 } as const;

/* Révélation chorégraphiée : un parent "container" + enfants "item".
   <motion.div variants={container} initial="hidden" whileInView="show"
      viewport={{ once:true, margin:"-15%" }}>
      <motion.div variants={item} /> ... </motion.div> */
export const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

export const item: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: DUR.reveal, ease: EASE.outExpo },
  },
};

// Transition de page (avec AnimatePresence)
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE.inOutQuint } },
  exit: { opacity: 0, y: -8, transition: { duration: DUR.fast, ease: EASE.inOutQuint } },
};

/* Smooth-scroll à inertie (Lenis). À appeler une fois dans un layout client.
   Respecte prefers-reduced-motion. */
export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let lenis: { raf: (t: number) => void; destroy: () => void } | undefined;
    (async () => {
      const Lenis = (await import("lenis")).default;
      lenis = new Lenis({ duration: 1.1, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
      const raf = (time: number) => { lenis!.raf(time); frame = requestAnimationFrame(raf); };
      frame = requestAnimationFrame(raf);
    })();
    return () => { cancelAnimationFrame(frame); lenis?.destroy(); };
  }, []);
}
