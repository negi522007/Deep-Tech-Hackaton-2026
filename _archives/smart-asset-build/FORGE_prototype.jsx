import React, { useState, useRef, useMemo } from "react";
import {
  LayoutDashboard, Boxes, AlertTriangle, PackageSearch, Bell, Sun, Moon,
  ChevronRight, Plus, Cpu, Camera, Sparkles, X, ArrowRight, Check, Clock,
  Activity, TrendingUp, ShieldAlert, Wrench, ScanLine, Gauge
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Cell, LineChart, Line
} from "recharts";

/* ============================================================
   FORGE — Industrial Asset Intelligence
   Prototype complet, dual-thème, diagnostic IA réel.
   ============================================================ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');

.forge{ --font:'Hanken Grotesk',system-ui,sans-serif; --mono:'JetBrains Mono',monospace;
  --r-card:14px; --r-btn:9px; --r-pill:999px;
  /* THÈME CLAIR — Éditorial */
  --bg:#F4F1EA; --surface:#FFFFFF; --surface2:#FBFAF6; --void:#ECE8DE;
  --text:#14110E; --text2:#5A534A; --text3:#8A8278;
  --hair:rgba(20,17,14,.12); --strong:rgba(20,17,14,.55);
  --accent:#E1481A; --accent-h:#C73C13; --accent-glow:rgba(225,72,26,.16);
  --ok:#1A7F37; --warn:#9A6700; --danger:#C9302C; --info:#0969DA;
  --shadow:0 1px 2px rgba(20,17,14,.06),0 14px 30px rgba(20,17,14,.10);
  --inset:none;
  font-family:var(--font); color:var(--text); background:var(--bg);
  min-height:100vh; -webkit-font-smoothing:antialiased;
  transition:background-color .4s ease,color .4s ease;
}
.forge.dark{ --bg:#0E1013; --surface:#15181D; --surface2:#1C2026; --void:#08090B;
  --text:#F2F4F7; --text2:#9BA3AE; --text3:#5C6571;
  --hair:rgba(255,255,255,.08); --strong:rgba(255,255,255,.22);
  --accent:#FF6A1A; --accent-h:#FF7E3A; --accent-glow:rgba(255,106,26,.34);
  --ok:#3FB950; --warn:#D29922; --danger:#F85149; --info:#58A6FF;
  --shadow:0 1px 2px rgba(0,0,0,.4),0 10px 30px rgba(0,0,0,.30);
  --inset:inset 0 1px 0 rgba(255,255,255,.06);
}
.forge *{ box-sizing:border-box; }
.forge ::selection{ background:var(--accent); color:#fff; }
.forge button{ font-family:inherit; cursor:pointer; }
.forge .mono{ font-family:var(--mono); font-variant-numeric:tabular-nums; }

/* layout */
.shell{ display:grid; grid-template-columns:248px 1fr; min-height:100vh; }
.side{ border-right:1px solid var(--hair); padding:22px 16px; display:flex; flex-direction:column; gap:6px;
  position:sticky; top:0; height:100vh; background:var(--surface); }
.brand{ display:flex; align-items:center; gap:10px; padding:4px 8px 22px; }
.brand-mark{ width:30px; height:30px; border-radius:8px; background:var(--accent); display:grid; place-items:center; box-shadow:0 4px 14px var(--accent-glow); }
.brand-name{ font-weight:900; letter-spacing:.04em; font-size:18px; }
.brand-sub{ font-size:9.5px; letter-spacing:.22em; text-transform:uppercase; color:var(--text3); margin-top:-3px; }
.nav-item{ display:flex; align-items:center; gap:11px; padding:10px 12px; border-radius:10px; color:var(--text2);
  font-size:13.5px; font-weight:600; border:1px solid transparent; transition:all .2s cubic-bezier(.25,1,.5,1); background:none; width:100%; text-align:left; }
.nav-item:hover{ color:var(--text); background:var(--surface2); }
.nav-item.on{ color:var(--text); background:var(--surface2); border-color:var(--hair); }
.nav-item.on .nb{ opacity:1; }
.nb{ width:3px; height:16px; border-radius:2px; background:var(--accent); opacity:0; margin-left:auto; }

.main{ min-width:0; }
.topbar{ position:sticky; top:0; z-index:20; display:flex; align-items:center; justify-content:space-between;
  padding:16px 30px; border-bottom:1px solid var(--hair); background:color-mix(in srgb,var(--bg) 82%,transparent); backdrop-filter:blur(10px); }
.page{ padding:30px; max-width:1180px; }
.ptitle{ font-size:30px; font-weight:900; letter-spacing:-.02em; }
.psub{ color:var(--text2); font-size:14px; margin-top:3px; }

/* primitives */
.card{ background:var(--surface); border:1px solid var(--hair); border-radius:var(--r-card); box-shadow:var(--inset),var(--shadow); }
.btn{ display:inline-flex; align-items:center; justify-content:center; gap:8px; border:none; border-radius:var(--r-btn);
  padding:11px 16px; font-size:13.5px; font-weight:700; transition:all .2s cubic-bezier(.25,1,.5,1); }
.btn:active{ transform:scale(.98); }
.btn-primary{ background:var(--accent); color:#fff; }
.btn-primary:hover{ background:var(--accent-h); box-shadow:0 8px 24px var(--accent-glow); }
.btn-ghost{ background:transparent; border:1px solid var(--hair); color:var(--text); }
.btn-ghost:hover{ border-color:var(--strong); background:var(--surface2); }
.icon-btn{ width:40px; height:40px; border-radius:var(--r-btn); border:1px solid var(--hair); background:var(--surface);
  display:grid; place-items:center; color:var(--text2); transition:all .2s; position:relative; }
.icon-btn:hover{ color:var(--text); border-color:var(--strong); }
.pill{ display:inline-flex; align-items:center; gap:7px; padding:4px 10px; border-radius:var(--r-pill); font-size:11.5px; font-weight:700; }
.dot{ width:7px; height:7px; border-radius:50%; }
.label{ font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--text3); font-weight:700; }
.input{ width:100%; background:var(--surface2); border:1px solid var(--hair); border-radius:var(--r-btn);
  padding:11px 13px; color:var(--text); font-size:14px; font-family:inherit; outline:none; transition:all .2s; }
.input:focus{ border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-glow); }
textarea.input{ resize:vertical; min-height:88px; }

