# API REST

Base : `/api`. Implémentée en Route Handlers Next.js (`src/app/api/*`).
Chaque route renvoie `{ data, source }` où `source` vaut `"db"` (Supabase) ou `"demo"` (données intégrées).

## Équipements

### `GET /api/equipments`
Liste les équipements.
```json
{ "data": [ { "id":"e1","name":"Convoyeur ligne 1","category":"conveyor","serial_number":"CNV-001", "...": "" } ], "source":"demo" }
```

### `POST /api/equipments`
Crée un équipement.
```json
// body
{ "company_id":"...","name":"Pompe P12","category":"pump","serial_number":"PMP-012","manufacturer":"GRUNDFOS","model":"CR15","purchase_date":"2023-04-01","location":"Hall B" }
// 201
{ "data": { "id":"...", "...": "" }, "source":"db" }
```

### `PUT /api/equipments/:id`
Met à jour un équipement.

## Pannes

### `GET /api/failures`
Liste les pannes (triées par date décroissante).

### `POST /api/failures`
Crée une panne **et initialise les 7 étapes de workflow**.
```json
// body
{ "equipment_id":"e1","company_id":"c1","title":"Roulement bruyant","description":"...","category":"mechanical","severity":"high" }
// 201
{ "data": { "id":"...","status":"reported", "...": "" }, "source":"db" }
```

### `PUT /api/failures/:id`
Met à jour une panne.

### `GET /api/failures/:id/workflow`
Retourne les 7 étapes de workflow de la panne.

### `PATCH /api/failures/:id/workflow`
Fait avancer l’étape active (`next_step_order`).

## Pièces

### `GET /api/parts`
Liste les demandes de pièces.

### `POST /api/parts`
Crée une demande liée à une panne.
```json
// body
{ "failure_id":"f4","spare_part_id":"p4","quantity":2,"urgency":"urgent" }
// 201
{ "data": { "id":"...","status":"requested", "...": "" }, "source":"db" }
```

### `PUT /api/parts/:id`
Met à jour le statut d’une demande et journalise un évènement dans `part_request_events`.

### `GET /api/parts/:id/events`
Retourne l’historique horodaté d’une demande de pièce.

### `POST /api/parts/:id/events`
Ajoute un évènement à l’historique d’une demande.

### `GET /api/spare-parts`
Retourne le catalogue des pièces.

### `GET /api/companies`
Retourne la liste des entreprises.

### `GET /api/analytics`
Retourne les données agrégées dashboard/analytics (vues SQL si Supabase actif).

## IA — Diagnostic

### `POST /api/ai/diagnose`
Analyse une photo + contexte, renvoie un diagnostic structuré (voir `docs/AI.md`).
```json
// body
{ "imageBase64":"<base64 sans préfixe data:>","imageMediaType":"image/jpeg","equipmentName":"Broyeur","category":"hydraulic","description":"fuite visible" }
// 200
{ "diagnosis":"Fuite hydraulique...","probable_causes":["Joint usé","..."],"severity":"critical","confidence":0.85,"recommended_parts":[{"reference":"FLT-HY10","name":"Filtre hydraulique HY-10","reason":"..."}],"recommended_actions":["Dépressuriser le circuit","..."] }
```

### `POST /api/uploads/failure-image`
Upload une photo de panne dans le bucket Supabase Storage `evidence` puis crée une ligne dans `failure_images`.

## Endpoints à ajouter si le temps le permet (PUT/DELETE)
- `PUT /api/failures/:id` (changer statut / avancer le workflow)
- `PUT /api/parts/:id` (mettre à jour `request_status`)
- `DELETE /api/equipments/:id`
Le pattern est identique : lire le body, appeler `sb.from(...).update/delete`, renvoyer `{ data }`.
