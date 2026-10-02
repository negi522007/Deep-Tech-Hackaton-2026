"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, Sparkles, PackageSearch, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { FAILURE_CATEGORIES, DIAGNOSIS_MAP, SEV } from "@/lib/data";
import { Pill } from "@/components/ui";
import type { Diagnosis } from "@/lib/types";

type Step = "form" | "scanning" | "result";

export function DeclareScreen() {
  const router = useRouter();
  const { equipment, addRequest, notify } = useStore();
  const [step, setStep] = useState<Step>("form");
  const [eqId, setEqId] = useState(equipment[0].id);
  const [cat, setCat] = useState(FAILURE_CATEGORIES[0]);
  const [desc, setDesc] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [diag, setDiag] = useState<Diagnosis | null>(null);
  const [conf, setConf] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const eq = equipment.find((e) => e.id === eqId)!;

  async function runDiagnosis() {
    setStep("scanning");
    let result: Diagnosis = DIAGNOSIS_MAP[cat];
    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: cat, image: photo }),
      });
      if (res.ok) result = await res.json();
    } catch {
      /* fallback mock déterministe — la démo ne casse jamais */
    }
    // laisse l'animation de scan respirer
    setTimeout(() => { setDiag(result); setStep("result"); }, 1400);
  }

  useEffect(() => {
    if (step !== "result" || !diag) return;
    let v = 0; const target = Math.round(diag.conf * 100);
    const t = setInterval(() => { v += 3; if (v >= target) { v = target; clearInterval(t); } setConf(v); }, 18);
    return () => clearInterval(t);
  }, [step, diag]);

  function createRequest() {
    if (!diag) return;
    const id = "PR-" + Math.floor(7800 + Math.random() * 99);
    addRequest({ id, equipment: eq.name, part: diag.part, urgency: diag.severity === "critical" ? "urgent" : "high", stage: 0, fromAI: true, createdH: 0 });
    notify(`${id} créée depuis le diagnostic IA`);
    router.push("/requests");
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(f);
  }

  return (
    <div className="screen narrow">
      <header className="screen-head"><div><p className="kicker">Intervention</p><h1 className="display">Déclarer une panne</h1></div></header>

      {step === "form" && (
        <div className="card reveal">
          <label className="field"><span>Équipement</span>
            <select value={eqId} onChange={(e) => setEqId(e.target.value)}>{equipment.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
          </label>
          <label className="field"><span>Catégorie de panne</span>
            <select value={cat} onChange={(e) => setCat(e.target.value)}>{FAILURE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          </label>
          <label className="field"><span>Description</span>
            <textarea rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Décrivez le symptôme observé…" />
          </label>
          <div className="field"><span>Preuve visuelle (obligatoire)</span>
            <button type="button" className="dropzone" onClick={() => fileRef.current?.click()}>
              {photo ? <img src={photo} alt="" className="preview" /> : <><Camera size={22} /><span>Capture guidée multi-angles</span></>}
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
          </div>
          <button className="btn primary lg" disabled={!photo} onClick={runDiagnosis}><Sparkles size={16} /> Diagnostiquer avec l&apos;IA</button>
          {!photo && <p className="muted sm center">Ajoutez une photo pour activer le diagnostic.</p>}
        </div>
      )}

      {step === "scanning" && (
        <div className="card scanning reveal">
          <div className="scan-img">{photo && <img src={photo} alt="" />}<div className="scan-sweep" /></div>
          <div className="scan-txt"><Sparkles size={16} /> Analyse visuelle en cours…</div>
        </div>
      )}

      {step === "result" && diag && (
        <div className="card diag">
          <div className="diag-head reveal"><Sparkles size={16} style={{ color: "var(--accent)" }} /><span>Diagnostic IA</span></div>
          <h2 className="diag-defect reveal d1">{diag.defect}</h2>
          <div className="diag-grid">
            <div className="reveal d2"><span className="label">Confiance</span><div className="conf"><div className="conf-bar"><div className="conf-fill" style={{ width: conf + "%" }} /></div><span className="mono">{conf}%</span></div></div>
            <div className="reveal d3"><span className="label">Gravité estimée</span><div><Pill label={SEV[diag.severity].l} color={SEV[diag.severity].c} /></div></div>
          </div>
          <div className="diag-part reveal d4"><PackageSearch size={18} style={{ color: "var(--accent)" }} /><div><span className="label">Pièce recommandée</span><div className="strongtxt">{diag.part}</div></div></div>
          <div className="diag-actions reveal d5">
            <button className="btn ghost" onClick={() => { setStep("form"); setDiag(null); setConf(0); }}>Reprendre</button>
            <button className="btn primary" onClick={createRequest}>Créer la demande de pièce <ArrowRight size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
