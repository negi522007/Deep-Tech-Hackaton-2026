'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui';
import { FadeIn } from '@/components/motion';
import CameraCapture, { CapturedShot } from '@/components/CameraCapture';
import AiScanner from '@/components/AiScanner';
import { equipments, companies } from '@/lib/sample-data';
import { AiDiagnosis, Severity, PartUrgency } from '@/lib/types';
import { useStore } from '@/lib/store';
import { CheckCircle, AlertTriangle } from 'lucide-react';

const CATEGORIES = [
  { value: 'mechanical', label: 'Mécanique' },
  { value: 'electrical', label: 'Électrique' },
  { value: 'hydraulic', label: 'Hydraulique' },
  { value: 'pneumatic', label: 'Pneumatique' },
  { value: 'structural', label: 'Structurel' },
];

const SEVERITIES: { value: Severity; label: string; color: string }[] = [
  { value: 'low',      label: 'Faible',   color: 'border-ok/40 text-ok data-[sel=true]:bg-ok/10' },
  { value: 'medium',   label: 'Moyenne',  color: 'border-info/40 text-info data-[sel=true]:bg-info/10' },
  { value: 'high',     label: 'Élevée',   color: 'border-warn/40 text-warn data-[sel=true]:bg-warn/10' },
  { value: 'critical', label: 'Critique', color: 'border-crit/40 text-crit data-[sel=true]:bg-crit/10' },
];

export default function NewFailurePage() {
  const router = useRouter();
  const { addFailure, addPartRequest } = useStore();

  const [equipmentId, setEquipmentId] = useState(equipments[0].id);
  const [category, setCategory] = useState('mechanical');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [description, setDescription] = useState('');
  const [shots, setShots] = useState<CapturedShot[]>([]);
  const [diag, setDiag] = useState<AiDiagnosis | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const equipment = equipments.find((e) => e.id === equipmentId)!;
  const company = companies.find((c) => c.id === equipment.company_id)!;

  function handleDiagnosis(d: AiDiagnosis) {
    setDiag(d);
    // Pré-remplis la sévérité depuis l'IA si elle est plus haute
    const order: Severity[] = ['low', 'medium', 'high', 'critical'];
    if (order.indexOf(d.severity) > order.indexOf(severity)) {
      setSeverity(d.severity);
    }
  }

  function handleSubmit() {
    const title = description.trim() || `Panne ${category} — ${equipment.name}`;
    const failureId = addFailure({
      equipment_id: equipmentId,
      company_id: company.id,
      title,
      description: description || undefined,
      category,
      severity,
    });

    // Si l'IA a recommandé des pièces → créer la demande automatiquement
    if (diag?.recommended_parts?.length) {
      const part = diag.recommended_parts[0];
      const urgencyMap: Record<Severity, PartUrgency> = {
        critical: 'blocking', high: 'urgent', medium: 'normal', low: 'normal',
      };
      addPartRequest({
        failure_id: failureId,
        part_name: part.name,
        quantity: 1,
        urgency: urgencyMap[severity],
      });
    }

    setSubmitted(true);
    setTimeout(() => router.push('/failures'), 1600);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-ok/10 text-ok">
          <CheckCircle size={32} />
        </div>
        <p className="text-chalk font-semibold text-lg">Panne enregistrée</p>
        <p className="text-steel text-sm">Workflow démarré — étape 1 : Soumis</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <PageHeader title="Saisie manuelle" subtitle="Signalement admin → capture guidée → vision IA → pièces" />

      <div className="space-y-5">
        {/* Infos de base */}
        <FadeIn>
          <div className="glass p-6 space-y-4">
            <p className="label-mono text-cyan">Identification</p>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="space-y-1.5">
                <span className="text-xs text-steel">Équipement</span>
                <select value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)} className="field-input">
                  {equipments.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="text-xs text-steel">Catégorie</span>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="field-input">
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </label>
            </div>

            {/* Sévérité — sélection visuelle */}
            <div className="space-y-1.5">
              <span className="text-xs text-steel">Sévérité *</span>
              <div className="grid grid-cols-4 gap-2">
                {SEVERITIES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    data-sel={severity === s.value}
                    onClick={() => setSeverity(s.value)}
                    className={`rounded-lg border px-2 py-2.5 text-xs font-semibold transition-all ${s.color} ${
                      severity === s.value ? 'ring-1 ring-current' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="block space-y-1.5">
              <span className="text-xs text-steel">Description des symptômes</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Décrivez ce que vous observez : bruits, vibrations, fuites, surchauffe…"
                className="field-input resize-none"
              />
            </label>
          </div>
        </FadeIn>

        {/* Capture visuelle */}
        <FadeIn delay={0.05}>
          <CameraCapture onComplete={setShots} />
        </FadeIn>

        {/* Diagnostic IA */}
        <FadeIn delay={0.1}>
          <AiScanner
            image={shots[0]?.dataUrl}
            context={{ equipmentName: equipment.name, category, description }}
            onDiagnosis={handleDiagnosis}
          />
        </FadeIn>

        {/* Résumé IA si disponible */}
        {diag && (
          <FadeIn>
            <div className="glass p-5 border-cyan/20">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={15} className="text-cyan" />
                <p className="label-mono text-cyan">Diagnostic IA — pré-rempli automatiquement</p>
              </div>
              <p className="text-sm text-chalk mb-2">{diag.diagnosis}</p>
              {diag.recommended_parts?.length > 0 && (
                <p className="text-xs text-steel">
                  Pièce recommandée : <span className="text-amber font-medium">{diag.recommended_parts[0].name}</span> — sera ajoutée automatiquement à la demande.
                </p>
              )}
            </div>
          </FadeIn>
        )}

        {/* Soumettre */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/failures')}
            className="btn btn-ghost flex-1"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="btn btn-primary flex-1"
          >
            Enregistrer la panne
          </button>
        </div>
      </div>
    </div>
  );
}
