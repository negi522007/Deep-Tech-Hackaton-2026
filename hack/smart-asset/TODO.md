# AssetIQ — TODO LIVE (mis à jour au fur et à mesure)

> Légende : ✅ fait · 🔄 en cours · ⬜ à faire · ❌ bug connu

---

## PRIORITÉ 0 — Bloquants (sans ça le projet est creux)

- [x] ✅ Switcher l'IA sur **Gemini 2.0 Flash** (gratuit, vision, 1500 req/jour)
- [ ] ⬜ **Obtenir GOOGLE_AI_API_KEY** sur aistudio.google.com (2 min, aucune CB)
        → Ajouter dans `.env.local` : `GOOGLE_AI_API_KEY=ta_clé_ici`
- [x] ✅ Persistance **localStorage** — store survit au rechargement de page
- [x] ✅ **Création équipement** connectée au store (apparaît vraiment dans la liste)
- [x] ✅ **Dashboard** utilise le store (pas import statique) + live failure dynamique
- [x] ✅ **Analytics** utilise le store (pannes ajoutées en démo apparaissent dans les graphes)
- [x] ✅ **Données seed enrichies** — 22+ pannes sur 8 mois (graphes crédibles)

---

## PRIORITÉ 1 — Différenciateurs (ce qui fait gagner)

- [x] ✅ **Synthèse vocale** — diagnostic IA lu à voix haute en français (Web Speech API)
- [x] ✅ **Reconnaissance vocale** — technicien décrit la panne à la voix (mic dans formulaire)
- [x] ✅ **QR Code** sur fiche équipement — modal avec QR SVG → scanner = formulaire pré-rempli
- [x] ✅ **Module maintenance prédictive** — score risque 0-100, prochaine date, tendance, intervalle moyen
        → Dashboard "Intelligence prédictive" + fiche équipement enrichie
- [ ] ⬜ **Chat IA contextuel** — après diagnostic, poser des questions à Claude sur la panne
        → Ouvrir une conversation avec contexte équipement + diagnostic injecté

---

## PRIORITÉ 2 — Valeur ajoutée métier

- [x] ✅ **Recherche topbar fonctionnelle** — navigue vers /equipments?q=terme
- [ ] ⬜ **Filtre/recherche sur page Pannes** — identique à Équipements
- [ ] ⬜ **Badge "IA analysée"** dans liste pannes quand `ai_diagnosis` présent
- [ ] ⬜ **Noms pièces** dans demandes (afficher nom au lieu d'ID brut)
- [ ] ⬜ **Export PDF** rapport de panne — `window.print()` + CSS print
- [ ] ⬜ **Graphe sparkline** historique pannes dans fiche équipement
- [ ] ⬜ **Bouton "Déclarer une panne"** depuis la fiche équipement (lien vers /failures/new?equipId=xxx)

---

## PRIORITÉ 3 — Polish (si temps restant)

- [ ] ⬜ Page **404 custom** (5 lignes, soin du détail)
- [ ] ⬜ **Statut "IA badge"** sur les cards équipements (indique si dernière panne a été analysée par IA)
- [ ] ⬜ Score de risque prédictif par équipement (fréquence de pannes × sévérité moyenne)
- [ ] ⬜ Notification push Service Worker quand panne créée

---

## BUGS CONNUS (à corriger)

- [x] ✅ Equipment creation — ne persistait pas dans store
- [x] ✅ Dashboard hardcodé sur failures[3] statique
- [x] ✅ Analytics ignorait les pannes ajoutées en démo
- [ ] ❌ Page suivi technicien affiche toutes les pannes (pas filtré par soumetteur)
- [ ] ❌ Companies dans form new equipment avaient des mauvais noms
- [ ] ❌ Recherche topbar cosmétique

---

## ÉTAT RÉEL DE L'IA

| Situation | Comportement |
|---|---|
| `GOOGLE_AI_API_KEY` absent | Mock déterministe (if/else sur catégorie) |
| Clé présente | **Vrai appel Gemini 2.0 Flash avec vision** |
| Clé invalide / erreur réseau | Fallback automatique sur mock |

---

*Dernière mise à jour : implémentation initiale complète*
