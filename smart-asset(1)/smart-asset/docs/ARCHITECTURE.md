# Architecture

## 1. Choix de la stack (justification hackathon)

| Couche | Choix | Pourquoi en 48h |
|---|---|---|
| Frontend | **Next.js 14 (App Router) + TypeScript** | Un seul repo front + API routes → pas de serveur séparé à déployer. Rendu rapide, PWA facile. |
| UI | **Tailwind + lucide-react + Recharts** | Design system instantané, icônes cohérentes, graphiques de dashboard sans config. |
| Backend / API | **Next.js Route Handlers** (`/app/api/*`) | Zéro infra : les endpoints REST vivent dans le même projet. |
| Base de données | **Supabase (PostgreSQL)** | Postgres managé + Auth + Storage + API auto en quelques minutes. SQL puissant pour les analytics. |
| Auth | **Supabase Auth** | Email/password prêt à l'emploi, `auth.uid()` pour le RLS. |
| Stockage images | **Supabase Storage** (bucket `evidence`) | Upload direct depuis le client, URLs publiques pour l'affichage. |
| IA | **Anthropic Claude (vision)** via `/api/ai/diagnose` | Analyse d'image → JSON structuré. Fallback mock offline pour la démo. |
| Analytics | **Vues SQL** (`database/analytics.sql`) + Recharts | Le calcul lourd reste en base ; le front ne fait qu'afficher. |
| Hébergement | **Vercel** (recommandé) | Déploiement Next.js en 1 clic, HTTPS (obligatoire pour PWA + caméra). |

Principe directeur : **minimiser l'infra**. Un seul déploiement (Next.js sur
Vercel) + un projet Supabase. Aucune brique à orchestrer pendant le hackathon.

## 2. Flux système

```
┌──────────────┐   HTTPS    ┌─────────────────────────┐
│  Utilisateur │ ─────────► │  Next.js (Vercel)        │
│ mobile/desktop│           │  ├─ Pages (App Router)   │
│   PWA + SW   │ ◄───────── │  └─ /api/* Route Handlers│
└──────────────┘  offline   └───────────┬─────────────┘
       ▲  cache (Service Worker)         │
       │                                 │ supabase-js (service role)
       │                     ┌───────────▼─────────────┐
       │                     │  Supabase                │
       │                     │  ├─ PostgreSQL (tables + │
       │                     │  │   vues analytics)     │
       │                     │  ├─ Auth                 │
       │                     │  └─ Storage (photos)     │
       │                     └───────────┬─────────────┘
       │                                 │
       │   POST /api/ai/diagnose         │
       │   (image base64 + contexte)     ▼
       │                     ┌─────────────────────────┐
       └──────── JSON ◄───── │  Claude API (vision)     │
         diagnostic structuré└─────────────────────────┘
```

### Détail des flux
1. **Lecture** : la page (client) appelle `/api/equipments` → le handler interroge
   Supabase (ou renvoie les données démo si pas configuré).
2. **Signalement** : `/failures/new` → photos capturées localement → `POST /api/failures`
   crée la panne et **initialise les 7 étapes** de workflow.
3. **Diagnostic IA** : la 1ʳᵉ photo (base64) part vers `/api/ai/diagnose` → Claude →
   JSON stocké dans `failures.ai_diagnosis`.
4. **Pièces** : depuis le diagnostic, un clic crée une `spare_part_request` liée à la panne.
5. **Offline** : le Service Worker sert le shell + les dernières réponses API en cache.

## 3. Sécurité (bonus jury)
- Clé **service role** uniquement côté serveur (route handlers), jamais exposée au client.
- **RLS** scoped par `company_id` (politiques commentées dans `schema.sql`).
- HTTPS obligatoire (caméra + installation PWA).
