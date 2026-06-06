'use client';
import { useEffect, useRef } from 'react';

// Lightweight GPU-friendly particle field with connective lines.
export default function Particles({ density = 60 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let raf = 0; let w = 0; let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    type P = { x: number; y: number; vx: number; vy: number };
    let pts: P[] = [];

    function resize() {
      w = canvas!.clientWidth; h = canvas!.clientHeight;
      canvas!.width = w * dpr; canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round((w * h) / 22000) + Math.round(density / 3);
      pts = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      }));
    }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(canvas);

    function frame() {
      ctx!.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
      for (const p of pts) {
        ctx!.fillStyle = 'rgba(125,211,252,0.7)';
        ctx!.beginPath(); ctx!.arc(p.x, p.y, 1.4, 0, Math.PI * 2); ctx!.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [density]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}
