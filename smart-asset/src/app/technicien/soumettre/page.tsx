'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { equipments, companies } from '@/lib/sample-data';
import { AiDiagnosis, Severity, Submitter } from '@/lib/types';
import CameraCapture, { CapturedShot } from '@/components/CameraCapture';
import AiScanner from '@/components/AiScanner';
import { FadeIn } from '@/components/motion';
import { User, Wrench, Camera, CheckCircle, ChevronRight, QrCode, Mic, Loader2 } from 'lucide-react';

const STEPS = ['Vos informations', 'La panne', 'Capture visuelle', 'Confirmation'];

const CATEGORIES = [
  { value: 'mechanical', label: 'Mécanique' },
  { value: 'electrical', label: 'Électrique' },
  { value: 'hydraulic',  label: 'Hydraulique' },
  { value: 'pneumatic',  label: 'Pneumatique' },
  { value: 'structural', label: 'Structurel' },
];

const SEVERITIES: { value: Severity; label: string; desc: string; color: string }[] = [
  { value: 'low',      label: 'Faible',   desc: 'Machine fonctionnelle',     color: 'border-ok/40   text-ok   data-[sel=true]:bg-ok/10' },
  { value: 'medium',   label: 'Moyenne',  desc: 'Dégradation notable',       color: 'border-info/40 text-info  data-[sel=true]:bg-info/10' },
  { value: 'high',     label: 'Élevée',   desc: 'Production impactée',       color: 'border-warn/40 text-warn  data-[sel=true]:bg-warn/10' },
  { value: 'critical', label: 'Critique', desc: 'Arrêt de production',       color: 'border-crit/40 text-crit  data-[sel=true]:bg-crit/10' },
];

