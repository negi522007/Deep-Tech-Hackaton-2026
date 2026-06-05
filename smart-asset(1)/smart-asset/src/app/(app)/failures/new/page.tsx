'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui';
import { FadeIn } from '@/components/motion';
import CameraCapture, { CapturedShot } from '@/components/CameraCapture';
import AiScanner from '@/components/AiScanner';
import { equipments as sampleEquipments } from '@/lib/sample-data';
import { AiDiagnosis, Equipment } from '@/lib/types';
import { apiGet, apiPost } from '@/lib/http';

export default function NewFailurePage() {
  const router = useRouter();
  const [equipments, setEquipments] = useState<Equipment[]>(sampleEquipments);
  const [equipmentId, setEquipmentId] = useState(sampleEquipments[0].id);
  const [category, setCategory] = useState('mechanical');
  const [description, setDescription] = useState('');
  const [shots, setShots] = useState<CapturedShot[]>([]);
  const [diag, setDiag] = useState<AiDiagnosis | null>(null);
  const [createdFailureId, setCreatedFailureId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadEquipments = useCallback(async () => {
    const data = await apiGet<Equipment[]>('/api/equipments', sampleEquipments);
    setEquipments(data);
    if (data.length > 0) setEquipmentId((prev) => prev || data[0].id);
  }, []);

  useEffect(() => {
    loadEquipments();
  }, [loadEquipments]);

  const equipment = useMemo(() => equipments.find((e) => e.id === equipmentId), [equipments, equipmentId]);

  async function saveFailure() {
    if (!equipment) return;
    setSaving(true);
    const failure = await apiPost<{ id: string }>('/api/failures', {
      equipment_id: equipment.id,
      company_id: equipment.company_id,
      title: description ? `Panne signalée: ${description.slice(0, 40)}` : `Incident ${new Date().toLocaleString('fr-FR')}`,
      description,
      category,
      severity: diag?.severity || 'medium',
      ai_diagnosis: diag,
      status: 'reported',
    });
    if (!failure?.id) {
      setSaving(false);
      return;
    }
    setCreatedFailureId(failure.id);

    await Promise.all(
      shots.map((shot) =>
        apiPost('/api/uploads/failure-image', {
          failure_id: failure.id,
          angle: shot.angle,
          imageBase64: shot.dataUrl.split(',')[1],
          imageMediaType: 'image/jpeg',
        }),
      ),
    );
    setSaving(false);
    router.push('/failures');
  }

  return (
    <div className="max-w-3xl">
      <PageHeader title="Déclarer une panne" subtitle="Signalement → capture guidée → vision IA → pièces" />

      <div className="space-y-5">
        <FadeIn>
          <div className="glass p-6 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label-mono">Équipement</label>
              <select value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)} className="input mt-1.5">
                {equipments.map((e) => <option key={e.id} value={e.id} className="bg-panel">{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-mono">Catégorie</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="input mt-1.5">
                <option value="mechanical" className="bg-panel">Mécanique</option>
                <option value="electrical" className="bg-panel">Électrique</option>
                <option value="hydraulic" className="bg-panel">Hydraulique</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label-mono">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                placeholder="Symptômes observés…" className="input mt-1.5" />
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.05}><CameraCapture onComplete={setShots} /></FadeIn>

        <FadeIn delay={0.1}>
          <AiScanner
            image={shots[0]?.dataUrl}
            failureId={createdFailureId}
            companyId={equipment?.company_id}
            context={{ equipmentName: equipment?.name, category, description }}
            onDiagnosis={(d) => setDiag(d)}
          />
        </FadeIn>

        <button onClick={saveFailure} disabled={saving || !equipment} className="btn-primary w-full py-3">
          {saving ? 'Enregistrement…' : 'Enregistrer la panne'}
        </button>
      </div>
    </div>
  );
}
