'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import { AiDiagnosis } from '@/lib/types';
import { Scan, Sparkles, Package, Check, Cpu } from 'lucide-react';
import { AnimatedCounter, ease } from './motion';

type Phase = 'idle' | 'scanning' | 'done';

const BOXES = [
  { x: '18%', y: '24%', w: '34%', h: '30%', label: 'Anomalie', score: 0.91 },
  { x: '58%', y: '52%', w: '26%', h: '26%', label: 'Usure', score: 0.78 },
  { x: '30%', y: '62%', w: '22%', h: '20%', label: 'Corrosion', score: 0.64 },
];

export default function AiScanner({
  image, context, onDiagnosis,
}: {
  image?: string;
  context: { equipmentName?: string; category?: string; description?: string };
  onDiagnosis?: (d: AiDiagnosis) => void;
}) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [diag, setDiag] = useState<AiDiagnosis | null>(null);
  const [requested, setRequested] = useState<string | null>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const boxesRef = useRef<HTMLDivElement>(null);

  async function start() {
    setPhase('scanning'); setDiag(null);
    const minScan = new Promise((r) => setTimeout(r, 2600));
    const apiCall = fetch('/api/ai/diagnose', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ imageBase64: image?.split(',')[1], imageMediaType: 'image/jpeg', ...context }),
    }).then((r) => r.json()).catch(() => null);
    const [, result] = await Promise.all([minScan, apiCall]);
    setDiag(result);
    setPhase('done');
    if (result) onDiagnosis?.(result);
  }

  // GSAP scanning timeline
  useEffect(() => {
    if (phase !== 'scanning') return;
    const tl = gsap.timeline();
    if (scanRef.current) {
      tl.fromTo(scanRef.current, { top: '0%' }, { top: '100%', duration: 1.3, ease: 'power1.inOut', repeat: 1, yoyo: true }, 0);
    }
    if (boxesRef.current) {
      const boxes = boxesRef.current.querySelectorAll('[data-box]');
      tl.fromTo(boxes,
        { opacity: 0, scale: 0.7 },
        { opacity: 1, scale: 1, duration: 0.4, stagger: 0.35, ease: 'back.out(2)' }, 0.8);
    }
    return () => { tl.kill(); };
  }, [phase]);

  async function requestPart(ref: string) {
    await fetch('/api/parts', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reference: ref, quantity: 1, urgency: 'urgent', status: 'requested' }),
    });
    setRequested(ref);
  }

  return (
    <div className="space-y-4">
      {/* Vision viewport */}
      <div className="glass relative overflow-hidden p-2">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-ink2">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="panne" className="h-full w-full object-cover opacity-90" />
          ) : (
            <div className="grid h-full place-items-center text-steel text-sm">
              <div className="flex flex-col items-center gap-2"><Cpu className="text-cyan" /> En attente d&apos;une photo…</div>
            </div>
          )}

          {/* HUD grid */}
          <div className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: 'linear-gradient(rgba(34,211,238,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,.08) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-cyan/20 rounded-xl" />

          {/* Scan beam */}
          {phase === 'scanning' && (
            <div ref={scanRef} className="pointer-events-none absolute inset-x-0 h-16 -translate-y-1/2"
              style={{ background: 'linear-gradient(180deg,transparent,rgba(34,211,238,.35),transparent)', boxShadow: '0 0 30px rgba(34,211,238,.6)' }} />
          )}

          {/* Bounding boxes */}
          {(phase === 'scanning' || phase === 'done') && (
            <div ref={boxesRef} className="pointer-events-none absolute inset-0">
              {BOXES.map((b, i) => (
                <div key={i} data-box className="absolute" style={{ left: b.x, top: b.y, width: b.w, height: b.h, opacity: 0 }}>
                  <div className="h-full w-full rounded-md border-2 border-cyan/70" style={{ boxShadow: '0 0 18px rgba(34,211,238,.35) inset' }} />
                  <span className="absolute -top-5 left-0 rounded bg-cyan/90 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-ink">
                    {b.label} {(b.score * 100).toFixed(0)}%
                  </span>
                  {/* corner ticks */}
                  {['-top-px -left-px', '-top-px -right-px', '-bottom-px -left-px', '-bottom-px -right-px'].map((c) => (
                    <span key={c} className={`absolute ${c} h-2.5 w-2.5 border-cyan`} />
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Status chip */}
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-ink/70 px-3 py-1 backdrop-blur">
            <span className={`h-2 w-2 rounded-full ${phase === 'scanning' ? 'bg-cyan animate-pulse' : phase === 'done' ? 'bg-ok' : 'bg-steel'}`} />
            <span className="label-mono">
              {phase === 'scanning' ? 'Vision artificielle · analyse' : phase === 'done' ? 'Analyse terminée' : 'Vision IA prête'}
            </span>
          </div>
        </div>
      </div>

      <button onClick={start} disabled={phase === 'scanning' || !image} className="btn-primary w-full py-3">
        {phase === 'scanning'
          ? <><Scan className="animate-pulse" size={18} /> Analyse en cours…</>
          : <><Sparkles size={18} /> Lancer le diagnostic IA</>}
      </button>

      {/* Progressive diagnosis reveal */}
      <AnimatePresence>
        {phase === 'done' && diag && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}
            className="glass p-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 h-40 w-40 bg-cyan/10 blur-3xl rounded-full" />
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan/15 text-cyan"><Sparkles size={18} /></div>
              <div>
                <div className="label-mono">Diagnostic IA</div>
                <div className="text-chalk font-semibold">{context.equipmentName}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-3xl font-semibold text-cyan"><AnimatedCounter to={diag.confidence * 100} suffix="%" /></div>
                <div className="label-mono">confiance</div>
              </div>
            </div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="mt-4 text-sm text-chalk leading-relaxed">{diag.diagnosis}</motion.p>

            <div className="mt-5 grid sm:grid-cols-2 gap-5">
              <RevealList title="Causes probables" items={diag.probable_causes} delay={0.35} />
              <RevealList title="Actions recommandées" items={diag.recommended_actions} delay={0.5} />
            </div>

            <div className="mt-5">
              <div className="label-mono mb-2">Pièces recommandées</div>
              <div className="space-y-2">
                {diag.recommended_parts.map((p, i) => (
                  <motion.div key={p.reference}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.1 }}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <Package size={18} className="text-amber" />
                    <div className="flex-1">
                      <div className="text-sm text-chalk">{p.name} <span className="font-mono text-steel text-xs">({p.reference})</span></div>
                      <div className="text-xs text-steel">{p.reason}</div>
                    </div>
                    <button onClick={() => requestPart(p.reference)} className="btn-ghost text-xs py-1.5">
                      {requested === p.reference ? <><Check size={14} className="text-ok" /> Demandé</> : 'Demander'}
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RevealList({ title, items, delay }: { title: string; items: string[]; delay: number }) {
  return (
    <div>
      <div className="label-mono mb-2">{title}</div>
      <ul className="space-y-1.5">
        {items.map((c, i) => (
          <motion.li key={i}
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: delay + i * 0.08 }}
            className="flex items-start gap-2 text-sm text-steel">
            <span className="mt-1.5 h-1 w-1 rounded-full bg-cyan shrink-0" />{c}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
