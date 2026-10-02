"use client";
import Link from "next/link";
import { ChevronRight, AlertTriangle } from "lucide-react";
import { useStore } from "@/lib/store";
import { STATUS } from "@/lib/data";
import { Stat, Pill } from "@/components/ui";

export function EquipmentDetailScreen({ id }: { id: string }) {
  const { equipment } = useStore();
  const eq = equipment.find((e) => e.id === id);
  if (!eq) return <div className="screen"><p className="muted">Équipement introuvable.</p><Link href="/equipment" className="link">Retour</Link></div>;

  const failures = ["Roulement principal grippé · critique", "Surchauffe paliers · haute", "Vibration anormale · moyenne"].slice(0, eq.status === "operational" ? 1 : 3);
  return (
    <div className="screen">
      <Link href="/equipment" className="back"><ChevronRight size={16} style={{ transform: "rotate(180deg)" }} /> Équipements</Link>
      <header className="screen-head">
        <div><p className="kicker mono">{eq.id} · {eq.company}</p><h1 className="display">{eq.name}</h1></div>
        <Pill label={STATUS[eq.status].l} color={STATUS[eq.status].c} />
      </header>
      <div className="grid-4">
        <Stat label="Fabricant" value={eq.manufacturer} />
        <Stat label="Modèle" value={eq.model} />
        <Stat label="N° série" value={eq.serial} />
        <Stat label="Disponibilité" value={eq.uptime + "%"} />
      </div>
      <div className="grid-2">
        <div className="card reveal">
          <div className="card-head"><h3>Historique des pannes</h3></div>
          <div className="list">
            {failures.map((t, i) => (
              <div key={i} className="row-item static"><div><div className="strongtxt">{t.split(" · ")[0]}</div><div className="muted sm">il y a {i + 1} sem.</div></div><span className="muted sm">{t.split(" · ")[1]}</span></div>
            ))}
          </div>
        </div>
        <div className="card reveal">
          <div className="card-head"><h3>Maintenances</h3></div>
          <div className="list">
            {["Graissage paliers", "Remplacement filtre", "Contrôle vibratoire"].map((t, i) => (
              <div key={i} className="row-item static"><div className="strongtxt">{t}</div><span className="muted sm">il y a {i * 2 + 2} sem.</span></div>
            ))}
          </div>
        </div>
      </div>
      <Link href="/declare" className="btn primary" style={{ width: "fit-content" }}><AlertTriangle size={16} /> Déclarer une panne sur cet équipement</Link>
    </div>
  );
}
