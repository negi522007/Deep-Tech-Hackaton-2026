# 🎛️ Design & Motion Bible — Industrial-luxe / Technical Dark

> Document sœur du Plan de Bataille. Toute personne qui touche au front lit ceci d'abord. Le but : que les 5 stylent et animent **à l'identique**, pour qu'aucun écran ne jure et que le tout respire le studio, pas le prompt.

**North star, en 3 mots : Precise. Engineered. Premium.**
On conçoit le cockpit d'une plateforme d'intelligence industrielle. Sombre, dense en signal, chaud aux bons endroits. La beauté vient de la **retenue et de la cohérence**, jamais de l'accumulation d'effets.

---

## 1. Les tells qu'on bannit (la kill-list)

Si l'un de ces éléments apparaît, c'est qu'on a vibe-codé. On les tue à vue :

- ❌ Police Inter / Roboto / Arial / system-ui — la signature n°1 de l'IA
- ❌ Bouton `blue-600`, page `gray-50`, cartes `rounded-lg shadow-md` toutes identiques
- ❌ Dégradé violet → rose, palette timide « répartie équitablement »
- ❌ Focus ring par défaut du navigateur
- ❌ Emojis en guise d'icônes (on utilise un vrai jeu d'icônes, cohérent)
- ❌ Scroll natif saccadé, layout qui saute (CLS), animations qui jankent
- ❌ Ombres lourdes et grises pour « faire du relief »

---

## 2. Couleurs (technical dark)

Le relief en dark ne vient PAS d'ombres lourdes : il vient de **surfaces empilées légèrement plus claires + un liseré haut interne** + des bordures cheveu. Un seul accent chaud (molten), des couleurs sémantiques calibrées pour rester lisibles sur fond noir.

```css
:root {
  /* Canvas — profondeur par empilement, pas par ombre */
  --bg-void:     #08090B;   /* fond le plus profond, hero */
  --bg-base:     #0E1013;   /* canvas principal */
  --surface-1:   #15181D;   /* carte posée */
  --surface-2:   #1C2026;   /* carte surélevée / modal */

  /* Bordures cheveu (hairlines) */
  --border-hair:   rgba(255,255,255,0.08);
  --border-strong: rgba(255,255,255,0.14);

  /* Texte */
  --text-primary:   #F2F4F7;
  --text-secondary: #9BA3AE;
  --text-muted:     #5C6571;

  /* Accent UNIQUE — molten (chaleur machine / alerte) */
  --accent:       #FF6A1A;
  --accent-hover: #FF7E3A;
  --accent-glow:  rgba(255,106,26,0.35);

  /* Sémantique statut (lisible sur dark) */
  --ok:       #3FB950;  /* operational */
  --warn:     #D29922;  /* degraded / medium */
  --danger:   #F85149;  /* down / critical */
  --info:     #58A6FF;  /* maintenance / info */

  /* Relief */
  --inset-hi:  inset 0 1px 0 rgba(255,255,255,0.06);
  --shadow-amb: 0 1px 2px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.24);

  /* Rayons (technique = légèrement net) */
  --r-card: 12px;  --r-btn: 9px;  --r-input: 8px;  --r-pill: 999px;
}
```

**Règle d'accent :** le molten ne sert qu'aux moments forts — CTA principal, état actif, focus, le segment franchi du workflow, la série clé d'un graphe. Partout ailleurs : gris de signal. Un accent rare est un accent puissant.

