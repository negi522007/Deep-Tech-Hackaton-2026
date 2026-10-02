"use client";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { STAGES, URGENCY } from "@/lib/data";
import { Pill } from "@/components/ui";

export function RequestsScreen() {
  const { requests, advance } = useStore();
  return (
    <div className="screen">
      <header className="screen-head"><div><p className="kicker">Approvisionnement</p><h1 className="display">Demandes de pièces</h1></div></header>
      <div className="col">
        {requests.map((r) => (
          <div key={r.id} className="card req reveal">
            <div className="req-top">
              <div><div className="mono sm muted">{r.id}{r.fromAI && <span className="ai-tag"><Sparkles size={10} /> IA</span>}</div><div className="req-part">{r.part}</div><div className="muted sm">{r.equipment}</div></div>
              <div className="req-right"><Pill label={URGENCY[r.urgency].l} color={URGENCY[r.urgency].c} />
                {r.stage < 6 && <button className="btn ghost sm" onClick={() => advance(r.id)}>Avancer <ArrowRight size={14} /></button>}
                {r.stage === 6 && <span className="done"><CheckCircle2 size={15} /> Clôturée</span>}
              </div>
            </div>
            <div className="timeline">
              {STAGES.map((s, i) => (
                <div key={s} className={"tl-node" + (i <= r.stage ? " active" : "") + (i === r.stage && r.stage < 6 ? " current" : "")}>
                  <div className="tl-dot" />{i < STAGES.length - 1 && <div className={"tl-line" + (i < r.stage ? " filled" : "")} />}
                  <span className="tl-label">{s}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
