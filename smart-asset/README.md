# AssetIQ — Industrial Asset Intelligence

> Plateforme PWA de gestion des pannes industrielles et des pièces de rechange.
> Hackathon Smart Industrial Asset Intelligence & Spare Parts Innovation.

---

## Vue d'ensemble

AssetIQ connecte deux acteurs :

- **Le technicien** sur le terrain : il photographie une panne, l'IA analyse, une demande est créée et les admins sont alertés instantanément par email.
- **L'admin** en backoffice : il reçoit le dossier complet, pilote le workflow de réparation en 10 étapes, supervise les équipements et les stocks.

**Innovation clé** : diagnostic visuel IA — une photo suffit pour identifier la pièce défectueuse et réduire le délai de sourcing de 72 %.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Style | Tailwind CSS + CSS custom properties (dual-theme) |
| Animations | Framer Motion + GSAP |
| 3D | React Three Fiber + Three.js |
| IA | Anthropic Claude (`claude-sonnet-4-5`) — vision |
| Email | Resend |
| Base de données | Supabase (optionnel — fonctionne sans) |
| PWA | manifest.webmanifest + Service Worker |

---

## Démarrage rapide

### Prérequis
- Node.js ≥ 18
- npm ≥ 9

### Installation

```bash
# 1. Cloner le repo
git clone <url-du-repo>
cd Deep-Tech-Hackaton-2026

# 2. Lancer le script de setup (installe tout automatiquement)
bash smart-asset/setup.sh

# 3. Configurer les variables d'environnement
cd smart-asset
cp .env.example .env.local
# → Ouvrir .env.local et remplir les clés (voir section Variables ci-dessous)

# 4. Lancer en développement
npm run dev
```

L'application tourne sur **http://localhost:3000**

---

## Variables d'environnement

Copier `.env.example` → `.env.local` et remplir :

| Variable | Requis | Description |
|----------|--------|-------------|
| `ANTHROPIC_API_KEY` | Non* | Clé API Anthropic — diagnostic IA réel |
| `ANTHROPIC_MODEL` | Non | Modèle Claude (défaut : `claude-sonnet-4-5`) |
| `RESEND_API_KEY` | Non* | Clé Resend — envoi d'emails |
| `ADMIN_EMAIL` | Non* | Email qui reçoit les notifications de pannes |
| `NEXT_PUBLIC_APP_URL` | Oui | URL de l'app (`http://localhost:3000` en local) |
| `NEXT_PUBLIC_SUPABASE_URL` | Non** | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Non** | Clé publique Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Non** | Clé service Supabase (serveur uniquement) |

> *Sans ces clés, l'app fonctionne en mode démo (IA mock, emails silencieux).
> **Sans Supabase, les données viennent de `src/lib/sample-data.ts` (en mémoire, reset au reload).

---

## Structure du projet

