# AssetIQ — Décisions d'architecture

Ce document explique les choix qui ne se lisent pas directement dans le code.

---

## Dual portail — pourquoi deux interfaces ?

Le projet couvre deux acteurs aux besoins opposés :

| Technicien | Admin |
|-----------|-------|
| Sur le terrain, mobile | En backoffice, desktop |
| Soumet une panne avec photo | Reçoit, analyse, traite |
| Veut un wizard simple, guidé | Veut une vue globale, des tableaux |
| Suit sa demande | Pilote le workflow |

Séparer les interfaces évite de surcharger l'une ou l'autre. Chaque portail a son propre layout (`/technicien/layout.tsx` et `/(app)/layout.tsx`).

**Pas de vrai système d'auth** : pour la démo hackathon, un sélecteur de rôle sur la landing suffit. En production, Supabase Auth + RLS gérerait les permissions par rôle.

---

## Store React global (`src/lib/store.tsx`)

L'app n'utilise pas Redux ni Zustand — un simple `createContext + useState` suffit pour le scope du hackathon.

**Ce que le store gère :**
- `failures[]` — liste des pannes (initialisée depuis `sample-data.ts`)
- `workflowProgress` — map `failureId → étape active (1-10)`
- `partRequests[]` — demandes de pièces
- `notifications[]` — notifications in-app (cloche)

**Actions exposées :**
- `addFailure(data)` → crée une panne + démarre le workflow à l'étape 1 + envoie l'email si `submitter` présent
- `advanceWorkflow(failureId)` → incrémente l'étape + push une notification
- `addPartRequest(data)` → crée une demande + push une notification
- `markAllRead()` → marque toutes les notifications comme lues

**Important** : le store est en mémoire. Les données sont perdues au rechargement. Pour la persistance → brancher Supabase (les routes API dans `src/app/api/` sont prêtes).

---

## Workflow 10 étapes

Les 10 étapes exactes imposées par le brief du hackathon :

```
1. Soumis           → panne déclarée, dossier créé
2. En révision      → admin a pris en charge
3. Inspection       → vérification terrain
4. Analyse visuelle → diagnostic approfondi
5. Revue ingénierie → décision technique
6. Fabrication      → pièce en production / commande fournisseur
7. Contrôle qualité → vérification avant expédition
8. Expédition       → pièce partie
9. Livré            → reçu sur site
10. Clôturé         → panne résolue, dossier fermé
```

Stockées dans `src/lib/sample-data.ts` → `WORKFLOW_STEP_NAMES`.
La progression est un entier `workflowProgress[failureId]` (1 à 10).

**Insight clé** : l'étape 6 (Fabrication/Sourcing) prend en moyenne **96.5 heures** contre 8.5h pour toutes les autres réunies. C'est le goulot principal qu'AssetIQ adresse en pré-connectant l'IA au catalogue pièces.

---

## Système de couleurs (dual-theme)

Toutes les couleurs passent par des CSS custom properties sur `:root` (dark) et `html.light` (light).

Tailwind est configuré pour pointer vers ces variables :
```ts
// tailwind.config.ts
cyan: 'var(--accent)' // tout text-cyan → vermillon automatiquement
```

Résultat : tous les composants s'adaptent aux deux thèmes **sans changer une ligne de JSX**.

Le thème est appliqué avant le premier render via un script inline dans `layout.tsx` (anti-FOUC) :
```js
(function(){try{var t=localStorage.getItem('theme');document.documentElement.classList.toggle('light',t==='light');}catch(e){}})();
```

---

## Diagnostic IA (`src/lib/ai/diagnose.ts`)

**Flux complet :**
1. Technicien prend une photo → `dataUrl` base64 dans le state
2. `AiScanner.tsx` appelle `POST /api/ai/diagnose` avec l'image + contexte (équipement, catégorie, description)
3. La route serveur envoie à Claude Vision (`claude-sonnet-4-5`)
4. Claude retourne un JSON structuré :
```json
{
  "diagnosis": "Roulement à billes usé...",
  "probable_causes": ["..."],
  "severity": "high",
  "confidence": 0.87,
  "recommended_parts": [{ "reference": "BRG-6204", "name": "Roulement 6204-2RS", "reason": "..." }],
  "recommended_actions": ["Arrêter la machine...", "Commander la pièce..."]
}
```
5. Le résultat s'affiche animé + pré-remplit la demande de pièce

**Sans `ANTHROPIC_API_KEY`** : mock déterministe retourné — l'UI fonctionne identiquement, utile pour développer hors-ligne.

---

## Emails (`src/app/api/email/notify/route.ts`)

Déclenché automatiquement quand `addFailure()` est appelé avec un `submitter` renseigné (soumission depuis le portail technicien).

**Contenu de l'email :**
- Identité du soumetteur (nom, prénom, entreprise, téléphone, email)
- Équipement concerné (nom, numéro de série, emplacement)
- Description de la panne (titre, catégorie, sévérité, symptômes)
- Diagnostic IA si disponible (diagnostic, confiance, pièce recommandée, actions)
- Bouton CTA pointant vers `/admin`

L'email est non-bloquant (`fetch()` sans `await` dans le store) — la soumission ne ralentit pas même si l'email prend du temps.

**Domaine expéditeur** : `onboarding@resend.dev` (domaine Resend par défaut). En production, configurer un domaine custom vérifié sur resend.com.

---

## Supabase (optionnel)

Le schéma complet est dans `supabase/schema.sql` :
- Tables : `companies`, `equipments`, `failures`, `spare_parts`, `part_requests`, `workflow_steps`
- RLS (Row Level Security) multi-tenant : chaque entreprise ne voit que ses données via `company_id`
- Audit log : `part_request_events` — traçabilité complète des changements de statut
- Vues analytiques pré-calculées pour les dashboards

**Pour activer :**
1. Créer un projet sur supabase.com
2. SQL Editor → coller `supabase/schema.sql` → Run
3. Ajouter les 3 clés dans `.env.local`

---

## Statut équipement (calculé dynamiquement)

Le statut n'est pas stocké — il est calculé en temps réel depuis les pannes actives :

```
panne active severity=critical → 'critical'   (🔴 Critique)
panne active severity=high     → 'maintenance' (🟠 Maintenance requise)
autres pannes actives          → 'watch'       (🟡 Surveillance)
aucune panne active            → 'operational' (🟢 Opérationnel)
```

Fonction : `equipmentStatus(id, failures)` dans `src/lib/sample-data.ts`.

---

## PWA

L'app est installable sur mobile et desktop.
- `public/manifest.webmanifest` : nom, icônes, couleurs, mode `standalone`
- `public/sw.js` : Service Worker pour le cache offline
- `src/components/ServiceWorkerRegister.tsx` : enregistrement côté client

**Note** : la caméra nécessite HTTPS. En local, `localhost` est traité comme sécurisé par les navigateurs. En production, Vercel fournit HTTPS automatiquement.
