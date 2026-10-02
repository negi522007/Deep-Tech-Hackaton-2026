# 🎛️ Design & Motion Bible v2 — Dual DA (Sombre Industrial / Clair Éditorial)

> **Remplace** la section design système de la v1. Le produit embarque un **vrai toggle de thème**. Deux identités assumées, **un seul produit cohérent**.
> North star inchangé : *Precise. Engineered. Premium.*

---

## 0. Le principe directeur — une colonne vertébrale, deux peaux

| Ne change JAMAIS entre les thèmes (le spine) | Change selon le thème (la peau) |
|---|---|
| Échelle typographique | Surfaces (fonds, niveaux) |
| Échelle d'espacement | Couleurs de texte |
| Rayons | Bordures |
| **Mouvement** (courbes, durées, stagger) | **Police d'affichage** |
| Anatomie des composants | Stratégie de relief |
| Accent de marque (1 teinte) | Calibrage de l'accent + des statuts |

C'est le spine partagé qui empêche le rendu « deux apps collées ». On change la peau, jamais le squelette.

---

## 1. Les deux identités

- **Sombre — Industrial-luxe / technical.** Cockpit quasi-noir, données en mono, bordures cheveu, grain d'ambiance, halo molten sur l'accent. Humeur *sérieuse, ingéniérée*.
- **Clair — Éditorial bold.** Papier crème chaud, gros titres serif (Fraunces), bordures encre franches, grand espace négatif. Humeur *marque produit confiante*.

> ⚠️ Le thème clair **pardonne moins** : sur fond papier, le moindre détail bâclé se voit. Discipline accrue sur l'alignement, les espacements et les états.

---

## 2. Typographie

| Usage | Sombre | Clair | Source |
|---|---|---|---|
| **Display** (hero, titres, gros chiffres) | **Clash Display** | **Fraunces** (serif, optical) | Fontshare / Google |
| **Corps / UI** | Switzer | Switzer | Fontshare |
| **Données** (IDs, n° série, timestamps) | JetBrains Mono | JetBrains Mono | Google |

Bannis : Inter, Roboto, system-ui, **et Space Grotesk** (cliché « startup IA »).
La police d'affichage est **scopée au thème** via une variable (`--font-display`) qui bascule avec `.dark`. Le corps et le mono ne changent pas → c'est le liant de cohérence.

**Échelle typo (identique aux 2 thèmes, base 16px, ratio ~1.25)** — chiffres de données toujours en `tabular-nums` :
```
display 56–72 / -0.02em / lh 1.0   h1 40 / -0.02em / 1.05
h2 28 / 600 / 1.15                 h3 20 / 600 / 1.2
body 16 / 400 / 1.55               small 14 / 1.5
mono/data 13–14 / tabular-nums     label 12 / 500 / upper / 0.08em
```

---

## 3. Tokens couleur — les deux palettes

```css
/* ============ THÈME CLAIR (Éditorial) — défaut ============ */
:root{
  --bg-base:#F4F1EA;  --surface-1:#FFFFFF;  --surface-2:#FBFAF6;
  --text-primary:#14110E; --text-secondary:#5A534A; --text-muted:#8A8278;
  --border-hair:rgba(20,17,14,0.12); --border-strong:#14110E;

  --accent:#E1481A; --accent-hover:#C73C13; --accent-glow:rgba(225,72,26,0.18);

  --ok:#1A7F37; --warn:#9A6700; --danger:#C9302C; --info:#0969DA;

  --inset-hi:none;
  --shadow-amb:0 1px 2px rgba(20,17,14,.06), 0 12px 28px rgba(20,17,14,.10);
  --font-display:'Fraunces', serif;

  /* spine (identique partout) */
  --font-ui:'Switzer', system-ui, sans-serif;
  --font-mono:'JetBrains Mono', monospace;
  --r-card:12px; --r-btn:9px; --r-input:8px; --r-pill:999px;
}

/* ============ THÈME SOMBRE (Industrial) ============ */
.dark{
  --bg-void:#08090B; --bg-base:#0E1013; --surface-1:#15181D; --surface-2:#1C2026;
  --text-primary:#F2F4F7; --text-secondary:#9BA3AE; --text-muted:#5C6571;
  --border-hair:rgba(255,255,255,0.08); --border-strong:rgba(255,255,255,0.14);

  --accent:#FF6A1A; --accent-hover:#FF7E3A; --accent-glow:rgba(255,106,26,0.35);

  --ok:#3FB950; --warn:#D29922; --danger:#F85149; --info:#58A6FF;

  --inset-hi:inset 0 1px 0 rgba(255,255,255,.06);
  --shadow-amb:0 1px 2px rgba(0,0,0,.4), 0 8px 24px rgba(0,0,0,.24);
  --font-display:'Clash Display', sans-serif;
}
```

