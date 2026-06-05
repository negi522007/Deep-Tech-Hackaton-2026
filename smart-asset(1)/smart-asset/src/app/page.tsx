'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Hero3D from '@/components/three/Hero3D';
import Particles from '@/components/Particles';
import { AnimatedCounter, FadeIn, Stagger, StaggerItem, ease } from '@/components/motion';
import { Cpu, ArrowRight, ScanLine, Boxes, Activity, ShieldCheck, Zap, Camera } from 'lucide-react';

const STATS = [
  { v: 99.2, s: '%', label: 'Disponibilité visée' },
  { v: 7, s: ' étapes', label: 'Workflow réparation' },
  { v: 48, s: 'h', label: 'Du capteur à la décision' },
  { v: 0, s: 'ms', label: 'Latence perçue · offline' },
];

const FEATURES = [
  { icon: Camera, title: 'Capture guidée', desc: 'Photographie multi-angles assistée, directement depuis le terrain.' },
  { icon: ScanLine, title: 'Diagnostic IA', desc: 'Vision artificielle : anomalies détectées, pièces recommandées, gravité notée.' },
  { icon: Boxes, title: 'Asset Intelligence', desc: 'Cycle de vie complet des équipements et de leur historique de pannes.' },
  { icon: Activity, title: 'Mission Control', desc: 'Dashboards temps réel : tendances, équipements fragiles, stocks critiques.' },
  { icon: ShieldCheck, title: 'Souverain & offline', desc: 'PWA installable, données structurées, fonctionne sans réseau en atelier.' },
  { icon: Zap, title: 'Prédictif', desc: 'Anticipe les besoins industriels et les ruptures de pièces.' },
];

export default function Landing() {
  return (
    <div className="relative">
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen overflow-hidden">
        <Particles density={70} />
        <div className="absolute inset-0 -z-0" />

        {/* nav */}
        <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan to-amber text-ink shadow-glow"><Cpu size={18} /></div>
            <span className="font-semibold tracking-tight">Asset<span className="text-cyan">IQ</span></span>
          </div>
          <Link href="/dashboard" className="btn-ghost text-sm">Ouvrir la plateforme <ArrowRight size={15} /></Link>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2 items-center gap-8 px-6 pt-6 lg:pt-16">
          {/* left: copy */}
          <div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}
              className="inline-flex items-center gap-2 rounded-full border border-cyan/25 bg-cyan/5 px-3 py-1 text-[11px] text-cyan mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan animate-pulse" /> Industrial AI · Spare Parts Intelligence
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: 0.05 }}
              className="text-4xl sm:text-6xl font-semibold leading-[1.05] tracking-tight">
              De la <span className="gradient-text">photo</span> à la<br />décision industrielle.
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: 0.15 }}
              className="mt-6 max-w-lg text-steel text-base leading-relaxed">
              AssetIQ transforme une simple photo de panne en diagnostic IA, pièce
              recommandée et workflow de réparation — en quelques secondes, même hors-ligne.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: 0.25 }}
              className="mt-8 flex flex-wrap gap-3">
              <Link href="/dashboard" className="btn-primary px-6 py-3">Lancer Mission Control <ArrowRight size={16} /></Link>
              <Link href="/failures/new" className="btn-ghost px-6 py-3"><ScanLine size={16} /> Tester le diagnostic IA</Link>
            </motion.div>

            {/* stats */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {STATS.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease, delay: 0.35 + i * 0.1 }}>
                  <div className="text-2xl font-semibold text-chalk"><AnimatedCounter to={s.v} decimals={s.v % 1 ? 1 : 0} suffix={s.s} /></div>
                  <div className="label-mono mt-1">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* right: 3D */}
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease, delay: 0.2 }}
            className="relative h-[360px] sm:h-[520px]">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-cyan/5 to-transparent" />
            <Hero3D className="h-full w-full" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 label-mono opacity-60">glissez pour faire pivoter · turbine temps réel</div>
          </motion.div>
        </div>

        {/* scroll hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 h-9 w-5 rounded-full border border-white/15 grid place-items-start p-1">
          <span className="h-2 w-1 rounded-full bg-cyan animate-bounce" />
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="relative mx-auto max-w-7xl px-6 py-24">
        <FadeIn>
          <div className="label-mono text-cyan">La plateforme</div>
          <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">Une suite d&apos;intelligence industrielle complète.</h2>
        </FadeIn>
        <Stagger className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <StaggerItem key={f.title}>
              <div className="glass glass-hover p-6 h-full">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.04] border border-white/10 text-cyan"><f.icon size={20} /></div>
                <h3 className="mt-4 font-semibold text-chalk">{f.title}</h3>
                <p className="mt-1.5 text-sm text-steel leading-relaxed">{f.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative mx-auto max-w-5xl px-6 pb-28">
        <FadeIn>
          <div className="glass relative overflow-hidden p-10 sm:p-14 text-center">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-cyan/15 blur-3xl" />
            <h2 className="relative text-3xl sm:text-4xl font-semibold tracking-tight">Prêt pour le marché.</h2>
            <p className="relative mt-3 text-steel max-w-xl mx-auto">Ouvrez le centre de contrôle et voyez l&apos;intelligence de maintenance en action.</p>
            <Link href="/dashboard" className="relative btn-primary mt-8 px-8 py-3 inline-flex">Entrer dans AssetIQ <ArrowRight size={16} /></Link>
          </div>
        </FadeIn>
        <p className="mt-10 text-center label-mono">© AssetIQ · Smart Industrial Asset Intelligence</p>
      </section>
    </div>
  );
}
