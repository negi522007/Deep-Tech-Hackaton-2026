# 🧱 Starter Kit — Socle visuel dual-thème

Le socle propre que l'équipe clone à **H2**. Tokens des deux thèmes, police d'identité unique, moteur de mouvement et composants de référence. On bâtit *avec*, on ne re-style pas au cas par cas.

## Fichiers
| Fichier | Rôle | Destination type (Next.js App Router) |
|---|---|---|
| `globals.css` | Tokens des 2 thèmes, base, grain, focus | `app/globals.css` |
| `tailwind.config.ts` | Mappe les tokens vers Tailwind | racine |
| `motion.ts` | Courbes, variants Framer, hook Lenis | `lib/motion.ts` |
| `theme-toggle.tsx` | Bascule clair/sombre + persistance | `components/theme-toggle.tsx` |
| `ui.tsx` | Button, Card, StatusPill, Reveal | `components/ui.tsx` |

> Dans `ui.tsx`, ajuste l'import `./motion` selon ton arborescence (ex. `@/lib/motion`).

## Installation
```bash
npm install framer-motion lenis lucide-react
# + Tailwind si pas déjà là : npm install -D tailwindcss postcss autoprefixer
```

## Polices
- **Identité (partout) : Hanken Grotesk** — chargée via Google Fonts dans `globals.css`. Une seule famille, du hero au corps, dans les deux thèmes.
- **Données : JetBrains Mono** — réservée aux IDs, n° de série, timestamps (alignement `tabular-nums`). Classe `font-mono`.
- **Upgrade premium optionnel :** remplacer Hanken par **Switzer** (Fontshare, auto-hébergée) → changer la `@import` + `--font-sans`. Une ligne.

## Anti-FOUC (obligatoire)
Pour éviter le flash de thème au chargement, ajoute ce script **inline dans `<head>`** de `app/layout.tsx`, avant tout rendu :
```tsx
<script dangerouslySetInnerHTML={{ __html: `
  (function(){ try {
    var t = localStorage.getItem('theme')
      || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', t === 'dark');
  } catch(e){} })();
`}} />
```
Puis, sur le `<body>` (ou un wrapper), ajoute la classe `grain` pour l'overlay d'ambiance.

## Smooth-scroll
Dans un layout client : `useSmoothScroll()` depuis `lib/motion`. Respecte automatiquement `prefers-reduced-motion`.

## Règles d'or (rappel)
- On n'anime que `transform / opacity / filter` (60 fps).
- Un grand moment orchestré par écran > dix micro-effets dispersés.
- Chaque écran : états chargement / vide / erreur, dans la grammaire du thème actif.
- Le thème **clair pardonne moins** : vigilance sur l'alignement et les espacements.

## Exemple express
```tsx
import { Button, Card, StatusPill, Reveal } from "@/components/ui";

export default function Demo() {
  return (
    <Reveal>
      <Card className="max-w-sm">
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm font-bold">Compresseur AX-200</span>
          <StatusPill status="down" />
        </div>
        <div className="mt-4">
          <Button>Diagnostiquer avec l'IA</Button>
        </div>
      </Card>
    </Reveal>
  );
}
```
