# PWA

Le format PWA est **obligatoire** au hackathon. Tout est déjà en place.

## Composants
| Élément | Fichier |
|---|---|
| Manifest | `public/manifest.webmanifest` (lié via `metadata.manifest` dans `layout.tsx`) |
| Service Worker | `public/sw.js` |
| Enregistrement du SW | `src/components/ServiceWorkerRegister.tsx` (monté dans le layout, actif en production) |
| Icônes | `public/icons/` (192, 512, maskable 512, apple-touch 180) |
| Thème/viewport | export `viewport` dans `layout.tsx` (`themeColor`, `viewportFit:'cover'`) |

## Stratégie de cache (`sw.js`)
- **Install** : pré-cache du *app shell* (`/`, `/equipments`, `/failures`, `/parts`, `/analytics`, manifest).
- **Navigation** : *network-first*, repli sur le shell en cache → l'app s'ouvre hors-ligne.
- **`/api/*` (GET)** : *network-first* avec repli cache → dernières données connues hors-ligne.
- **Assets statiques** (`_next`, icônes) : *stale-while-revalidate*.
- **Activate** : purge des anciens caches (`assetiq-v1`).

## Installation mobile
1. Déployer en **HTTPS** (Vercel le fournit) — requis pour SW + caméra + « Ajouter à l'écran d'accueil ».
2. Sur Android/Chrome : menu → *Installer l'application*. Sur iOS/Safari : *Partager → Sur l'écran d'accueil*.
3. L'app se lance en `display: standalone` (plein écran, sans barre du navigateur).

## Accès caméra
`components/CameraCapture.tsx` utilise `navigator.mediaDevices.getUserMedia({ video:{ facingMode:'environment' } })`
avec repli `<input type="file" capture="environment">` si la caméra est indisponible.

## Vérifier
- Chrome DevTools → **Application → Manifest** (icônes/installabilité) et **Service Workers** (état actif).
- Lighthouse → catégorie **PWA**.
> Le SW ne s'enregistre **qu'en production** (`npm run build && npm start`), pas en `npm run dev`.
