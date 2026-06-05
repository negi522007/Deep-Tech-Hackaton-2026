# AssetIQ — Smart Industrial Asset Intelligence & Spare Parts Innovation

PWA de maintenance industrielle : gestion des équipements, signalement de pannes
avec **capture photo guidée**, **diagnostic IA**, gestion des pièces de rechange,
**workflow de réparation en 7 étapes** et **dashboards analytiques**.

> Stack : **Next.js 14 (App Router) · TypeScript · Tailwind · Supabase · React Three Fiber (3D) · Framer Motion + GSAP · Recharts · PWA**
> Design **futuriste industriel** : dark mode, glassmorphism, hero 3D temps réel, vision IA animée.
> Fonctionne en **mode démo sans backend** (données d'exemple) — branchez Supabase + une clé IA pour la version complète.

> 🎨 Design system complet : voir **`docs/DESIGN_SYSTEM.md`**.
> `/` = landing premium (3D) · `/dashboard` = Mission Control · le reste sous le shell applicatif.

---

## 🚀 Démarrage rapide (2 min)

```bash
npm install
cp .env.example .env.local      # optionnel : laissez vide pour le mode démo
npm run dev                     # http://localhost:3000
```

Pour un build de production vérifié :

```bash
npm run build && npm start
```

Le projet **compile et tourne immédiatement** sans aucune variable d'environnement :
les pages, le diagnostic IA et les dashboards utilisent un jeu de données intégré.

---

## 🔌 Activer le backend réel (Supabase)

1. Créez un projet sur supabase.com.
2. SQL Editor → exécutez dans l'ordre : `database/schema.sql`, `database/analytics.sql`, `database/seed.sql`.
3. Storage → créez un bucket public `evidence` (photos de pannes).
4. Renseignez `.env.local` :

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ANTHROPIC_API_KEY=...        # vide = diagnostic IA simulé (offline)
```

Dès que les variables sont présentes, les routes API basculent automatiquement
du mode démo vers Supabase (voir `src/lib/supabase/*`).

---

## 🧠 Fonctionnalité IA — Diagnostic sur photo

`POST /api/ai/diagnose` envoie la photo + le contexte à Claude et renvoie un
**JSON structuré** : diagnostic, causes probables, sévérité, confiance, pièces
recommandées, actions. Sans clé API, une réponse simulée déterministe est
retournée pour que la démo fonctionne **hors-ligne**. Détails : `docs/AI.md`.

---

## 📂 Structure

```
smart-asset/
├── database/        schema.sql · analytics.sql · seed.sql
├── docs/            ARCHITECTURE · DATA_MODEL · API · PWA · AI · TEAM_PLAN · MVP · DEMO
├── public/          manifest.webmanifest · sw.js · icons/
└── src/
    ├── app/         pages (App Router) + api/ (routes REST)
    ├── components/  Sidebar · CameraCapture · ui · ...
    └── lib/         types · supabase/ · ai/ · sample-data
```

---

## 📊 Couverture des modules du hackathon

| Module attendu | Implémenté dans |
|---|---|
| Gestion équipements | `/equipments`, `/equipments/[id]`, `api/equipments` |
| Signalement pannes | `/failures`, `/failures/new`, `api/failures` |
| Capture visuelle guidée | `components/CameraCapture.tsx` |
| Demande de pièces | `/parts`, `api/parts` |
| Workflow 7 étapes | `/failures` (tracker) + `workflow_steps` |
| Dashboard admin | `/` (vue d'ensemble) |
| Dashboard analytics | `/analytics` + `database/analytics.sql` |
| Innovation (IA) | `api/ai/diagnose` + `lib/ai/diagnose.ts` |
| PWA | `manifest.webmanifest` + `sw.js` (offline) |

---

## 📜 Scripts

| Commande | Effet |
|---|---|
| `npm run dev` | serveur de dev |
| `npm run build` | build production (vérifié ✅) |
| `npm start` | sert le build |
| `npm run typecheck` | vérifie les types |

Licence : usage hackathon.