**Texture d'ambiance :** un overlay de grain SVG (`opacity: 0.03`, `pointer-events: none`, `position: fixed`) sur tout le canvas. Détail invisible consciemment, mais qui retire l'aspect « plat numérique ». Et un halo radial très diffus derrière le hero (accent à 6 % d'alpha).

---

## 3. Typographie (distinctive, jamais générique)

Pairing libre + auto-hébergeable, premium et non vu mille fois :

| Usage | Police | Source |
|---|---|---|
| Display / hero / gros chiffres | **Clash Display** | Fontshare (gratuit, commercial) |
| UI / corps | **Switzer** | Fontshare (gratuit) |
| Données / IDs / n° série / timestamps | **JetBrains Mono** | Google Fonts |

> On **évite** Inter, Roboto, system-ui — et aussi Space Grotesk, devenu le cliché « startup IA ». Clash Display donne le caractère premium, Switzer la neutralité haut de gamme, le mono rend les données *crédibles* et techniques.

**Échelle typographique** (ratio ~1.25, base 16px) :
```
display  56–72px / Clash Display / line-height 1.0 / letter-spacing -0.02em
h1       40px    / Clash Display / 1.05 / -0.02em
h2       28px    / Switzer 600 / 1.15
h3       20px    / Switzer 600 / 1.2
body     16px    / Switzer 400 / 1.55
small    14px    / Switzer 400 / 1.5
mono/data 13–14px / JetBrains Mono / tabular-nums
label    12px    / Switzer 500 / uppercase / letter-spacing 0.08em
```
Les chiffres de données utilisent **`font-variant-numeric: tabular-nums`** — non négociable pour des tableaux propres.

---

## 4. Espacement & rythme

Base 4px. Échelle : `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96`. Espace négatif **généreux** sur le hero et les vues marketing/onboarding ; densité **contrôlée** (lisible) sur les tableaux. On ne remplit pas le vide : le vide fait partie du design.

---

## 5. Le système de mouvement (le cœur du « follement animé »)

### Courbes (les nommer, les réutiliser partout)
```css
--ease-out-expo:  cubic-bezier(0.16, 1, 0.3, 1);   /* LA courbe de révélation */
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);   /* hover, micro */
--ease-in-out-quint: cubic-bezier(0.83, 0, 0.17, 1); /* transitions de page */
```
### Durées
```
instant 120ms · fast 200ms · base 320ms · slow 520ms · reveal 700–900ms
```
### Règles d'or
- On anime **uniquement** `transform`, `opacity`, `filter` → 60 fps garanti. Jamais `width/height/top/left`.
- Stagger entre frères : **60–80ms**. C'est ça qui donne la « chorégraphie » au lieu du « tout apparaît d'un coup ».
- **Un** grand moment orchestré par écran > dix micro-effets dispersés.

### Révélation au chargement / scroll (Framer Motion)
```tsx
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};
// <motion.ul variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-15%" }}>
//   {items.map(x => <motion.li variants={item} key={x.id}>…</motion.li>)}
```

### Smooth scroll à inertie (Lenis) — le détail qui change tout
```tsx
import Lenis from "lenis";
const lenis = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 3) });
const raf = (t: number) => { lenis.raf(t); requestAnimationFrame(raf); };
requestAnimationFrame(raf);
```

### Scroll-driven (profondeur / parallaxe)
`useScroll` + `useTransform` de Framer Motion pour piloter `y`, `opacity`, `scale` selon la position de scroll. Réservé au hero et aux sections narratives. Parallaxe **subtile** (décalage 8–24px), jamais clownesque.

### Transitions de page
View Transitions API (ou `AnimatePresence`) : sortie en fondu + léger `y`, entrée en `--ease-in-out-quint`. Fluide, jamais brutal.

### ⚠️ Accessibilité du mouvement
Respecter `prefers-reduced-motion: reduce` → on coupe parallaxe et grands déplacements, on garde des fondus courts. C'est aussi un point que les bons jurys vérifient.

---

## 6. Où on met le feu vs où on reste chirurgical

| Surface | Traitement | Pourquoi |
|---|---|---|
| **Hero / onboarding** | 🔥 plein feu : halo, parallaxe, révélation chorégraphiée, grain | premier regard du jury = impression studio immédiate |
| **Révélation diagnostic IA** | 🔥 LE moment waouh (voir §7) | c'est ce qu'ils retiendront |
| **Timeline workflow (temps réel)** | 🔥 remplissage animé + pulse du nœud actif | prouve le realtime, spectaculaire |
| **Transitions entre pages** | 🔥 fluides | sensation de continuité premium |
| **Tableaux / formulaires / dashboards data** | ✓ clair, rapide, confiant | la clarté *est* du haut de gamme — et ça score en UX |

> Mettre de la parallaxe sur un dashboard = perte de lisibilité + risque de jank = bug en démo. La discipline ici est ce qui sépare le pro de l'amateur.

---

## 7. Spécifications composants

**Boutons.** Primaire = fill accent, texte sombre, `--inset-hi`, au hover halo `--accent-glow` + `--accent-hover`, à l'active `scale(0.98)`. Ghost = bordure cheveu, se remplit au hover. Rayon `--r-btn`. Transition `200ms --ease-out-quart`.

**Cartes.** `--surface-1`, bordure `--border-hair`, `--inset-hi`, `--shadow-amb` léger. Au hover (si cliquable) : bordure → `--border-strong` + léger `translateY(-2px)`. Jamais l'ombre lourde générique.

**Inputs.** Surface sombre, bordure cheveu, au focus : anneau accent 2px à faible alpha + `--accent-glow` diffus (pas le ring bleu du navigateur). Champs numériques (n° série, modèle) en **JetBrains Mono**.

**Tableaux (clarté = roi).** En-tête collant, `tabular-nums`, IDs/dates en mono, lignes 52px, zébrage à 2 % de blanc, surlignage de ligne au hover. **Pas** de « cartification » des tableaux — un vrai tableau dense et net.

**Pills de statut.** Point coloré + label, teinte de fond sémantique à ~12 % d'alpha (`--ok/--warn/--danger/--info`). Rayon `--r-pill`.

**Icônes.** Lucide, stroke **1.5**, taille cohérente. Jamais d'emoji en UI.

### Le moment signature — la révélation du diagnostic IA
1. Après capture : un **balayage shimmer** (gradient animé) passe sur la photo → effet « scan en cours ».
2. La carte de verdict se **révèle en stagger** (`--ease-out-expo`) :
   - le **défaut** en gros (Clash Display),
   - la **confiance** en compteur animé (radial ou barre qui se remplit),
   - la **pill de gravité** (couleur sémantique),
   - la **pièce recommandée** qui glisse depuis le bas.
3. Halo accent diffus derrière la carte. Durée totale ~900ms, jamais plus.
> C'est 5 secondes. Elles doivent être parfaites. On les répète jusqu'à ce qu'elles soient chirurgicales.

### La timeline du workflow
7 nœuds (Soumis → … → Clôture). Le segment franchi se **remplit en accent** avec `--ease-out-expo`, le nœud actif **pulse** très subtilement. Quand l'admin fait avancer le statut, le remplissage **progresse en temps réel** sur l'écran du technicien (Supabase Realtime). Timestamps en mono.

### Graphes (Recharts)
Dark, lignes fines, **une** série en accent, gridlines à faible alpha, labels en `tabular-nums`, animation d'entrée au montage (tracé de ligne / pousse des barres). Sobriété > décoration.

---

## 8. Garde-fous qualité (rappel : SANS ERREUR)

- Contraste texte ≥ 4.5:1 (nos couleurs passent — vérifier les exceptions).
- `prefers-reduced-motion` géré partout.
- 60 fps : `transform/opacity/filter` only. Zéro layout shift (CLS = 0).
- Overlay grain en `pointer-events: none`.
- Chaque écran : états **chargement / vide / erreur** stylés dans la même grammaire.
- Polices auto-hébergées + `font-display: swap` (pas de FOIT, pas de flash).
- On teste la démo sur l'écran de démo réel, pas seulement sur nos machines.

---

## 9. Setup express (à faire à H2)

1. Installer : `framer-motion`, `lenis`, `lucide-react`. Polices Clash Display + Switzer (Fontshare, self-host) + JetBrains Mono (Google).
2. Coller les variables CSS du §2 dans `globals.css`, mapper dans `tailwind.config` (`theme.extend.colors`, `borderRadius`, `boxShadow`).
3. Créer `lib/motion.ts` avec les variants + courbes du §5 → tout le monde les importe, personne ne réinvente une animation.
4. Wrapper `<SmoothScroll>` (Lenis) au niveau layout.
5. Définir 6–8 composants de base (Button, Card, Input, StatusPill, Table, Stat, TimelineNode, Reveal) **avant** de construire les écrans. C'est le design system : on le pose une fois, on l'utilise partout. Cohérence garantie.

---

**Règle finale :** un design system tenu + un grand moment par écran + une discipline de fer sur la lisibilité des données. C'est ça qui fait dire au jury « ce n'est pas sorti d'un prompt » — et qui ne coûte aucun point côté fonctionnel.
