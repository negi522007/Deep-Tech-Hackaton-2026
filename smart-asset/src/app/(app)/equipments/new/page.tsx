'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Boxes, Camera, CheckCircle } from 'lucide-react';

const CATEGORIES = ['conveyor', 'compressor', 'mill', 'loom', 'pump', 'turbine', 'motor', 'generator', 'boiler', 'other'];
const COMPANIES = [
  { id: 'c1', name: 'Industrie Nord SARL' },
  { id: 'c2', name: 'Minex SA' },
  { id: 'c3', name: 'TextilePro' },
];

type Field = {
  name: string;
  model: string;
  manufacturer: string;
  serial_number: string;
  category: string;
  company_id: string;
  location: string;
  purchase_date: string;
};

const EMPTY: Field = {
  name: '', model: '', manufacturer: '', serial_number: '',
  category: '', company_id: '', location: '', purchase_date: '',
};

export default function NewEquipmentPage() {
  const router = useRouter();
  const [form, setForm] = useState<Field>(EMPTY);
  const [done, setDone] = useState(false);

  function set(k: keyof Field, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In production this would POST to /api/equipments or Supabase
    // For the demo, we simulate success after brief delay
    setDone(true);
    setTimeout(() => router.push('/equipments'), 1800);
  }

  const valid = form.name && form.serial_number && form.category && form.company_id;

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-ok/10 text-ok">
          <CheckCircle size={32} />
        </div>
        <p className="text-chalk font-semibold text-lg">Équipement enregistré</p>
        <p className="text-steel text-sm">Redirection vers l&apos;inventaire…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Back */}
      <Link href="/equipments" className="inline-flex items-center gap-2 text-steel hover:text-chalk text-sm mb-6 transition-colors">
        <ArrowLeft size={15} /> Retour à l&apos;inventaire
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-cyan/10 text-cyan">
          <Boxes size={22} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-chalk">Nouvel équipement</h1>
          <p className="text-steel text-sm">Enregistrer un actif industriel dans le système</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="glass p-6 space-y-5">
          <p className="label-mono text-cyan">Identification</p>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="text-xs text-steel">Nom de l&apos;équipement *</span>
              <input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="ex : Convoyeur ligne 4"
                className="field-input"
                required
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs text-steel">Numéro de série *</span>
              <input
                value={form.serial_number}
                onChange={(e) => set('serial_number', e.target.value)}
                placeholder="ex : CNV-042"
                className="field-input font-mono"
                required
              />
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="text-xs text-steel">Fabricant</span>
              <input
                value={form.manufacturer}
                onChange={(e) => set('manufacturer', e.target.value)}
                placeholder="ex : SIEMENS"
                className="field-input"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs text-steel">Modèle</span>
              <input
                value={form.model}
                onChange={(e) => set('model', e.target.value)}
                placeholder="ex : C200"
                className="field-input"
              />
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="text-xs text-steel">Catégorie *</span>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className="field-input cursor-pointer"
                required
              >
                <option value="">— Sélectionner —</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-xs text-steel">Entreprise *</span>
              <select
                value={form.company_id}
                onChange={(e) => set('company_id', e.target.value)}
                className="field-input cursor-pointer"
                required
              >
                <option value="">— Sélectionner —</option>
                {COMPANIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="text-xs text-steel">Localisation</span>
              <input
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="ex : Hall A"
                className="field-input"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs text-steel">Date d&apos;achat</span>
              <input
                type="date"
                value={form.purchase_date}
                onChange={(e) => set('purchase_date', e.target.value)}
                className="field-input"
              />
            </label>
          </div>
        </div>

        {/* Photo upload — visual only, feeds AI diagnosis flow */}
        <div className="glass p-6">
          <p className="label-mono text-cyan mb-3">Photo de l&apos;équipement</p>
          <label className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[var(--line)] p-8 cursor-pointer hover:border-cyan/40 hover:bg-cyan/5 transition-colors">
            <Camera size={28} className="text-steel" />
            <span className="text-sm text-steel">Glisser-déposer ou cliquer pour uploader</span>
            <span className="text-xs text-muted">JPEG, PNG, WEBP — max 10 Mo</span>
            <input type="file" accept="image/*" className="hidden" />
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/equipments" className="btn btn-ghost">Annuler</Link>
          <button type="submit" disabled={!valid} className="btn btn-primary">
            Enregistrer l&apos;équipement
          </button>
        </div>
      </form>
    </div>
  );
}
