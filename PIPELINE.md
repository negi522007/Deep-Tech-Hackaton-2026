# AssetIQ — Pipeline de completion hackathon

> Mis à jour en temps réel. Chaque étape est cochée dès qu'elle est terminée et testable.

---

## Audit initial — État des 9 modules obligatoires

| # | Module | État | Problème identifié |
|---|--------|------|--------------------|
| 1 | Gestion équipements | ⚠️ Partiel | Champ `status` (Actif/En panne/Critique) absent du modèle de données |
| 2 | Profil équipement | ⚠️ Partiel | Statut calculé non affiché, pas de badge état sur les cartes liste |
| 3 | Déclaration de panne | ❌ Cassé | Champ sévérité absent du formulaire. Bouton "Enregistrer" = `router.push` uniquement, ne sauvegarde rien |
| 4 | Capture visuelle | ✅ OK | CameraCapture + AiScanner présents et fonctionnels |
| 5 | Demande de pièces | ❌ Cassé | Aucun formulaire de création. Lien IA → pré-remplissage → soumission non connecté (`onDiagnosis` callback mort) |
| 6 | Workflow 10 étapes | ❌ Cassé | 7 étapes au lieu de 10 (brief exige exactement : Soumis → En révision → Inspection → Analyse visuelle → Revue ingénierie → Fabrication → Contrôle qualité → Expédition → Livré → Clôturé). Lecture seule, impossible d'avancer une étape |
| 7 | Dashboard Admin | ❌ Absent | Page inexistante. 0% |
| 8 | Dashboard Analytics | ✅ OK | 5 charts + bannière insight 96.5h |
| 9 | Notifications | ❌ Absent | Cloche décorative uniquement. 0% |

---

## Pipeline d'exécution

### ÉTAPE 1 — Workflow 10 étapes + avancement
> Priorité max : le workflow est le fil conducteur de tout le produit. C'est aussi là que les jurés regardent en premier.

**Fichiers touchés :**
- `src/lib/sample-data.ts` — corriger les 10 étapes exactes du brief
- `src/lib/store.tsx` — créer un store React (useState/useContext) pour gérer l'état mutable des pannes
- `src/app/(app)/failures/page.tsx` — ajouter bouton "Avancer l'étape" par panne
- `src/app/(app)/failures/[id]/page.tsx` — page détail panne avec workflow interactif

**Critère de done :** Je clique "Avancer" sur une panne → l'étape suivante s'active visuellement, immédiatement, sans rechargement.

- [x] Étapes corrigées à 10 dans sample-data
- [x] Store React mutable créé
- [x] Bouton avancement visible et fonctionnel
- [x] Page détail panne `/failures/[id]` créée

**Statut : ✅ Terminé**

---

### ÉTAPE 2 — Déclaration de panne fonctionnelle
> Le formulaire existe mais est cassé en deux endroits critiques.

**Fichiers touchés :**
- `src/app/(app)/failures/new/page.tsx` — ajouter champ sévérité + connecter submit au store

**Critère de done :** Je soumets une panne avec sévérité → elle apparaît en tête de liste dans `/failures` avec le bon badge, workflow à l'étape 1.

- [x] Champ sévérité ajouté (critique / élevée / moyenne / faible)
- [x] Submit connecté au store → panne persistée en mémoire
- [x] Nouvelle panne visible dans la liste immédiatement

**Statut : ✅ Terminé**

---

### ÉTAPE 3 — Demande de pièces + lien IA
> C'est la fonctionnalité différenciante. Le lien IA → pièce → demande doit être bout-en-bout.

**Fichiers touchés :**
- `src/app/(app)/parts/page.tsx` — ajouter bouton "Nouvelle demande" + formulaire inline ou modal
- `src/app/(app)/failures/new/page.tsx` — brancher `onDiagnosis` : résultat IA pré-remplit la demande de pièce
- `src/lib/store.tsx` — ajouter les demandes de pièces dans le store mutable

**Critère de done :** Après un diagnostic IA, la pièce recommandée est pré-remplie dans un formulaire de demande → je valide → la demande apparaît dans `/parts`.

- [x] Formulaire de création de demande de pièce
- [x] `onDiagnosis` → pré-remplissage automatique pièce + urgence
- [x] Demande persistée dans le store
- [x] Demande visible dans `/parts`

**Statut : ✅ Terminé**

---

### ÉTAPE 4 — Statut équipement (Modules 1 & 2)
> Calculé depuis les pannes actives, affiché partout.

**Fichiers touchés :**
- `src/lib/sample-data.ts` — fonction `equipmentStatus(id)` calculant le statut depuis les pannes
- `src/app/(app)/equipments/page.tsx` — badge statut sur chaque carte
- `src/app/(app)/equipments/[id]/page.tsx` — badge statut en haut de la fiche

