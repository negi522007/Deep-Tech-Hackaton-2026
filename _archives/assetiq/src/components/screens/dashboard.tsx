"use client";
import Link from "next/link";
import { Boxes, AlertTriangle, PackageSearch, Gauge, Plus, ChevronRight, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { STATUS, STAGES } from "@/lib/data";
import { Stat, Pill } from "@/components/ui";

export function DashboardScreen() {
  const { equipment, requests } = useStore();
  const open = requests.filter((r) => r.stage < 6).length;
  const down = equipment.filter((e) => e.status === "down").length;

  return (
    <div className="screen">
      <header className="screen-head">
        <div><p className="kicker">Cimenterie du Littoral</p><h1 className="display">Vue d&apos;ensemble</h1></div>
        <Link href="/declare" className="btn primary"><Plus size={16} /> Déclarer une panne</Link>
      </header>

      <div className="grid-4">
        <Stat label="Équipements" value={equipment.length} sub="suivis en parc" icon={<Boxes size={16} className="muted" />} />
        <Stat label="En panne" value={down} sub="intervention requise" icon={<AlertTriangle size={16} className="muted" />} />
        <Stat label="Demandes ouvertes" value={open} sub="dans le pipeline" icon={<PackageSearch size={16} className="muted" />} />
        <Stat label="Disponibilité" value="94%" sub="parc global · 30j" icon={<Gauge size={16} className="muted" />} />
      </div>

      <div className="grid-2">
        <div className="card reveal">
          <div className="card-head"><h3>Équipements critiques</h3><Link href="/equipment" className="link">Tout voir <ChevronRight size={14} /></Link></div>
          <div className="list">
            {equipment.filter((e) => e.status !== "operational").map((e) => (
              <Link key={e.id} href={`/equipment/${e.id}`} className="row-item">
                <div><div className="mono sm">{e.id}</div><div className="strongtxt">{e.name}</div></div>
                <Pill label={STATUS[e.status].l} color={STATUS[e.status].c} />
              </Link>
            ))}
          </div>
        </div>

        <div className="card reveal">
          <div className="card-head"><h3>Activité du pipeline</h3><Link href="/requests" className="link">Workflow <ChevronRight size={14} /></Link></div>
          <div className="list">
            {requests.slice(0, 4).map((r) => (
              <Link key={r.id} href="/requests" className="row-item">
                <div><div className="mono sm">{r.id}{r.fromAI && <span className="ai-tag"><Sparkles size={10} /> IA</span>}</div><div className="strongtxt">{r.part}</div></div>
                <span className="stage-mini">{STAGES[r.stage]}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
