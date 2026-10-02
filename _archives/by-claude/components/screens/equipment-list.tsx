"use client";
import Link from "next/link";
import { Search, Cpu } from "lucide-react";
import { useStore } from "@/lib/store";
import { STATUS } from "@/lib/data";
import { Pill } from "@/components/ui";

export function EquipmentListScreen() {
  const { equipment } = useStore();
  return (
    <div className="screen">
      <header className="screen-head">
        <div><p className="kicker">Parc machines</p><h1 className="display">Équipements</h1></div>
        <div className="search"><Search size={15} className="muted" /><input placeholder="Rechercher…" /></div>
      </header>
      <div className="grid-3">
        {equipment.map((e) => (
          <Link key={e.id} href={`/equipment/${e.id}`} className="card eq-card reveal">
            <div className="eq-thumb"><Cpu size={26} /></div>
            <div className="row between"><span className="mono sm muted">{e.id}</span><Pill label={STATUS[e.status].l} color={STATUS[e.status].c} /></div>
            <div className="eq-name">{e.name}</div>
            <div className="muted sm">{e.manufacturer} · {e.category}</div>
            <div className="eq-foot mono sm"><span>{e.failures} pannes</span><span>{e.uptime}% dispo.</span></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
