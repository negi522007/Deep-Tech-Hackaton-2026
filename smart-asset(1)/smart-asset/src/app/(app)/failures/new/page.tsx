'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui';
import { FadeIn } from '@/components/motion';
import CameraCapture, { CapturedShot } from '@/components/CameraCapture';
import AiScanner from '@/components/AiScanner';
import { equipments } from '@/lib/sample-data';
import { AiDiagnosis } from '@/lib/types';

export default function NewFailurePage() {
  const router = useRouter();
  const [equipmentId, setEquipmentId] = useState(equipments[0].id);
  const [category, setCategory] = useState('mechanical');
  const [description, setDescription] = useState('');
  const [shots, setShots] = useState<CapturedShot[]>([]);
  const [, setDiag] = useState<AiDiagnosis | null>(null);

  const equipment = equipments.find((e) => e.id === equipmentId)!;

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
            context={{ equipmentName: equipment.name, category, description }}
            onDiagnosis={(d) => setDiag(d)}
          />
        </FadeIn>

        <button onClick={() => router.push('/failures')} className="btn-ghost w-full py-3">
          Enregistrer la panne
        </button>
      </div>
    </div>
  );
}