/* stat */
.stat-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
.stat{ padding:18px; }
.stat .v{ font-size:30px; font-weight:900; letter-spacing:-.02em; margin-top:6px; }
.stat .d{ font-size:12px; margin-top:4px; display:flex; align-items:center; gap:5px; }

/* equipment */
.eq-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(270px,1fr)); gap:16px; }
.eq{ padding:18px; cursor:pointer; transition:transform .35s cubic-bezier(.16,1,.3,1),border-color .25s; }
.eq:hover{ transform:translateY(-4px); border-color:var(--strong); }
.eq-id{ font-size:12px; color:var(--text3); }
.eq-name{ font-weight:800; font-size:16px; margin-top:2px; }
.eq-meta{ display:flex; gap:16px; margin-top:16px; }
.eq-meta .k{ font-size:9.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--text3); }
.eq-meta .val{ font-weight:800; font-size:15px; margin-top:2px; }

/* workflow timeline */
.flow{ display:flex; align-items:flex-start; gap:0; margin:8px 0; position:relative; }
.flow-step{ flex:1; display:flex; flex-direction:column; align-items:center; gap:9px; position:relative; }
.flow-line{ position:absolute; top:13px; left:50%; right:-50%; height:2px; background:var(--hair); z-index:0; }
.flow-line.done{ background:var(--accent); }
.flow-node{ width:28px; height:28px; border-radius:50%; display:grid; place-items:center; z-index:1;
  border:2px solid var(--hair); background:var(--surface); color:var(--text3); transition:all .5s cubic-bezier(.16,1,.3,1); }
