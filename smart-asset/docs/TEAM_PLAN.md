# Plan d'équipe — 48h, 5 développeurs

## Rôles
| Dev | Rôle | Domaine |
|---|---|---|
| **D1** | Lead / Backend & DB | Supabase, schema, API routes, auth |
| **D2** | Frontend core | Layout, navigation, pages équipements/pannes |
| **D3** | Frontend features | Caméra, formulaire panne, page pièces |
| **D4** | IA & Analytics | `/api/ai/diagnose`, prompts, dashboard Recharts |
| **D5** | PWA / UX / Démo | Manifest+SW, design system, intégration, pitch |

> Le repo livré contient déjà tout ça en version fonctionnelle : ce planning sert
> à **se l'approprier, le brancher au vrai backend et le polir**, pas à repartir de zéro.

## Phase 0 — H0→H3 : cadrage & setup
- **Tous** : lire ce repo, répartir, conventions Git (branches `feat/*`, PR courtes).
- **D1** : créer projet Supabase, exécuter `schema.sql` + `analytics.sql` + `seed.sql`, bucket `evidence`.
- **D5** : déployer le squelette sur Vercel (HTTPS pour caméra/PWA), partager l'URL.
- **Tous** : `npm install`, app qui tourne en local.

## Phase 1 — H3→H12 : socle
- **D1** : brancher `/api/equipments`, `/api/failures`, `/api/parts` sur Supabase (remplacer le repli démo).
- **D2** : finaliser liste + fiche équipement, liste pannes + tracker workflow.
- **D3** : formulaire de signalement + upload photos vers Supabase Storage.
- **D4** : endpoint IA avec la vraie clé, valider le JSON de bout en bout.
- **D5** : design system (couleurs, composants), responsive mobile.

## Phase 2 — H12→H24 : intégration verticale
- **Objectif** : un parcours complet équipement → panne → photo → IA → pièce → workflow → dashboard.
- **D1+D3** : enchaînement signalement → création panne → 7 étapes → demande pièce.
- **D4** : 5 graphes du dashboard branchés sur les vues SQL.
- **D5** : PWA installable + offline testés (Lighthouse).
- **H24 : checkpoint démo n°1** (tout le monde fait tourner le parcours).

## Phase 3 — H24→H40 : robustesse & innovation
- **D1** : RLS company-scoped (bonus sécurité), gestion erreurs API.
- **D2/D3** : états vides, chargements, messages d'erreur, polish mobile.
- **D4** : affiner les prompts, ajouter QR code tracking si le temps le permet.
- **D5** : seed de données réalistes pour des dashboards « vivants ».

## Phase 4 — H40→H46 : gel & démo
- **Feature freeze à H40.** Plus que correctifs.
- **D5** : répéter la démo de 5 min (script `docs/DEMO.md`), chrono en main, plan B offline.
- **Tous** : relire README + doc technique pour le jury.

## Phase 5 — H46→H48 : tampon
- Marge de sécurité : bugs de dernière minute, déploiement final, backup vidéo de la démo.

## Règles d'or hackathon
- **Mergez tôt et souvent** ; pas de branche qui vit 10h.
- **Démo offline prête** : la clé IA peut tomber → le mock sauve la présentation.
- **Ne pas sur-scoper** : le MVP (voir `docs/MVP.md`) d'abord, le reste ensuite.