export default function SoumettreForm() {
  const router = useRouter();
  const { addFailure } = useStore();
  const [step, setStep] = useState(0);

  // Step 0 — Infos soumetteur
  const [sub, setSub] = useState<Submitter>({ firstName: '', lastName: '', phone: '', email: '', company: '' });

  // Step 1 — Panne
  const [equipId, setEquipId]   = useState(equipments[0].id);
  const [category, setCategory] = useState('mechanical');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [title, setTitle]       = useState('');
  const [desc, setDesc]         = useState('');
  const [scanning, setScanning] = useState(false);
  const [listening, setListening] = useState(false);

  // Step 2 — Visuel + IA
  const [shots, setShots]     = useState<CapturedShot[]>([]);
  const [diag, setDiag]       = useState<AiDiagnosis | null>(null);

  // Step 3 — Done
  const [submitting, setSubmitting] = useState(false);

  const eq = equipments.find(e => e.id === equipId)!;

  function nextStep() { setStep(s => s + 1); }
  function prevStep() { setStep(s => s - 1); }

  function startScan() {
    setScanning(true);
    setTimeout(() => {
      // On sélectionne le 2ème équipement (ou un spécifique) pour la démo
      const eq = equipments.length > 1 ? equipments[1] : equipments[0];
      setEquipmentId(eq.id);
      setScanning(false);
    }, 2500);
  }

  function startListening() {
    if (typeof window === 'undefined') return;
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("La reconnaissance vocale n'est pas supportée par ce navigateur.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.interimResults = false;
    
    recognition.onstart = () => setListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setDesc(prev => prev ? prev + ' ' + transcript : transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognition.start();
  }

  function handleDiagnosis(d: AiDiagnosis) {
    setDiag(d);
    const order: Severity[] = ['low', 'medium', 'high', 'critical'];
    if (order.indexOf(d.severity) > order.indexOf(severity)) setSeverity(d.severity);
  }

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

  // ── Validation par étape ─────────────────────────────────
  const step0Valid = sub.firstName && sub.lastName && sub.company && sub.phone;
  const step1Valid = equipId && category && severity;

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((s, i) => (
            <div key={i} className={`flex items-center gap-2 text-xs font-medium ${i === step ? 'text-cyan' : i < step ? 'text-ok' : 'text-steel'}`}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] ${
                i < step  ? 'border-ok/40 bg-ok/10 text-ok' :
                i === step ? 'border-cyan/60 bg-cyan/10 text-cyan' :
                             'border-[var(--hair)] text-steel'
              }`}>
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

      {/* ── ÉTAPE 0 — Infos soumetteur ──────────────────── */}
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

      {/* ── ÉTAPE 1 — Description panne ─────────────────── */}
      {step === 1 && (
        <FadeIn>
          <div className="glass p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-cyan/10 text-cyan"><Wrench size={18} /></div>
              <div>
                <h2 className="font-bold text-chalk">La panne</h2>
                <p className="text-steel text-xs">Décrivez le problème avec le plus de détails possible.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="space-y-1.5 relative">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-steel">Équipement *</span>
                  <button onClick={startScan} type="button" className="text-cyan text-xs flex items-center gap-1 hover:underline">
                    <QrCode size={12} /> Scan QR
                  </button>
                </div>
                {scanning ? (
                  <div className="field-input flex items-center gap-2 text-cyan font-mono text-sm border-cyan/40 bg-cyan/5">
                    <Loader2 size={15} className="animate-spin" /> Détection en cours...
                  </div>
                ) : (
                  <select value={equipId} onChange={e => setEquipId(e.target.value)} className="field-input">
                    {equipments.map(e => <option key={e.id} value={e.id}>{e.name} ({e.serial_number})</option>)}
                  </select>
                )}
              </label>
              <label className="space-y-1.5">
                <span className="text-xs text-steel">Catégorie *</span>
                <select value={category} onChange={e => setCategory(e.target.value)} className="field-input">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </label>
            </div>

            <label className="block space-y-1.5">
              <span className="text-xs text-steel">Titre court</span>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="ex : Roulement bruyant sur le convoyeur" className="field-input" />
            </label>

            <label className="block space-y-1.5 relative">
              <div className="flex justify-between items-center">
                <span className="text-xs text-steel">Description des symptômes</span>
                <button 
                  onClick={startListening} 
                  type="button" 
                  className={`text-xs flex items-center gap-1 px-2 py-0.5 rounded transition ${listening ? 'bg-crit/20 text-crit animate-pulse' : 'bg-[var(--surface2)] text-steel hover:text-chalk'}`}
                >
                  <Mic size={12} /> {listening ? 'Écoute en cours...' : 'Dictée vocale'}
                </button>
              </div>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4}
                placeholder="Décrivez ce que vous observez : bruits, vibrations, fuites, surchauffe, depuis quand…"
                className={`field-input resize-none ${listening ? 'border-crit/40 focus:border-crit/40' : ''}`} />
            </label>

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

      {/* ── ÉTAPE 2 — Capture + IA ──────────────────────── */}
      {step === 2 && (
        <FadeIn>
          <div className="space-y-4">
            <div className="glass p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-cyan/10 text-cyan"><Camera size={18} /></div>
                <div>
                  <h2 className="font-bold text-chalk">Preuve visuelle</h2>
                  <p className="text-steel text-xs">Photographiez la pièce défectueuse — l&apos;IA analyse et recommande la pièce à commander.</p>
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

      {/* ── ÉTAPE 3 — Confirmation ──────────────────────── */}
      {step === 3 && (
        <FadeIn>
          <div className="glass p-10 text-center space-y-5">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-ok/10 text-ok mx-auto">
              <CheckCircle size={36} />
            </div>
            <div>
              <h2 className="text-xl font-black text-chalk">Demande envoyée !</h2>
              <p className="text-steel text-sm mt-2 max-w-sm mx-auto">
                Les admins ont été alertés par email avec votre dossier complet. Vous pouvez suivre l&apos;avancement ci-dessous.
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
              <button onClick={() => { setStep(0); setSub({firstName:'',lastName:'',phone:'',email:'',company:''}); setTitle(''); setDesc(''); setShots([]); setDiag(null); }} className="btn btn-ghost">
                Nouvelle demande
              </button>
            </div>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