.flow-node.done{ border-color:var(--accent); background:var(--accent); color:#fff; }
.flow-node.cur{ border-color:var(--accent); color:var(--accent); box-shadow:0 0 0 5px var(--accent-glow); animation:pulse 2s infinite; }
.flow-lbl{ font-size:10px; font-weight:700; color:var(--text3); text-align:center; }
.flow-lbl.act{ color:var(--text); }
@keyframes pulse{ 0%,100%{ box-shadow:0 0 0 5px var(--accent-glow);} 50%{ box-shadow:0 0 0 9px transparent;} }

/* req rows */
.row-item{ display:flex; align-items:center; gap:16px; padding:15px 18px; border-bottom:1px solid var(--hair); cursor:pointer; transition:background .2s; }
.row-item:last-child{ border-bottom:none; }
.row-item:hover{ background:var(--surface2); }

/* AI reveal */
.scan{ position:relative; border-radius:12px; overflow:hidden; border:1px solid var(--hair); }
.scan img{ display:block; width:100%; max-height:300px; object-fit:cover; }
.scan.busy::after{ content:""; position:absolute; inset:0; background:linear-gradient(120deg,transparent 30%,var(--accent-glow) 50%,transparent 70%);
  background-size:250% 100%; animation:sweep 1.3s linear infinite; }
@keyframes sweep{ 0%{background-position:120% 0;} 100%{background-position:-120% 0;} }
.diag{ animation:rise .7s cubic-bezier(.16,1,.3,1) both; }
.diag-2{ animation:rise .7s cubic-bezier(.16,1,.3,1) .08s both; }
.diag-3{ animation:rise .7s cubic-bezier(.16,1,.3,1) .16s both; }
@keyframes rise{ from{opacity:0; transform:translateY(20px); filter:blur(5px);} to{opacity:1; transform:none; filter:none;} }

/* hero */
.hero{ min-height:100vh; display:grid; place-items:center; position:relative; overflow:hidden; padding:24px; }
.hero-bg{ position:absolute; inset:0; background:
  radial-gradient(60% 50% at 80% 10%, var(--accent-glow), transparent 60%),
  radial-gradient(50% 40% at 10% 90%, var(--accent-glow), transparent 60%); }
.hero-in{ position:relative; text-align:center; max-width:760px; }
.hero h1{ font-size:clamp(40px,8vw,82px); font-weight:900; letter-spacing:-.03em; line-height:.98; }
.hero h1 em{ font-style:normal; color:var(--accent); }
.hero p{ color:var(--text2); font-size:clamp(15px,2vw,18px); margin:22px auto 30px; max-width:520px; line-height:1.55; }
.kicker{ display:inline-flex; align-items:center; gap:8px; padding:7px 14px; border:1px solid var(--hair); border-radius:999px;
  font-size:11px; letter-spacing:.16em; text-transform:uppercase; font-weight:700; color:var(--text2); margin-bottom:26px; }
.rise-1{ animation:rise .8s cubic-bezier(.16,1,.3,1) both; }
.rise-2{ animation:rise .8s cubic-bezier(.16,1,.3,1) .12s both; }
.rise-3{ animation:rise .8s cubic-bezier(.16,1,.3,1) .24s both; }
.rise-4{ animation:rise .8s cubic-bezier(.16,1,.3,1) .36s both; }

/* misc */
.fade{ animation:rise .5s cubic-bezier(.16,1,.3,1) both; }
.overlay{ position:fixed; inset:0; background:rgba(0,0,0,.45); backdrop-filter:blur(4px); z-index:50; display:grid; place-items:center; padding:20px; animation:fadein .25s; }
@keyframes fadein{ from{opacity:0;} to{opacity:1;} }
.modal{ width:100%; max-width:560px; max-height:90vh; overflow:auto; animation:rise .4s cubic-bezier(.16,1,.3,1); }
.toast{ position:fixed; bottom:22px; right:22px; z-index:60; }

@media (max-width:840px){
  .shell{ grid-template-columns:1fr; }
  .side{ position:relative; height:auto; flex-direction:row; overflow-x:auto; border-right:none; border-bottom:1px solid var(--hair); }
  .brand{ display:none; }
  .nb{ display:none; }
  .stat-grid{ grid-template-columns:repeat(2,1fr); }
  .flow-lbl{ display:none; }
}
@media (prefers-reduced-motion:reduce){ .forge *{ animation:none!important; transition:none!important; } }
`;

/* ---------- données seed (modèle = SQL de la Bible) ---------- */
const ORG = "Cimenterie de Diamniadio";
const STAGES = [
  { k: "submitted", l: "Soumis" }, { k: "analysis", l: "Analyse" },
  { k: "inspection", l: "Inspection" }, { k: "validation", l: "Validation" },
  { k: "sourcing", l: "Sourcing" }, { k: "delivery", l: "Livraison" },
  { k: "closed", l: "Clôture" },
];
const STATUS = {
  operational: { l: "Opérationnel", c: "var(--ok)" },
  degraded: { l: "Dégradé", c: "var(--warn)" },
  down: { l: "En panne", c: "var(--danger)" },
  maintenance: { l: "Maintenance", c: "var(--info)" },
};
const SEV = { low: { l: "Faible", c: "var(--info)" }, medium: { l: "Moyenne", c: "var(--warn)" }, high: { l: "Haute", c: "var(--danger)" }, critical: { l: "Critique", c: "var(--danger)" } };

const seedEquipment = [
  { id: "EQ-001", name: "Compresseur AX-200", model: "Atlas GA-37", manufacturer: "Atlas Copco", serial: "AC37-99812", cat: "Air comprimé", status: "down", failures: 7, uptime: 94 },
  { id: "EQ-002", name: "Convoyeur CV-12", model: "BeltMax 1200", manufacturer: "Sénégal Métal", serial: "BM12-44021", cat: "Manutention", status: "operational", failures: 2, uptime: 99 },
  { id: "EQ-003", name: "Pompe centrifuge PC-7", model: "Grundfos NB-65", manufacturer: "Grundfos", serial: "GF65-10239", cat: "Hydraulique", status: "degraded", failures: 4, uptime: 97 },
  { id: "EQ-004", name: "Moteur broyeur MT-450", model: "Siemens 1LE1", manufacturer: "Siemens", serial: "SM45-77310", cat: "Entraînement", status: "operational", failures: 1, uptime: 99 },
  { id: "EQ-005", name: "Groupe électrogène GE-90", model: "Cat C9", manufacturer: "Caterpillar", serial: "CT09-55120", cat: "Énergie", status: "maintenance", failures: 3, uptime: 96 },
  { id: "EQ-006", name: "Concasseur CC-3", model: "Metso C106", manufacturer: "Metso", serial: "MT06-88401", cat: "Concassage", status: "operational", failures: 5, uptime: 95 },
];
const seedRequests = [
  { id: "PR-118", eq: "EQ-001", part: "Roulement SKF 6205-2RS", urgency: "high", status: "sourcing", fromAI: true,
    events: [["—", "submitted", "il y a 2j"], ["submitted", "analysis", "il y a 2j"], ["analysis", "inspection", "il y a 1j"], ["inspection", "validation", "il y a 22h"], ["validation", "sourcing", "il y a 6h"]] },
  { id: "PR-117", eq: "EQ-003", part: "Joint mécanique 65mm", urgency: "medium", status: "validation", fromAI: false,
    events: [["—", "submitted", "il y a 3j"], ["submitted", "analysis", "il y a 3j"], ["analysis", "inspection", "il y a 2j"], ["inspection", "validation", "il y a 1j"]] },
  { id: "PR-115", eq: "EQ-005", part: "Filtre à carburant Cat 1R-0750", urgency: "low", status: "closed", fromAI: false,
    events: [["—", "submitted", "il y a 6j"], ["submitted", "analysis", "il y a 6j"], ["analysis", "inspection", "il y a 5j"], ["inspection", "validation", "il y a 4j"], ["validation", "sourcing", "il y a 3j"], ["sourcing", "delivery", "il y a 2j"], ["delivery", "closed", "il y a 1j"]] },
];
const seedNotifs = [
  { id: 1, t: "PR-118 est passée à Sourcing", time: "il y a 6h", read: false },
  { id: 2, t: "Nouvelle panne critique — Compresseur AX-200", time: "il y a 2j", read: false },
  { id: 3, t: "PR-115 livrée et clôturée", time: "il y a 1j", read: true },
];

export default function App() {
  const [theme, setTheme] = useState("dark");
  const [entered, setEntered] = useState(false);
  const [view, setView] = useState("dashboard");
  const [equipment] = useState(seedEquipment);
  const [requests, setRequests] = useState(seedRequests);
  const [notifs, setNotifs] = useState(seedNotifs);
  const [selectedEq, setSelectedEq] = useState(null);
  const [selectedReq, setSelectedReq] = useState(null);
  const [toast, setToast] = useState(null);

  const palette = theme === "dark"
    ? { grid: "rgba(255,255,255,.07)", axis: "#9BA3AE", accent: "#FF6A1A", bar: "#FF6A1A", bar2: "#3a3f48" }
    : { grid: "rgba(20,17,14,.10)", axis: "#5A534A", accent: "#E1481A", bar: "#E1481A", bar2: "#d9d3c6" };

  function notify(msg) { setToast(msg); setTimeout(() => setToast(null), 2600); }
  function advance(reqId) {
    setRequests(rs => rs.map(r => {
      if (r.id !== reqId) return r;
      const i = STAGES.findIndex(s => s.k === r.status);
      if (i >= STAGES.length - 1) return r;
      const next = STAGES[i + 1];
      const ev = [...r.events, [r.status, next.k, "à l'instant"]];
      return { ...r, status: next.k, events: ev };
    }));
    const r = requests.find(x => x.id === reqId);
    const i = STAGES.findIndex(s => s.k === r.status);
    if (i < STAGES.length - 1) {
      const nl = STAGES[i + 1].l;
      setNotifs(n => [{ id: Date.now(), t: `${reqId} est passée à ${nl}`, time: "à l'instant", read: false }, ...n]);
      notify(`${reqId} → ${nl}`);
      setSelectedReq(sr => sr && sr.id === reqId ? { ...sr, status: STAGES[i + 1].k, events: [...sr.events, [sr.status, STAGES[i + 1].k, "à l'instant"]] } : sr);
    }
  }

  return (
    <div className={`forge ${theme}`}>
      <style>{CSS}</style>
      {!entered ? (
        <Hero theme={theme} setTheme={setTheme} onEnter={() => setEntered(true)} />
      ) : (
        <div className="shell">
          <Sidebar view={view} setView={(v) => { setView(v); setSelectedEq(null); setSelectedReq(null); }} unread={notifs.filter(n => !n.read).length} />
          <div className="main">
            <Topbar view={view} theme={theme} setTheme={setTheme} />
            <div className="page" key={view}>
              {view === "dashboard" && <Dashboard equipment={equipment} requests={requests} palette={palette} />}
              {view === "equipment" && (selectedEq
                ? <EquipmentDetail eq={selectedEq} back={() => setSelectedEq(null)} />
                : <Equipment equipment={equipment} open={setSelectedEq} />)}
              {view === "declare" && <Declare equipment={equipment} onCreated={(eqName, part) => { notify(`Diagnostic enregistré · pièce pré-remplie`); }} setRequests={setRequests} notify={notify} setNotifs={setNotifs} />}
              {view === "requests" && (selectedReq
                ? <RequestDetail req={selectedReq} equipment={equipment} advance={advance} back={() => setSelectedReq(null)} />
                : <Requests requests={requests} equipment={equipment} open={setSelectedReq} />)}
              {view === "notifs" && <Notifs notifs={notifs} markAll={() => setNotifs(n => n.map(x => ({ ...x, read: true })))} />}
            </div>
          </div>
        </div>
      )}
      {toast && <div className="toast"><div className="card fade" style={{ padding: "13px 18px", display: "flex", gap: 10, alignItems: "center" }}><Check size={16} color="var(--accent)" /><span style={{ fontSize: 13.5, fontWeight: 600 }}>{toast}</span></div></div>}
    </div>
  );
}

/* ---------- Hero ---------- */
function Hero({ theme, setTheme, onEnter }) {
  return (
    <div className="hero">
      <div className="hero-bg" />
      <button className="icon-btn" style={{ position: "absolute", top: 22, right: 22 }} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
        {theme === "dark" ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
      </button>
      <div className="hero-in">
        <div className="kicker rise-1"><Cpu size={13} /> Industrial Asset Intelligence</div>
        <h1 className="rise-2">Chaque panne<br />devient une <em>donnée</em>.</h1>
        <p className="rise-3">FORGE transforme une simple photo en diagnostic, en pièce commandée, et en intelligence qui anticipe la prochaine défaillance. Pensé pour l'industrie des économies émergentes.</p>
        <div className="rise-4" style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button className="btn btn-primary" onClick={onEnter}>Entrer dans la plateforme <ArrowRight size={16} /></button>
          <button className="btn btn-ghost" onClick={onEnter}>Voir la démo</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Sidebar ---------- */
function Sidebar({ view, setView, unread }) {
  const items = [
    ["dashboard", "Tableau de bord", LayoutDashboard],
    ["equipment", "Équipements", Boxes],
    ["declare", "Déclarer une panne", AlertTriangle],
    ["requests", "Demandes de pièces", PackageSearch],
    ["notifs", "Notifications", Bell],
  ];
  return (
    <aside className="side">
      <div className="brand">
        <div className="brand-mark"><Wrench size={17} color="#fff" /></div>
        <div><div className="brand-name">FORGE</div><div className="brand-sub">{ORG}</div></div>
      </div>
      {items.map(([k, l, Icon]) => (
        <button key={k} className={`nav-item ${view === k ? "on" : ""}`} onClick={() => setView(k)}>
          <Icon size={17} strokeWidth={1.7} /> {l}
          {k === "notifs" && unread > 0 && <span className="pill" style={{ marginLeft: "auto", background: "var(--accent)", color: "#fff", padding: "1px 7px", fontSize: 10 }}>{unread}</span>}
          <span className="nb" />
        </button>
      ))}
    </aside>
  );
}

/* ---------- Topbar ---------- */
function Topbar({ view, theme, setTheme }) {
  const titles = { dashboard: "Vue d'ensemble", equipment: "Parc d'équipements", declare: "Déclaration de panne", requests: "Suivi des demandes", notifs: "Centre de notifications" };
  return (
    <div className="topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 9, color: "var(--text2)", fontSize: 13 }}>
        <Activity size={15} color="var(--accent)" /> {titles[view]}
      </div>
      <button className="icon-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Thème">
        {theme === "dark" ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
      </button>
    </div>
  );
}

/* ---------- Dashboard ---------- */
function Dashboard({ equipment, requests, palette }) {
  const down = equipment.filter(e => e.status === "down").length;
  const open = requests.filter(r => r.status !== "closed").length;
  const avgUp = Math.round(equipment.reduce((a, e) => a + e.uptime, 0) / equipment.length);
  const topFail = [...equipment].sort((a, b) => b.failures - a.failures).slice(0, 6).map(e => ({ name: e.name.split(" ").slice(-1)[0], v: e.failures }));
  const stageTime = [
    { name: "Analyse", h: 6 }, { name: "Inspect.", h: 14 }, { name: "Valid.", h: 9 },
    { name: "Sourcing", h: 58 }, { name: "Livraison", h: 31 }, { name: "Clôture", h: 4 },
  ];
  const stats = [
    ["Équipements", equipment.length, "actifs suivis", Boxes, "var(--info)"],
    ["En panne", down, "intervention requise", ShieldAlert, "var(--danger)"],
    ["Demandes ouvertes", open, "dans le pipeline", PackageSearch, "var(--warn)"],
    ["Disponibilité", avgUp + "%", "moyenne du parc", Gauge, "var(--ok)"],
  ];
  return (
    <div className="fade">
      <h1 className="ptitle">Vue d'ensemble</h1>
      <p className="psub">{ORG} · état du parc en temps réel</p>
      <div className="stat-grid" style={{ marginTop: 24 }}>
        {stats.map(([l, v, d, Icon, c], i) => (
          <div key={i} className="card stat">
            <div style={{ display: "flex", justifyContent: "space-between" }}><span className="label">{l}</span><Icon size={16} color={c} /></div>
            <div className="v mono">{v}</div><div className="d" style={{ color: "var(--text3)" }}>{d}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <span className="label">Machines les plus en panne</span>
          <div style={{ height: 220, marginTop: 14 }}>
            <ResponsiveContainer><BarChart data={topFail}>
              <CartesianGrid vertical={false} stroke={palette.grid} />
              <XAxis dataKey="name" stroke={palette.axis} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke={palette.axis} fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: palette.grid }} contentStyle={{ background: "var(--surface2)", border: "1px solid var(--hair)", borderRadius: 10, color: "var(--text)" }} />
              <Bar dataKey="v" radius={[6, 6, 0, 0]}>{topFail.map((e, i) => <Cell key={i} fill={i === 0 ? palette.accent : palette.bar2} />)}</Bar>
            </BarChart></ResponsiveContainer>
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <span className="label">Temps moyen par étape (h) — où le délai se bloque</span>
          <div style={{ height: 220, marginTop: 14 }}>
            <ResponsiveContainer><BarChart data={stageTime} layout="vertical">
              <CartesianGrid horizontal={false} stroke={palette.grid} />
              <XAxis type="number" stroke={palette.axis} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" stroke={palette.axis} fontSize={11} width={64} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: palette.grid }} contentStyle={{ background: "var(--surface2)", border: "1px solid var(--hair)", borderRadius: 10, color: "var(--text)" }} />
              <Bar dataKey="h" radius={[0, 6, 6, 0]}>{stageTime.map((e, i) => <Cell key={i} fill={e.h > 40 ? palette.accent : palette.bar2} />)}</Bar>
            </BarChart></ResponsiveContainer>
          </div>
          <p style={{ fontSize: 12, color: "var(--text2)", marginTop: 8 }}>Le <strong style={{ color: "var(--accent)" }}>sourcing</strong> est le goulot — l'enjeu n°1 des économies émergentes.</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Equipment ---------- */
function Equipment({ equipment, open }) {
  return (
    <div className="fade">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div><h1 className="ptitle">Équipements</h1><p className="psub">{equipment.length} actifs · {ORG}</p></div>
        <button className="btn btn-ghost"><Plus size={16} /> Ajouter</button>
      </div>
      <div className="eq-grid" style={{ marginTop: 24 }}>
        {equipment.map(e => (
          <div key={e.id} className="card eq" onClick={() => open(e)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div><div className="eq-id mono">{e.id}</div><div className="eq-name">{e.name}</div></div>
              <StatusPill s={e.status} />
            </div>
            <div className="eq-meta">
              <div><div className="k">Pannes</div><div className="val mono">{String(e.failures).padStart(2, "0")}</div></div>
              <div><div className="k">Dispo.</div><div className="val mono">{e.uptime}%</div></div>
              <div><div className="k">Catégorie</div><div className="val" style={{ fontSize: 13 }}>{e.cat}</div></div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 16, color: "var(--accent)", fontSize: 12.5, fontWeight: 700 }}>Voir le profil <ChevronRight size={14} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
function EquipmentDetail({ eq, back }) {
  const hist = [
    ["Panne", "Roulement principal — gravité haute", "il y a 2h", "var(--danger)"],
    ["Maintenance", "Graissage + contrôle vibratoire", "il y a 12j", "var(--info)"],
    ["Panne", "Surchauffe détectée", "il y a 1 mois", "var(--warn)"],
    ["Maintenance", "Remplacement courroie", "il y a 2 mois", "var(--ok)"],
  ];
  return (
    <div className="fade">
      <button className="btn btn-ghost" onClick={back} style={{ marginBottom: 18 }}>← Retour</button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div><div className="mono" style={{ color: "var(--text3)", fontSize: 13 }}>{eq.id}</div>
          <h1 className="ptitle">{eq.name}</h1><p className="psub">{eq.manufacturer} · {eq.cat}</p></div>
        <StatusPill s={eq.status} big />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16, marginTop: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <span className="label">Fiche technique</span>
          {[["Modèle", eq.model], ["Fabricant", eq.manufacturer], ["N° de série", eq.serial], ["Catégorie", eq.cat], ["Disponibilité", eq.uptime + "%"], ["Pannes totales", eq.failures]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid var(--hair)" }}>
              <span style={{ color: "var(--text2)", fontSize: 13 }}>{k}</span><span className="mono" style={{ fontWeight: 700, fontSize: 13 }}>{v}</span>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: 20 }}>
          <span className="label">Historique</span>
          <div style={{ marginTop: 14 }}>
            {hist.map(([t, d, time, c], i) => (
              <div key={i} style={{ display: "flex", gap: 13, padding: "12px 0", borderBottom: i < hist.length - 1 ? "1px solid var(--hair)" : "none" }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: c, marginTop: 5, flexShrink: 0 }} />
                <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13.5 }}>{d}</div><div style={{ color: "var(--text3)", fontSize: 12, marginTop: 2 }}>{t}</div></div>
                <div className="mono" style={{ color: "var(--text3)", fontSize: 12 }}>{time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Declare (AI) ---------- */
function Declare({ equipment, setRequests, notify, setNotifs }) {
  const [eqId, setEqId] = useState(equipment[0].id);
  const [desc, setDesc] = useState("");
  const [sev, setSev] = useState("high");
  const [img, setImg] = useState(null);
  const [b64, setB64] = useState(null);
  const [busy, setBusy] = useState(false);
  const [diag, setDiag] = useState(null);
  const [err, setErr] = useState(null);
  const fileRef = useRef();

  function onFile(e) {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { setImg(reader.result); setB64({ data: String(reader.result).split(",")[1], type: f.type }); setDiag(null); };
    reader.readAsDataURL(f);
  }

  async function diagnose() {
    setBusy(true); setErr(null); setDiag(null);
    const prompt = `Tu es un expert en maintenance industrielle. Analyse cette image d'une pièce ou machine potentiellement défaillante. Réponds UNIQUEMENT avec un objet JSON strict, sans texte autour, sans balises markdown, au format:
{"defect_label":"...","failure_category":"...","severity":"low|medium|high|critical","confidence":0.0,"recommended_part":"...","reasoning_brief":"1 à 2 phrases en français"}`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          messages: [{ role: "user", content: [
            ...(b64 ? [{ type: "image", source: { type: "base64", media_type: b64.type, data: b64.data } }] : []),
            { type: "text", text: prompt + (b64 ? "" : "\n(Aucune image fournie — produis un exemple réaliste de roulement usé.)") },
          ] }],
        }),
      });
      const data = await res.json();
      const txt = (data.content || []).map(c => c.text || "").join("");
      const clean = txt.replace(/```json|```/g, "").trim();
      setDiag(JSON.parse(clean));
    } catch (e) {
      // filet de sécurité démo — ne casse jamais
      setDiag({ defect_label: "Usure avancée du roulement", failure_category: "Roulement / paliers", severity: "high", confidence: 0.88, recommended_part: "Roulement SKF 6205-2RS", reasoning_brief: "Traces d'écaillage et jeu radial visibles sur la bague, signe d'une fatigue mécanique avancée." });
      setErr("Mode hors-ligne — diagnostic d'exemple.");
    }
    setBusy(false);
  }

  function createRequest() {
    const id = "PR-" + Math.floor(120 + Math.random() * 60);
    setRequests(rs => [{ id, eq: eqId, part: diag.recommended_part, urgency: sev === "critical" ? "high" : sev, status: "submitted", fromAI: true, events: [["—", "submitted", "à l'instant"]] }, ...rs]);
    setNotifs(n => [{ id: Date.now(), t: `${id} créée depuis un diagnostic IA`, time: "à l'instant", read: false }, ...n]);
    notify(`${id} créée · ${diag.recommended_part}`);
    setDiag(null); setImg(null); setB64(null); setDesc("");
  }

  return (
    <div className="fade">
      <h1 className="ptitle">Déclarer une panne</h1>
      <p className="psub">Capture guidée + diagnostic visuel par IA</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }}>
        <div className="card" style={{ padding: 22 }}>
          <span className="label">1 · Équipement concerné</span>
          <select className="input mono" style={{ marginTop: 8 }} value={eqId} onChange={e => setEqId(e.target.value)}>
            {equipment.map(e => <option key={e.id} value={e.id}>{e.id} — {e.name}</option>)}
          </select>
          <span className="label" style={{ display: "block", marginTop: 18 }}>2 · Gravité</span>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            {Object.entries(SEV).map(([k, v]) => (
              <button key={k} className="btn" onClick={() => setSev(k)} style={{ flex: 1, padding: "9px 0", background: sev === k ? "var(--accent)" : "var(--surface2)", color: sev === k ? "#fff" : "var(--text2)", border: "1px solid var(--hair)" }}>{v.l}</button>
            ))}
          </div>
          <span className="label" style={{ display: "block", marginTop: 18 }}>3 · Description</span>
          <textarea className="input" style={{ marginTop: 8 }} placeholder="Bruit anormal, surchauffe, vibration…" value={desc} onChange={e => setDesc(e.target.value)} />
        </div>

        <div className="card" style={{ padding: 22 }}>
          <span className="label">4 · Preuve visuelle (obligatoire)</span>
          <div className={`scan ${busy ? "busy" : ""}`} style={{ marginTop: 10, minHeight: 170, display: "grid", placeItems: "center", background: "var(--surface2)", cursor: "pointer" }} onClick={() => fileRef.current?.click()}>
            {img ? <img src={img} alt="pièce" /> : <div style={{ textAlign: "center", color: "var(--text3)", padding: 30 }}><Camera size={28} /><div style={{ marginTop: 8, fontSize: 13 }}>Prendre / charger une photo</div></div>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onFile} style={{ display: "none" }} />
          <button className="btn btn-primary" style={{ width: "100%", marginTop: 12 }} onClick={diagnose} disabled={busy}>
            {busy ? <><ScanLine size={16} /> Analyse en cours…</> : <><Sparkles size={16} /> Diagnostiquer avec l'IA</>}
          </button>

          {diag && (
            <div style={{ marginTop: 16, borderTop: "1px solid var(--hair)", paddingTop: 16 }}>
              <div className="diag" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="label" style={{ color: "var(--accent)" }}>Diagnostic IA</span>
                <span className="pill" style={{ background: "color-mix(in srgb,var(--accent) 14%,transparent)", color: "var(--accent)" }}>{Math.round((diag.confidence || 0) * 100)}% confiance</span>
              </div>
              <div className="diag" style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-.02em", marginTop: 10 }}>{diag.defect_label}</div>
              <div className="diag-2" style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <span className="pill" style={{ background: "var(--surface2)", color: "var(--text2)" }}>{diag.failure_category}</span>
                <SevPill s={diag.severity} />
              </div>
              <p className="diag-2" style={{ color: "var(--text2)", fontSize: 13, marginTop: 12, lineHeight: 1.5 }}>{diag.reasoning_brief}</p>
              <div className="diag-3 card" style={{ background: "var(--surface2)", padding: 14, marginTop: 14, display: "flex", alignItems: "center", gap: 12 }}>
                <PackageSearch size={20} color="var(--accent)" />
                <div style={{ flex: 1 }}><div className="label">Pièce recommandée</div><div className="mono" style={{ fontWeight: 700, marginTop: 2 }}>{diag.recommended_part}</div></div>
              </div>
              <button className="btn btn-primary diag-3" style={{ width: "100%", marginTop: 12 }} onClick={createRequest}>Créer la demande de pièce <ArrowRight size={16} /></button>
              {err && <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 8, textAlign: "center" }}>{err}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Requests ---------- */
function Requests({ requests, equipment, open }) {
  const eqName = id => equipment.find(e => e.id === id)?.name || id;
  return (
    <div className="fade">
      <h1 className="ptitle">Demandes de pièces</h1>
      <p className="psub">{requests.filter(r => r.status !== "closed").length} en cours · {requests.length} au total</p>
      <div className="card" style={{ marginTop: 24, overflow: "hidden" }}>
        {requests.map(r => {
          const stg = STAGES.find(s => s.k === r.status);
          return (
            <div key={r.id} className="row-item" onClick={() => open(r)}>
              <span className="mono" style={{ fontWeight: 700, fontSize: 13, width: 64 }}>{r.id}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>{r.part}{r.fromAI && <Sparkles size={13} color="var(--accent)" />}</div>
                <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 2 }}>{eqName(r.eq)}</div>
              </div>
              <UrgencyPill u={r.urgency} />
              <span className="pill" style={{ background: r.status === "closed" ? "color-mix(in srgb,var(--ok) 14%,transparent)" : "color-mix(in srgb,var(--accent) 14%,transparent)", color: r.status === "closed" ? "var(--ok)" : "var(--accent)" }}>{stg?.l}</span>
              <ChevronRight size={16} color="var(--text3)" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
function RequestDetail({ req, equipment, advance, back }) {
  const eq = equipment.find(e => e.id === req.eq);
  const ci = STAGES.findIndex(s => s.k === req.status);
  const done = req.status === "closed";
  return (
    <div className="fade">
      <button className="btn btn-ghost" onClick={back} style={{ marginBottom: 18 }}>← Retour</button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div><div className="mono" style={{ color: "var(--text3)", fontSize: 13 }}>{req.id}</div>
          <h1 className="ptitle" style={{ display: "flex", alignItems: "center", gap: 10 }}>{req.part} {req.fromAI && <Sparkles size={20} color="var(--accent)" />}</h1>
          <p className="psub">{eq?.name} · {eq?.id}</p></div>
        {!done && <button className="btn btn-primary" onClick={() => advance(req.id)}>Faire avancer <ArrowRight size={16} /></button>}
      </div>

      <div className="card" style={{ padding: "28px 24px", marginTop: 24 }}>
        <span className="label">Workflow de suivi</span>
        <div className="flow" style={{ marginTop: 22 }}>
          {STAGES.map((s, i) => (
            <div key={s.k} className="flow-step">
              {i < STAGES.length - 1 && <div className={`flow-line ${i < ci ? "done" : ""}`} />}
              <div className={`flow-node ${i < ci ? "done" : ""} ${i === ci && !done ? "cur" : ""} ${i === ci && done ? "done" : ""}`}>
                {i < ci || done ? <Check size={14} /> : i === ci ? <Clock size={13} /> : i + 1}
              </div>
              <div className={`flow-lbl ${i <= ci ? "act" : ""}`}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 20, marginTop: 16 }}>
        <span className="label">Journal d'événements (audit log)</span>
        <div style={{ marginTop: 14 }}>
          {[...req.events].reverse().map((ev, i) => {
            const to = STAGES.find(s => s.k === ev[1]);
            return (
              <div key={i} style={{ display: "flex", gap: 13, padding: "11px 0", borderBottom: i < req.events.length - 1 ? "1px solid var(--hair)" : "none" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: i === 0 ? "var(--accent)" : "var(--text3)", marginTop: 6, flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>Passage à <strong>{to?.l}</strong></div>
                <div className="mono" style={{ color: "var(--text3)", fontSize: 12 }}>{ev[2]}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------- Notifs ---------- */
function Notifs({ notifs, markAll }) {
  return (
    <div className="fade">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div><h1 className="ptitle">Notifications</h1><p className="psub">{notifs.filter(n => !n.read).length} non lues</p></div>
        <button className="btn btn-ghost" onClick={markAll}>Tout marquer lu</button>
      </div>
      <div className="card" style={{ marginTop: 24, overflow: "hidden" }}>
        {notifs.map(n => (
          <div key={n.id} className="row-item" style={{ cursor: "default" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.read ? "var(--text3)" : "var(--accent)", flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: 14, fontWeight: n.read ? 500 : 700, color: n.read ? "var(--text2)" : "var(--text)" }}>{n.t}</div>
            <div className="mono" style={{ color: "var(--text3)", fontSize: 12 }}>{n.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- pills ---------- */
function StatusPill({ s, big }) {
  const o = STATUS[s];
  return <span className="pill" style={{ background: `color-mix(in srgb,${o.c} 14%,transparent)`, color: o.c, fontSize: big ? 13 : 11.5, padding: big ? "6px 13px" : "4px 10px" }}><span className="dot" style={{ background: o.c }} />{o.l}</span>;
}
function SevPill({ s }) {
  const o = SEV[s] || SEV.medium;
  return <span className="pill" style={{ background: `color-mix(in srgb,${o.c} 14%,transparent)`, color: o.c }}><span className="dot" style={{ background: o.c }} />Gravité {o.l.toLowerCase()}</span>;
}
function UrgencyPill({ u }) {
  const map = { low: ["Basse", "var(--info)"], medium: ["Moyenne", "var(--warn)"], high: ["Urgente", "var(--danger)"] };
  const [l, c] = map[u] || map.medium;
  return <span className="pill" style={{ background: "var(--surface2)", color: c, border: "1px solid var(--hair)" }}>{l}</span>;
}