**Relief, deux stratégies :** sombre = liseré haut interne + ombre ambiante + cheveu. Clair = bordure encre franche (1–1.5px) + ombre douce. On ne mélange pas.

---

## 4. Mouvement (STRICTEMENT identique aux deux thèmes)

```css
--ease-out-expo:    cubic-bezier(0.16, 1, 0.3, 1);   /* LA révélation */
--ease-out-quart:   cubic-bezier(0.25, 1, 0.5, 1);   /* hover, micro */
--ease-in-out-quint:cubic-bezier(0.83, 0, 0.17, 1);  /* transitions de page */
```
Durées : `instant 120 · fast 200 · base 320 · slow 520 · reveal 700–900` (ms).
Règles : on n'anime que `transform / opacity / filter` (60 fps). Stagger frères **60–80ms**. **Un** grand moment orchestré par écran. Smooth-scroll **Lenis** (inertie). `prefers-reduced-motion` géré partout.

Variants Framer + init Lenis : voir `lib/motion.ts` (cf. v1 §5, inchangé).

---

## 5. Mécanique du toggle

- Tailwind `darkMode: 'class'`. Le toggle ajoute/retire `.dark` sur `<html>`.
- Au 1er chargement : lire `localStorage`, sinon respecter `prefers-color-scheme`. (Dans la vraie app Next, `localStorage` est OK — c'est seulement interdit dans les artifacts de prévisualisation.)
- La **bascule elle-même s'anime** : court crossfade des couleurs (`transition: background-color .35s, color .35s` sur les surfaces) — fluide, jamais de flash brutal. Anti-FOUC : poser la classe thème avant le paint (script inline en `<head>`).
- La police d'affichage suit automatiquement via `--font-display`.

---

## 6. Skin des composants (anatomie identique, peau différente)

| Composant | Sombre | Clair |
|---|---|---|
| **Bouton primaire** | fill accent, texte sombre, halo au hover | fill accent, texte blanc, rayon parfois 0 (éditorial) |
| **Carte** | `--surface-1` + cheveu + liseré haut + ombre légère | blanc + **bordure encre franche** + ombre douce |
| **Input focus** | anneau accent + `--accent-glow` | anneau accent net, pas de glow |
| **Pill statut** | teinte sémantique 12% alpha | aplat encre ou teinte sémantique soutenue |
| **Tableau** | zébrage blanc 2%, mono pour IDs | zébrage encre 3%, filets fins encre |
| **Icônes** | Lucide stroke 1.5 | Lucide stroke 1.5 |

Le **moment signature** (révélation diagnostic IA) et la **timeline workflow temps réel** : mêmes mécaniques dans les deux thèmes, seules les couleurs changent. (Specs détaillées : v1 §7.)

---

## 7. Emplacements d'assets réels (là où on branche le concret)

Pour passer de « propre » à « studio-grade », on a besoin de vrais assets à ces endroits :

1. **Logo / wordmark + nom du projet** → header, hero, écran de connexion, slides. (Sinon je propose des noms + un wordmark typographique.)
2. **Photos réelles d'équipements industriels** → fiches machines, listes. Rendent le produit crédible vs stock générique.
3. **⭐ Photo(s) d'une pièce abîmée** (roulement usé, engrenage cassé, courroie, moteur) → **indispensable pour la démo live du diagnostic visuel IA**. C'est l'asset le plus critique.
4. **Contexte réaliste pour les données seed** → noms d'usines/entreprises, modèles de machines, pièces typiques du secteur visé. Rend l'analytique crédible.
5. **Contraintes de marque imposées** par l'orga (logo à inclure, couleurs) → à intégrer si elles existent.

---

## 8. Garde-fous qualité (les deux thèmes)

- Contraste ≥ 4.5:1 dans **chaque** thème (le clair éditorial est plus exigeant — re-vérifier le gris secondaire sur papier).
- `prefers-reduced-motion` respecté · 60 fps · CLS = 0.
- Chaque écran : états chargement / vide / erreur, dans la grammaire du thème actif.
- Polices auto-hébergées, `font-display: swap`, anti-FOUC sur le thème.
- Kill-list anti-slop (v1 §1) toujours en vigueur.

---

**Une DA, deux peaux, un spine de fer. C'est exactement le genre de finition que 80% n'auront pas — et ça ne coûte rien côté fonctionnel.**
