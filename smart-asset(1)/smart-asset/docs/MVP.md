# MVP 48h — priorisation

Le barème dicte l'ordre : **Fonctionnalités 25 % + Compréhension 20 % = 45 %**.
On sécurise d'abord un parcours complet et clair, puis on enrichit.

## 1. À développer EN PREMIER (la colonne vertébrale démontrable)
1. **Signalement de panne avec photo** → c'est le moment « wow » + ça nourrit tout le reste.
2. **Diagnostic IA** sur la photo (avec mock offline) → l'innovation, visible en 10 s.
3. **Liste/fiche équipement** → contexte, montre la gestion des actifs.
4. **Dashboard analytics** (au moins 3 graphes branchés) → prouve la valeur « data intelligence ».

> Ces 4 éléments suffisent à faire une démo convaincante de bout en bout.

## 2. INDISPENSABLE (sans ça, on perd des points clés)
- PWA installable + **mode hors-ligne** (format obligatoire du sujet).
- **Lien panne → pièce** (demande de pièce créée depuis le diagnostic).
- **Workflow 7 étapes** visible (même si l'avancement est manuel/simplifié).
- Données seed réalistes (dashboards qui ne sont pas vides).
- README + doc technique (livrables notés).

## 3. ABANDONNABLE si le temps manque (sans casser la démo)
- Maintenance **prédictive** (trop coûteux en données/modèle).
- **Signalement vocal** (faible valeur jury).
- RLS complet / multi-rôles fins (garder l'anon key + 1 rôle pour la démo).
- Notifications temps réel.
- QR code tracking (sympa mais optionnel).
- PUT/DELETE exhaustifs sur toutes les entités.

## Définition de « fini » pour la démo
- [ ] Je peux ajouter un équipement.
- [ ] Je déclare une panne avec 3 photos guidées.
- [ ] L'IA renvoie diagnostic + pièces + gravité.
- [ ] Je crée une demande de pièce en 1 clic.
- [ ] Le workflow montre l'avancement.
- [ ] Le dashboard affiche tendances + top équipements + pièces demandées.
- [ ] L'app s'installe et s'ouvre **hors-ligne**.
