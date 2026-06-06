# Démo finale — script 5 minutes

Objectif : raconter une histoire (un problème industriel réel → notre solution),
pas lister des écrans. Un seul présentateur parle, un second pilote l'app.

## Avant de commencer
- App ouverte sur l'URL HTTPS, **déjà installée** sur le téléphone (mode standalone).
- Connexion de secours coupée mentalement : le **mock IA** garantit que ça marche offline.
- Onglet dashboard pré-chargé.

---

## ⏱️ 0:00 — Accroche (30 s)
> « Dans l'industrie, une machine à l'arrêt coûte des millions. Aujourd'hui, un
> technicien découvre une panne, prend une photo sur son téléphone… et perd des
> heures à identifier la pièce. **AssetIQ** transforme cette photo en diagnostic
> et en commande de pièce en quelques secondes. Démonstration. »

## ⏱️ 0:30 — Ajout d'un équipement (30 s)
*(écran Équipements → fiche)*
> « Chaque actif a une fiche : numéro de série, fabricant, historique des pannes.
> C'est la base de notre intelligence de maintenance. »

## ⏱️ 1:00 — Déclaration de panne + capture guidée (1 min)
*(bouton « Déclarer une panne »)*
> « Le technicien choisit l'équipement, la catégorie, et **l'app le guide pour
> photographier sous 3 angles** : vue d'ensemble, plaque, zone du défaut. »
*(capturer les 3 photos en direct sur mobile)*

## ⏱️ 2:00 — Diagnostic IA (1 min) — **le moment fort**
*(bouton « Lancer le diagnostic IA »)*
> « L'IA analyse la photo et le contexte, et renvoie en quelques secondes : un
> **diagnostic**, les **causes probables**, un **niveau de gravité avec score de
> confiance**, et surtout les **pièces de rechange recommandées**. »
*(montrer le panneau jaune qui apparaît)*

## ⏱️ 3:00 — De la pièce à la commande (45 s)
*(clic « Demander » sur une pièce → puis page Pièces)*
> « En un clic, on crée une **demande de pièce reliée à la panne**, avec son niveau
> d'urgence. Côté stock, on voit immédiatement les **ruptures** — ici, le filtre
> hydraulique est à zéro. »

## ⏱️ 3:45 — Workflow de réparation (30 s)
*(page Pannes → dérouler une panne)*
> « Chaque panne suit un **workflow en 7 étapes**, de la soumission à la clôture.
> L'équipe voit l'avancement en temps réel. »

## ⏱️ 4:15 — Dashboard analytics (30 s)
*(page Analytics)*
> « Et toute cette donnée devient de l'intelligence : **tendance des pannes**,
> **équipements les plus fragiles**, **pièces les plus demandées**, **par
> entreprise**. De quoi anticiper plutôt que subir. »

## ⏱️ 4:45 — Clôture + PWA/offline (15 s)
> « Le tout est une **PWA installable, qui fonctionne hors-ligne** — essentiel dans
> un atelier sans réseau. AssetIQ : de la photo à la décision. Merci. »

---

## Réponses prêtes pour le jury
- *« C'est vraiment l'IA ? »* → Oui, Claude vision via `/api/ai/diagnose` ; un mode
  simulé garantit la démo si le réseau tombe.
- *« Et le passage à l'échelle ? »* → Postgres + index + vues SQL ; multi-entreprises
  via `company_id` et RLS.
- *« L'offline ? »* → Service Worker : shell pré-caché + dernières données API en cache.
- *« Innovation ? »* → Le diagnostic photo→pièce ; extensible au QR code et au prédictif.