**Logique de calcul :**
- Panne active `critical` → 🔴 Critique
- Panne active `high` → 🟠 Maintenance requise
- Panne active `medium` ou `low` → 🟡 Surveillance
- Aucune panne active → 🟢 Opérationnel

**Critère de done :** Chaque carte équipement affiche un badge de statut coloré et exact.

- [x] Fonction `equipmentStatus` dans sample-data/store
- [x] Badge sur les cartes liste
- [x] Badge sur la fiche détail

**Statut : ✅ Terminé**

---

### ÉTAPE 5 — Dashboard Administrateur
> Module entièrement absent. C'est 25% des points Fonctionnalités.

**Fichiers à créer :**
- `src/app/(app)/admin/page.tsx` — dashboard admin principal

**Contenu minimal requis :**
- Vue multi-entreprises : nombre d'équipements, pannes actives, pièces en rupture par société
- Liste des pannes en cours avec possibilité de changer l'étape workflow (avancement admin)
- Tableau de bord global (chiffres agrégés)
- Assignation : changer le responsable d'une panne (champ texte suffit pour la démo)

**Critère de done :** La page `/admin` est accessible depuis la sidebar, affiche les 3 entreprises avec leurs métriques, et permet d'avancer le workflow d'une panne.

- [x] Page `/admin` créée et accessible
- [x] Vue par entreprise avec métriques
- [x] Avancement workflow depuis l'admin
- [x] Lien dans la sidebar

**Statut : ✅ Terminé**

---

### ÉTAPE 6 — Notifications
> Zéro logique actuellement. Doit se remplir automatiquement sur chaque action.

**Fichiers touchés :**
- `src/lib/store.tsx` — tableau `notifications[]` dans le store
- `src/components/Topbar.tsx` — cloche ouvre un dropdown avec la liste
- Chaque action (submit panne, avancement étape, demande créée) → push une notification

**Format d'une notification :**
```
{ id, type: 'failure_created'|'step_advanced'|'part_requested', message, at, read }
```

**Critère de done :** Je déclare une panne → une notification apparaît dans la cloche. J'avance le workflow → une nouvelle notification s'ajoute. Le compteur rouge sur la cloche est exact.

- [x] Store notifications créé
- [x] Dropdown notifications dans Topbar
- [x] Notification à la soumission de panne
- [x] Notification à l'avancement workflow
- [x] Notification à la création de demande de pièce

**Statut : ✅ Terminé**

---

## Récapitulatif progression

| Étape | Module(s) | Statut |
|-------|-----------|--------|
| 1 — Workflow 10 étapes + avancement | 6 | ✅ Terminé |
| 2 — Déclaration de panne fonctionnelle | 3 | ✅ Terminé |
| 3 — Demande de pièces + lien IA | 5 | ✅ Terminé |
| 4 — Statut équipement | 1, 2 | ✅ Terminé |
| 5 — Dashboard Admin | 7 | ✅ Terminé |
| 6 — Notifications | 9 | ✅ Terminé |

**Progression globale : 6 / 6 étapes complètes ✅**
(Modules déjà OK avant ce pipeline : 4, 8)

---

## Build final
`npm run build` — ✓ Compiled successfully — 16 pages — 0 erreur TypeScript

---

## Phase 7 — Architecture duale + Email + Documentation

### Ajouts post-pipeline

| Fonctionnalité | Fichiers | Statut |
|----------------|----------|--------|
| Portail Technicien (wizard 4 étapes) | `src/app/technicien/` | ✅ |
| Sélecteur de rôle sur landing | `src/app/page.tsx` | ✅ |
| Email automatique (Resend) à chaque soumission | `src/app/api/email/notify/route.ts` | ✅ |
| Dual-theme dark/light + anti-FOUC | `src/app/layout.tsx`, `ThemeToggle.tsx` | ✅ |
| Fix store isolation (1 seul StoreProvider à la racine) | `src/app/layout.tsx` | ✅ |
| ThemeToggle dans portail technicien | `src/app/technicien/layout.tsx` | ✅ |
| Lien Admin dans MobileNav | `src/components/MobileNav.tsx` | ✅ |
| Label "Saisie manuelle" sur `/failures/new` | `src/app/(app)/failures/new/page.tsx` | ✅ |
| Documentation teammates | `README.md`, `docs/ARCHITECTURE.md`, `.env.example`, `setup.sh` | ✅ |

---

*Ce fichier est à la racine du projet : `/home/ange-marie/Deep-Tech-Hackaton-2026/PIPELINE.md`*
