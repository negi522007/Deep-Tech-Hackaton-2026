"use client";
import { useStore } from "@/lib/store";
import { STATUS } from "@/lib/data";
import { Pill } from "@/components/ui";
import type { EquipmentStatus } from "@/lib/types";

export function AdminScreen() {
  const { equipment, setStatus } = useStore();
  return (
    <div className="screen">
      <header className="screen-head"><div><p className="kicker">Administration</p><h1 className="display">Gestion du parc</h1></div></header>
      <div className="card reveal table-wrap">
        <table className="table">
          <thead><tr><th>ID</th><th>Équipement</th><th>Entreprise</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            {equipment.map((e) => (
              <tr key={e.id}>
                <td className="mono sm">{e.id}</td><td className="strongtxt">{e.name}</td><td className="muted">{e.company}</td>
                <td><Pill label={STATUS[e.status].l} color={STATUS[e.status].c} /></td>
                <td><select className="mini-select" value={e.status} onChange={(ev) => setStatus(e.id, ev.target.value as EquipmentStatus)}>{(Object.keys(STATUS) as EquipmentStatus[]).map((s) => <option key={s} value={s}>{STATUS[s].l}</option>)}</select></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
