# Design System — AssetIQ « Industrial Intelligence »

Direction : **futuriste industriel**, dark-first, glassmorphism, profondeur et
lumière. Référence visuelle : Linear / Vercel / Palantir / Apple Vision Pro.
Objectif jury : « cette solution semble déjà prête pour le marché ».

## 1. Architecture UI
```
/                     Landing (hero 3D, particules, stats animées, CTA)   — layout racine, plein écran
/(app)                Groupe applicatif → shell (Sidebar + Topbar + MobileNav) + transitions de page
  /dashboard          Mission Control (KPIs animés, flux d'activité, timeline réparation)
  /equipments         Parc d'actifs (cartes glass) + /[id] fiche
  /failures           Pannes + workflow 7 étapes ; /new = capture + vision IA
  /parts              Stock & demandes
  /analytics          Dashboards (Recharts)
```
- **Route group `(app)`** : layout propre (shell) distinct de la landing.
- **`template.tsx`** : remonte à chaque navigation → transitions d'entrée (blur + slide).

## 2. Tokens (voir `tailwind.config.ts` + `globals.css`)
| Rôle | Valeur |
|---|---|
| Fond | `ink #05070A` (+ glows radiaux cyan/amber et grille d'ingénieur masquée) |
| Surface verre | `.glass` — gradient translucide + `backdrop-blur(18px)` + ombre profonde |
| Accent signature | dégradé **cyan `#22D3EE` → ice `#7DD3FC` → amber `#FFB22E`** |
| Sémantique | ok `#34E5A1` · warn `#FBBF24` · ember `#FF6A3D` · crit `#FF5C7A` |
| Texte | `chalk #EAF0F7` (primaire) · `steel #7C8AA0` (secondaire) |
| Glows | `shadow-glow` (cyan) · `shadow-glowamber` |

Classes clés : `.glass`, `.glass-hover` (tilt + halo curseur), `.gradient-text`,
`.btn-primary` (dégradé), `.btn-ghost`, `.label-mono`, `.input`.

## 3. Bibliothèques
| Besoin | Lib |
|---|---|
| 3D temps réel | **three** + **@react-three/fiber** + **@react-three/drei** |
| Animations / transitions | **framer-motion** (entrées, stagger, compteurs, hover) |
| Timeline IA / scanning | **gsap** (beam de scan + apparition des bounding boxes) |
| Particules | canvas maison (`Particles.tsx`), GPU-friendly |
| Graphiques | **recharts** |
| Icônes | **lucide-react** |

> Choix senior : framer-motion couvre les ressorts (spring) → pas besoin de
> react-spring en plus (on évite la redondance et le poids).

## 4. Composants réutilisables
- `three/IndustrialScene.tsx` — turbine industrielle (anneau, pales rotatives, cœur lumineux, pièces en lévitation), lumières colorées, `OrbitControls` auto-rotate.
- `three/Hero3D.tsx` — **lazy load** (`dynamic(..., { ssr:false })`) + skeleton → code splitting, landing légère (~5 kB, three.js chargé à la demande).
- `motion.tsx` — `FadeIn`, `Stagger/StaggerItem`, `MotionCard` (tilt 3D + halo), `AnimatedCounter`.
- `AiScanner.tsx` — expérience **vision artificielle** (voir §6).
- `Particles.tsx` — champ de particules connectées.
- `ui.tsx` — `StatCard` (compteur animé + barre d'accent), `SeverityBadge`, `StatusBadge`, `PageHeader` (titre en dégradé).
- Shell : `Sidebar`, `Topbar` (recherche + statut live), `MobileNav` (barre flottante glass).

## 5. Animations écran par écran
- **Landing** : headline en cascade, stats en compteurs, hero 3D scale-in, parallaxe via glows, hint de scroll animé.
- **Transition de page** : opacity + translateY + blur (`template.tsx`).
- **Dashboard** : KPIs en `Stagger` + compteurs ; flux d'activité timeline (points qui s'allument) ; étapes de réparation révélées une à une, étape active avec halo + pulse.
- **Cartes** : `glass-hover` → légère élévation, bord cyan, halo qui suit le curseur.
- **Pièces / listes** : entrées décalées, badges à pastille.

## 6. Expérience IA visuelle (`AiScanner.tsx`)
Séquence au clic « Lancer le diagnostic IA » :
1. **HUD** : grille cyan + cadre lumineux sur la photo.
2. **Beam de scan** (GSAP) qui balaie de haut en bas (aller-retour).
3. **Bounding boxes** animées (GSAP `back.out`) avec label + score (%), coins type viseur.
4. **Anneau de confiance** : pourcentage qui s'incrémente (compteur animé).
5. **Révélation progressive** du diagnostic, des causes, actions, puis pièces recommandées (stagger framer-motion), avec bouton « Demander » → crée une demande de pièce.

L'appel réel part vers `/api/ai/diagnose` ; un minimum de 2,6 s de scan garantit
l'effet spectaculaire même si la réponse arrive instantanément. Mode mock offline
si pas de clé → la démo ne plante jamais.

## 7. Mobile
- Barre de navigation **flottante en verre** (bas d'écran), cible tactile large.
- Caméra plein cadre avec cadre de visée animé, repli `<input capture>`.
- Mêmes animations que desktop ; `prefers-reduced-motion` respecté (animations coupées).

## 8. Performance
- **Code splitting** du bundle 3D (`ssr:false` + `dynamic`) → landing légère.
- `dpr` plafonné (`[1, 1.8]`) et particules limitées selon la surface → 60 FPS.
- Géométries primitives (pas de modèle GLTF lourd, aucun asset réseau) → démarrage instantané, offline-safe.
- Lazy mount des effets ; `ResizeObserver` pour le canvas.
```
```
