# AssetIQ — Smart Industrial Asset Intelligence

PWA de gestion d'actifs industriels et de pièces détachées, augmentée par un **diagnostic visuel IA**. Next.js (App Router) + Supabase, dual-thème (sombre *industrial-luxe* / clair *éditorial*).

## Démarrage rapide
```bash
npm install
cp .env.example .env.local   # optionnel (l'app tourne sans clés)
npm run dev                  # http://localhost:3000
```
> Sans variables d'environnement, l'app utilise un **store en mémoire** avec des données réalistes et un **diagnostic IA mock déterministe** : tout est démontrable immédiatement, sans rien configurer.

## Fonctionnalités (les 9 modules)
1. Gestion des équipements · 2. Profil/fiche équipement · 3. Déclaration de panne (preuve visuelle obligatoire) · 4. Capture guidée · 5. Demande de pièces · 6. Workflow 7 étapes · 7. Admin · 8. Analytique · 9. Notifications.

Le parcours clé : **Déclarer → photo → diagnostic IA → demande de pièce pré-remplie → workflow temps réel → analytique.**

## Architecture
```
app/                 Routes (App Router) + api/diagnose (route serveur IA)
components/          shell, sidebar, theme-toggle, ui, screens/*
lib/                 data (seed + constantes), store (contexte), motion, supabase, types
supabase/schema.sql  Schéma Postgres complet (tables, enums, RLS, vues, seed)
```
- **Design system** : tokens des 2 thèmes dans `app/globals.css`, mappés dans `tailwind.config.ts`.
- **Mouvement** : courbes + variants dans `lib/motion.ts`, smooth-scroll Lenis.
- **Police unique** : Hanken Grotesk partout ; JetBrains Mono réservé aux données.

## Activer le vrai diagnostic IA
Renseigne `ANTHROPIC_API_KEY` dans `.env.local`. La route `app/api/diagnose/route.ts` appelle alors un modèle de vision et renvoie un JSON structuré (`defect`, `part`, `severity`, `conf`) avec parsing défensif. Sans clé → mock fiable. La clé reste **côté serveur uniquement**.

## Brancher Supabase
1. Crée un projet Supabase, exécute `supabase/schema.sql` dans le SQL Editor.
2. Renseigne `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` dans `.env.local`.
3. Remplace les actions du store (`lib/store.tsx`) par des requêtes Supabase + abonnements Realtime (le pipeline `part_request_events` se prête au temps réel).

## Notes
- Le workflow est modélisé en **journal d'événements** (`part_request_events`), pas un champ unique → timeline, temps réel et analytique de durée par étape.
- Multi-tenant par **RLS** (chaque entreprise ne voit que ses données).
- Asset à fournir pour la démo live : **une photo réelle d'une pièce abîmée**.
