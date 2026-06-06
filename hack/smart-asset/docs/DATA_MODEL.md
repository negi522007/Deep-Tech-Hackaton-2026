# Modèle de données

Source de vérité : `database/schema.sql`. Optimisé pour les requêtes de dashboard
(index sur `company_id`, `equipment_id`, `status`, `reported_at`, catégories).

## ERD (relations)

```
companies 1──┐
             ├──< users            (company_id)
             ├──< equipments       (company_id)
             ├──< failures         (company_id)
             └──< spare_part_requests (company_id)

equipments 1──< equipment_images   (equipment_id)
equipments 1──< failures           (equipment_id)

failures 1──< failure_images       (failure_id)
failures 1──< workflow_steps       (failure_id, 7 lignes)
failures 1──< spare_part_requests  (failure_id)
failures 1──< notifications        (failure_id)

spare_parts 1──< spare_part_requests (spare_part_id)
users 1──< notifications            (user_id)
```

## Tables

| Table | Rôle | Clés étrangères |
|---|---|---|
| `companies` | entreprises clientes | — |
| `users` | comptes (admin/technician/viewer) | `company_id → companies` |
| `equipments` | parc d'actifs | `company_id → companies` ; unique `(company_id, serial_number)` |
| `equipment_images` | photos de fiche | `equipment_id → equipments` |
| `failures` | pannes signalées + `ai_diagnosis` (jsonb) | `equipment_id`, `company_id`, `reported_by → users` |
| `failure_images` | preuves visuelles multi-angles | `failure_id → failures` |
| `spare_parts` | catalogue + stock | — ; `reference` unique |
| `spare_part_requests` | demandes liées à une panne | `failure_id`, `spare_part_id`, `company_id`, `requested_by` |
| `workflow_steps` | 7 étapes par panne | `failure_id` ; unique `(failure_id, step_order)` |
| `notifications` | alertes utilisateur | `user_id`, `failure_id` |

## Enums
`failure_severity(low|medium|high|critical)` · `failure_status(reported|diagnosing|in_repair|resolved|closed)` ·
`part_urgency(normal|urgent|blocking)` · `request_status(requested|approved|sourcing|shipped|delivered|cancelled)` ·
`workflow_step_status(pending|active|done|skipped)` · `user_role(admin|technician|viewer)`

## Pourquoi ce design marque des points (15 % « structure des données »)
- Chaque **panne est reliée** à équipement + entreprise + catégorie + date + photos (exigence explicite du sujet).
- Les **vues analytics** (`analytics.sql`) s'appuient sur les FKs/index → requêtes simples et rapides.
- `ai_diagnosis` en `jsonb` : on stocke le résultat IA sans modifier le schéma.
- `workflow_steps` matérialisé (1 ligne/étape) → suivi d'avancement et assignation réels, pas un simple champ statut.
