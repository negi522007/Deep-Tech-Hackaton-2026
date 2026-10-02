"use client";
import { useMemo, useState, useEffect } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Cell } from "recharts";
import { Activity } from "lucide-react";
import { useStore } from "@/lib/store";
import { STAGES, PARTS } from "@/lib/data";

type Colors = { surface: string; hair: string; muted: string; text: string; accent: string; danger: string };
const DARK: Colors = { surface: "#15181D", hair: "rgba(255,255,255,0.08)", muted: "#7A828D", text: "#F2F4F7", accent: "#FF6A1A", danger: "#F85149" };

function readColors(): Colors {
  if (typeof window === "undefined") return DARK;
  const s = getComputedStyle(document.body);
  const g = (v: string, f: string) => s.getPropertyValue(v).trim() || f;
  return {
    surface: g("--surface-1", DARK.surface), hair: g("--hair", DARK.hair), muted: g("--muted", DARK.muted),
    text: g("--text", DARK.text), accent: g("--accent", DARK.accent), danger: g("--danger", DARK.danger),
  };
}
function useThemeColors(): Colors {
  const [c, setC] = useState<Colors>(DARK);
  useEffect(() => {
    const update = () => setC(readColors());
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return c;
}

export function AnalyticsScreen() {
  const { equipment, requests } = useStore();
  const colors = useThemeColors();

  const topFailing = useMemo(() => [...equipment].sort((a, b) => b.failures - a.failures).slice(0, 5).map((e) => ({ name: e.name.split(" ").slice(-1)[0], v: e.failures })), [equipment]);
  const partsDemand = useMemo(() => {
    const m: Record<string, number> = {};
    requests.forEach((r) => { m[r.part] = (m[r.part] || 0) + 1; });
    PARTS.forEach((p, i) => { m[p] = (m[p] || 0) + ((i * 2) % 4) + 1; });
    return Object.entries(m).slice(0, 5).map(([k, v]) => ({ name: k.split(" ").slice(0, 2).join(" "), v }));
  }, [requests]);
  const stageTime = STAGES.slice(0, 6).map((s, i) => ({ name: s, v: [4, 11, 9, 6, 38, 14][i] }));
  const trend = [{ m: "Jan", v: 9 }, { m: "Fév", v: 12 }, { m: "Mar", v: 8 }, { m: "Avr", v: 15 }, { m: "Mai", v: 11 }, { m: "Juin", v: 7 }];
  const tip = { background: colors.surface, border: `1px solid ${colors.hair}`, borderRadius: 8, color: colors.text, fontSize: 12 };

  return (
    <div className="screen">
      <header className="screen-head"><div><p className="kicker">Intelligence des données</p><h1 className="display">Analytique</h1></div></header>
      <div className="grid-2">
        <div className="card reveal"><div className="card-head"><h3>Machines les plus en panne</h3></div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topFailing}><CartesianGrid stroke={colors.hair} vertical={false} /><XAxis dataKey="name" stroke={colors.muted} fontSize={11} /><YAxis stroke={colors.muted} fontSize={11} /><Tooltip contentStyle={tip} cursor={{ fill: colors.hair }} /><Bar dataKey="v" radius={[5, 5, 0, 0]} fill={colors.accent} /></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card reveal"><div className="card-head"><h3>Pièces les plus demandées</h3></div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={partsDemand} layout="vertical"><CartesianGrid stroke={colors.hair} horizontal={false} /><XAxis type="number" stroke={colors.muted} fontSize={11} /><YAxis type="category" dataKey="name" width={90} stroke={colors.muted} fontSize={10} /><Tooltip contentStyle={tip} cursor={{ fill: colors.hair }} /><Bar dataKey="v" radius={[0, 5, 5, 0]} fill={colors.accent} /></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card reveal hl"><div className="card-head"><h3>Temps moyen par étape <span className="muted sm">(heures · goulot d&apos;appro.)</span></h3></div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stageTime}><CartesianGrid stroke={colors.hair} vertical={false} /><XAxis dataKey="name" stroke={colors.muted} fontSize={10} /><YAxis stroke={colors.muted} fontSize={11} /><Tooltip contentStyle={tip} cursor={{ fill: colors.hair }} /><Bar dataKey="v" radius={[5, 5, 0, 0]}>{stageTime.map((s, i) => <Cell key={i} fill={s.v > 25 ? colors.danger : colors.accent} />)}</Bar></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card reveal"><div className="card-head"><h3>Tendance des pannes</h3></div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend}><CartesianGrid stroke={colors.hair} vertical={false} /><XAxis dataKey="m" stroke={colors.muted} fontSize={11} /><YAxis stroke={colors.muted} fontSize={11} /><Tooltip contentStyle={tip} /><Line type="monotone" dataKey="v" stroke={colors.accent} strokeWidth={2.5} dot={{ r: 3, fill: colors.accent }} /></LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card flywheel reveal"><Activity size={18} style={{ color: "var(--accent)" }} /><p>Chaque diagnostic enrichit ce jeu de données structuré. <strong>Demain, la prédiction.</strong></p></div>
    </div>
  );
}
