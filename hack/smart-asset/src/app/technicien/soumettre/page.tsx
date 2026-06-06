'use client';
import { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import { equipments, companies } from '@/lib/sample-data';
import { AiDiagnosis, Severity, Submitter } from '@/lib/types';
import CameraCapture, { CapturedShot } from '@/components/CameraCapture';
import AiScanner from '@/components/AiScanner';
import { FadeIn } from '@/components/motion';
import { User, Wrench, Camera, CheckCircle, ChevronRight, Mic, MicOff } from 'lucide-react';

const STEPS = ['Vos informations', 'La panne', 'Capture visuelle', 'Confirmation'];

const CATEGORIES = [
  { value: 'mechanical', label: 'Mécanique' },
  { value: 'electrical', label: 'Électrique' },
  { value: 'hydraulic',  label: 'Hydraulique' },
  { value: 'pneumatic',  label: 'Pneumatique' },
  { value: 'structural', label: 'Structurel' },
];

const SEVERITIES: { value: Severity; label: string; desc: string; color: string }[] = [
  { value: 'low',      label: 'Faible',   desc: 'Machine fonctionnelle',  color: 'border-ok/40   text-ok   data-[sel=true]:bg-ok/10' },
  { value: 'medium',   label: 'Moyenne',  desc: 'Dégradation notable',    color: 'border-info/40 text-info  data-[sel=true]:bg-info/10' },
  { value: 'high',     label: 'Élevée',   desc: 'Production impactée',    color: 'border-warn/40 text-warn  data-[sel=true]:bg-warn/10' },
  { value: 'critical', label: 'Critique', desc: 'Arrêt de production',    color: 'border-crit/40 text-crit  data-[sel=true]:bg-crit/10' },
];

// Web Speech Recognition — vendor-prefixed in some browsers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySR = any;
function getSR(): AnySR | null {
  if (typeof window === 'undefined') return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function SoumettreFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addFailure } = useStore();
  const [step, setStep] = useState(0);

  const [sub, setSub] = useState<Submitter>({ firstName: '', lastName: '', phone: '', email: '', company: '' });

  // Pre-fill equipment from QR code URL param (?equipmentId=e1)
  const defaultEquipId = searchParams.get('equipmentId') ?? equipments[0].id;
  const [equipId, setEquipId] = useState(
    equipments.find(e => e.id === defaultEquipId) ? defaultEquipId : equipments[0].id
  );

  useEffect(() => {
    const qId = searchParams.get('equipmentId');
    if (qId && equipments.find(e => e.id === qId)) {
      setEquipId(qId);
    }
  }, [searchParams]);
  const [category, setCategory] = useState('mechanical');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [title, setTitle]       = useState('');
  const [desc, setDesc]         = useState('');
  const [shots, setShots]       = useState<CapturedShot[]>([]);
  const [diag, setDiag]         = useState<AiDiagnosis | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Voice recognition state
  const [recording, setRecording] = useState<'title' | 'desc' | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const eq = equipments.find(e => e.id === equipId)!;

  function nextStep() { setStep(s => s + 1); }
  function prevStep() { setStep(s => s - 1); }

  function handleDiagnosis(d: AiDiagnosis) {
    setDiag(d);
    const order: Severity[] = ['low', 'medium', 'high', 'critical'];
    if (order.indexOf(d.severity) > order.indexOf(severity)) setSeverity(d.severity);
  }

  // ── Reconnaissance vocale ──────────────────────────────────────────────
  const startVoice = useCallback((field: 'title' | 'desc') => {
    const SR = getSR();
    if (!SR) {
      alert('Reconnaissance vocale non disponible sur ce navigateur. Utilisez Chrome ou Edge.');
      return;
    }

    // Toggle: si déjà en cours sur ce champ → arrêter
    if (recording === field) {
      recognitionRef.current?.stop();
      setRecording(null);
      return;
    }

    // Arrêter toute reconnaissance en cours
    recognitionRef.current?.stop();

    const recognition = new SR();
    recognition.lang = 'fr-FR';
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalTranscript = '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript + ' ';
        } else {
          interim = e.results[i][0].transcript;
        }
      }
      const combined = finalTranscript + interim;
      if (field === 'desc') setDesc(combined.trim());
      else setTitle(combined.trim());
    };

    recognition.onend = () => setRecording(null);
    recognition.onerror = () => setRecording(null);

    recognition.start();
    recognitionRef.current = recognition;
    setRecording(field);
  }, [recording]);

  async function handleSubmit() {
    setSubmitting(true);
    const finalTitle = title.trim() || `Panne ${category} — ${eq.name}`;
    addFailure({
      equipment_id: equipId,
      company_id:   eq.company_id,
      title:        finalTitle,
      description:  desc,
      category,
      severity,
      submitter:    sub,
      ai_diagnosis: diag ?? undefined,
    });
    setStep(3);
    setSubmitting(false);
  }

  const step0Valid = sub.firstName && sub.lastName && sub.company && sub.phone;
  const step1Valid = equipId && category && severity;

  const MicButton = ({ field }: { field: 'title' | 'desc' }) => (
    <button type="button" onClick={() => startVoice(field)}
      title={recording === field ? 'Arrêter l\'enregistrement' : 'Dicter à la voix (fr)'}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition-all ${
        recording === field
          ? 'border-crit/60 bg-crit/15 text-crit animate-pulse'
          : 'border-[var(--hair)] text-steel hover:text-cyan hover:border-cyan/40'
      }`}>
      {recording === field ? <MicOff size={14} /> : <Mic size={14} />}
    </button>
  );

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((s, i) => (
            <div key={i} className={`flex items-center gap-2 text-xs font-medium ${i === step ? 'text-cyan' : i < step ? 'text-ok' : 'text-steel'}`}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] ${
                i < step   ? 'border-ok/40 bg-ok/10 text-ok' :
                i === step ? 'border-cyan/60 bg-cyan/10 text-cyan' :
                             'border-[var(--hair)] text-steel'}`}>
                {i < step ? '✓' : i + 1}
              </span>
              <span className="hidden sm:block">{s}</span>
            </div>
          ))}
        </div>
        <div className="h-1 rounded-full bg-[var(--surface2)] overflow-hidden">
          <div className="h-full bg-cyan rounded-full transition-all duration-500" style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }} />
        </div>
      </div>

      {/* ── ÉTAPE 0 — Infos soumetteur ──────────────────────────────────── */}
      {step === 0 && (
        <FadeIn>
          <div className="glass p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-cyan/10 text-cyan"><User size={18} /></div>
              <div>
                <h2 className="font-bold text-chalk">Vos informations</h2>
                <p className="text-steel text-xs">Ces infos permettent aux admins de vous contacter rapidement.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="space-y-1.5">
                <span className="text-xs text-steel">Prénom *</span>
                <input value={sub.firstName} onChange={e => setSub(s => ({...s, firstName: e.target.value}))} placeholder="Jean" className="field-input" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs text-steel">Nom *</span>
                <input value={sub.lastName} onChange={e => setSub(s => ({...s, lastName: e.target.value}))} placeholder="Dupont" className="field-input" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs text-steel">Entreprise / Client *</span>
                <input value={sub.company} onChange={e => setSub(s => ({...s, company: e.target.value}))} placeholder="SOBEBRA Cotonou" className="field-input" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs text-steel">Téléphone *</span>
                <input value={sub.phone} onChange={e => setSub(s => ({...s, phone: e.target.value}))} placeholder="+229 97 00 00 00" className="field-input" />
              </label>
              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-xs text-steel">Email (optionnel)</span>
                <input type="email" value={sub.email} onChange={e => setSub(s => ({...s, email: e.target.value}))} placeholder="jean.dupont@sobebra.bj" className="field-input" />
              </label>
            </div>

            <div className="flex justify-end">
              <button onClick={nextStep} disabled={!step0Valid} className="btn btn-primary gap-2">
                Suivant <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </FadeIn>
      )}

      {/* ── ÉTAPE 1 — Description panne ─────────────────────────────────── */}
      {step === 1 && (
        <FadeIn>
          <div className="glass p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-cyan/10 text-cyan"><Wrench size={18} /></div>
              <div>
                <h2 className="font-bold text-chalk">La panne</h2>
                <p className="text-steel text-xs">Décrivez le problème. Utilisez le micro pour dicter.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="space-y-1.5">
                <span className="text-xs text-steel">Équipement *</span>
                <select value={equipId} onChange={e => setEquipId(e.target.value)} className="field-input">
                  {equipments.map(e => <option key={e.id} value={e.id}>{e.name} ({e.serial_number})</option>)}
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="text-xs text-steel">Catégorie *</span>
                <select value={category} onChange={e => setCategory(e.target.value)} className="field-input">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </label>
            </div>

            {/* Titre avec mic */}
            <div className="space-y-1.5">
              <span className="text-xs text-steel">Titre court</span>
              <div className="flex gap-2">
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="ex : Roulement bruyant sur le convoyeur"
                  className="field-input flex-1" />
                <MicButton field="title" />
              </div>
            </div>

            {/* Description avec mic */}
            <div className="space-y-1.5">
              <span className="text-xs text-steel">Description des symptômes</span>
              <div className="flex gap-2 items-start">
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4}
                  placeholder="Décrivez ce que vous observez : bruits, vibrations, fuites, surchauffe, depuis quand…"
                  className="field-input resize-none flex-1" />
                <MicButton field="desc" />
              </div>
              {recording === 'desc' && (
                <p className="text-xs text-crit flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-crit animate-pulse" />
                  Enregistrement en cours — parlez clairement en français
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <span className="text-xs text-steel">Niveau d&apos;impact *</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SEVERITIES.map(s => (
                  <button key={s.value} type="button" data-sel={severity === s.value}
                    onClick={() => setSeverity(s.value)}
                    className={`rounded-lg border px-2 py-3 text-xs font-semibold transition-all text-center ${s.color} ${severity === s.value ? 'ring-1 ring-current' : 'opacity-55 hover:opacity-90'}`}>
                    <div>{s.label}</div>
                    <div className="font-normal opacity-70 mt-0.5">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={prevStep} className="btn btn-ghost">Retour</button>
              <button onClick={nextStep} disabled={!step1Valid} className="btn btn-primary gap-2">
                Suivant <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </FadeIn>
      )}

      {/* ── ÉTAPE 2 — Capture + IA ──────────────────────────────────────── */}
      {step === 2 && (
        <FadeIn>
          <div className="space-y-4">
            <div className="glass p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-cyan/10 text-cyan"><Camera size={18} /></div>
                <div>
                  <h2 className="font-bold text-chalk">Preuve visuelle</h2>
                  <p className="text-steel text-xs">Photographiez la pièce — l&apos;IA analyse et le diagnostic est lu à voix haute.</p>
                </div>
              </div>
              <CameraCapture onComplete={setShots} />
            </div>

            <AiScanner
              image={shots[0]?.dataUrl}
              context={{ equipmentName: eq.name, category, description: desc }}
              onDiagnosis={handleDiagnosis}
            />

            <div className="flex justify-between">
              <button onClick={prevStep} className="btn btn-ghost">Retour</button>
              <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary gap-2">
                {submitting ? 'Envoi en cours…' : 'Soumettre la demande'}
              </button>
            </div>
          </div>
        </FadeIn>
      )}

      {/* ── ÉTAPE 3 — Confirmation ──────────────────────────────────────── */}
      {step === 3 && (
        <FadeIn>
          <div className="glass p-10 text-center space-y-5">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-ok/10 text-ok mx-auto">
              <CheckCircle size={36} />
            </div>
            <div>
              <h2 className="text-xl font-black text-chalk">Demande envoyée !</h2>
              <p className="text-steel text-sm mt-2 max-w-sm mx-auto">
                Les admins ont été alertés par email avec votre dossier complet.
              </p>
            </div>

            <div className="glass p-4 text-left space-y-2 max-w-sm mx-auto">
              <p className="label-mono text-cyan">Résumé de votre demande</p>
              <div className="text-sm space-y-1">
                <div className="flex justify-between"><span className="text-steel">Soumetteur</span><span className="text-chalk">{sub.firstName} {sub.lastName}</span></div>
                <div className="flex justify-between"><span className="text-steel">Entreprise</span><span className="text-chalk">{sub.company}</span></div>
                <div className="flex justify-between"><span className="text-steel">Équipement</span><span className="text-chalk font-mono">{eq.name}</span></div>
                <div className="flex justify-between"><span className="text-steel">Sévérité</span><span className="text-chalk capitalize">{severity}</span></div>
                {diag && <div className="flex justify-between"><span className="text-steel">Pièce IA</span><span className="text-amber text-xs">{diag.recommended_parts?.[0]?.name ?? '—'}</span></div>}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button onClick={() => router.push('/technicien/suivi')} className="btn btn-primary">
                Suivre ma demande
              </button>
              <button onClick={() => {
                setStep(0);
                setSub({ firstName: '', lastName: '', phone: '', email: '', company: '' });
                setTitle(''); setDesc(''); setShots([]); setDiag(null);
              }} className="btn btn-ghost">
                Nouvelle demande
              </button>
            </div>
          </div>
        </FadeIn>
      )}
    </div>
  );
}

export default function SoumettreForm() {
  return (
    <Suspense fallback={<div className="text-steel text-sm">Chargement…</div>}>
      <SoumettreFormInner />
    </Suspense>
  );
}