```
smart-asset/
├── src/
│   ├── app/
│   │   ├── (app)/                  ← Portail Admin (layout avec sidebar)
│   │   │   ├── dashboard/          ← Mission Control — KPIs globaux
│   │   │   ├── equipments/         ← Gestion équipements (liste, fiche, ajout)
│   │   │   ├── failures/           ← Pannes + workflow 10 étapes
│   │   │   ├── parts/              ← Catalogue pièces + demandes
│   │   │   ├── analytics/          ← Dashboard analytique (charts + insight 96.5h)
│   │   │   └── admin/              ← Administration multi-entreprises
│   │   ├── technicien/             ← Portail Technicien (layout simplifié)
│   │   │   ├── page.tsx            ← Accueil technicien
│   │   │   ├── soumettre/          ← Wizard soumission 4 étapes
│   │   │   └── suivi/              ← Suivi des demandes en temps réel
│   │   ├── api/
│   │   │   ├── ai/diagnose/        ← Claude Vision : photo → diagnostic JSON
│   │   │   ├── email/notify/       ← Resend : dossier complet → email admin
│   │   │   ├── equipments/         ← CRUD équipements (Supabase)
│   │   │   ├── failures/           ← CRUD pannes (Supabase)
│   │   │   └── parts/              ← CRUD pièces (Supabase)
│   │   ├── layout.tsx              ← Root layout (anti-FOUC, polices)
│   │   └── page.tsx                ← Landing + sélecteur de rôle
│   ├── components/
│   │   ├── AiScanner.tsx           ← Scan IA animé (GSAP + Framer Motion)
│   │   ├── CameraCapture.tsx       ← Capture photo multi-angles
│   │   ├── motion.tsx              ← FadeIn, Stagger, MotionCard, AnimatedCounter
│   │   ├── Sidebar.tsx             ← Navigation admin
│   │   ├── Topbar.tsx              ← Barre top + dropdown notifications
│   │   ├── ThemeToggle.tsx         ← Bascule dark/light
│   │   ├── ui.tsx                  ← Composants partagés (badges, PageHeader)
│   │   └── three/                  ← Scènes 3D (turbine industrielle)
│   └── lib/
│       ├── types.ts                ← Types TypeScript du domaine métier
│       ├── store.tsx               ← Store React global (état, actions, notifications)
│       ├── sample-data.ts          ← Données de démo en mémoire
│       ├── ai/diagnose.ts          ← Appel Claude Vision + fallback mock
│       └── supabase/               ← Clients Supabase (browser + server)
├── public/
│   ├── manifest.webmanifest        ← Configuration PWA
│   └── sw.js                       ← Service Worker (cache offline)
├── supabase/
│   └── schema.sql                  ← Schéma BDD (tables, RLS, vues analytiques)
├── docs/
│   └── ARCHITECTURE.md             ← Décisions d'architecture détaillées
├── .env.example                    ← Template variables d'environnement
├── .env.local                      ← Vos clés réelles (ignoré par git)
├── setup.sh                        ← Script d'installation en une commande
└── tailwind.config.ts              ← Config Tailwind (couleurs → CSS vars)
```

---

## Routes disponibles

### Portail Technicien
| Route | Description |
|-------|-------------|
| `/technicien` | Accueil — accès soumission ou suivi |
| `/technicien/soumettre` | Wizard 4 étapes : infos → panne → photo+IA → confirmation |
| `/technicien/suivi` | Suivi temps réel de toutes les demandes |

### Portail Admin
| Route | Description |
|-------|-------------|
| `/dashboard` | Mission Control — KPIs, workflow récent |
| `/equipments` | Liste équipements avec recherche et filtre catégorie |
| `/equipments/new` | Formulaire d'ajout d'équipement |
| `/equipments/[id]` | Fiche détail + historique pannes + statut calculé |
| `/failures` | Liste pannes + bouton "Avancer" workflow |
| `/failures/new` | Saisie manuelle de panne (côté admin) |
| `/failures/[id]` | Détail panne + workflow 10 étapes interactif |
| `/parts` | Catalogue stock + demandes de pièces |
| `/analytics` | Charts analytiques + insight 96.5h sourcing |
| `/admin` | Supervision multi-entreprises + gestion workflow |

### Landing
| Route | Description |
|-------|-------------|
| `/` | Page d'accueil + sélecteur de rôle (Technicien / Admin) |

---

## Commandes utiles

```bash
npm run dev        # Développement avec hot reload
npm run build      # Build de production (valide TypeScript)
npm run start      # Serveur de production
npm run typecheck  # Vérification types sans build
npm run lint       # Linter ESLint
```

---

## Thème

L'app supporte deux thèmes, basculables via le bouton ☀/🌙 en haut à droite :

- **Dark** (défaut) : fond `#0E1013`, accent vermillon `#FF6A1A`
- **Light** : fond `#F4F1EA`, accent rouge `#E1481A`

Persisté dans `localStorage`, appliqué avant le premier render (pas de flash).

---

## Données de démo

Sans Supabase, l'app utilise `src/lib/sample-data.ts` :
- 3 entreprises : SOBEBRA Cotonou, CIMBENIN, Bénin Textile SA
- 4 équipements industriels
- 6 pannes à différents stades du workflow
- 4 pièces de rechange avec niveaux de stock
- 3 demandes de pièces

Les données sont en mémoire — elles se réinitialisent au rechargement de page.

---

## Déploiement Vercel

```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Déployer
vercel

# 3. Configurer les variables d'environnement
# Vercel Dashboard → votre projet → Settings → Environment Variables
# Ajouter chaque variable de .env.local
```
