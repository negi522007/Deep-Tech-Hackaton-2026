# Fonctionnalité IA — Diagnostic de panne sur photo

## Pourquoi cette innovation (meilleur ratio impact/temps)

Parmi les options du sujet, le **Diagnostic IA sur photo** est le meilleur choix
pour 48h, et on le **combine** avec deux quasi-gratuits :

| Innovation | Impact démo | Coût en temps | Verdict |
|---|---|---|---|
| **Diagnostic IA sur photo** | ⭐⭐⭐⭐⭐ « wow » jury, relie photo→pièce | Moyen (1 endpoint + prompt) | ✅ cœur de l'innovation |
| Recommandation de pièces | ⭐⭐⭐⭐ | ~0 (sort du même appel IA) | ✅ inclus dans le JSON |
| Mode hors-ligne | ⭐⭐⭐ | ~0 (déjà fourni par la PWA) | ✅ « gratuit » |
| QR Code tracking | ⭐⭐⭐ | Faible | ↪ option si avance |
| Maintenance prédictive | ⭐⭐⭐⭐ | Élevé (données + modèle) | ❌ risqué en 48h |
| Signalement vocal | ⭐⭐ | Moyen | ❌ peu de valeur jury |

Le diagnostic **produit aussi** les pièces recommandées et le niveau de gravité :
une seule fonctionnalité coche trois cases du barème (Innovation + Fonctionnalités + Données).

## Workflow
```
Photo (capture guidée) ─► base64 ─► POST /api/ai/diagnose
        + contexte (équipement, catégorie, description)
              │
              ▼
        Claude (vision)  ─►  JSON structuré
              │
              ├─ diagnostic + causes + sévérité + confiance
              ├─ pièces recommandées (référence, nom, raison)
              └─ actions recommandées
              │
              ▼
   Stocké dans failures.ai_diagnosis (jsonb) + affiché à l'écran
   1 clic ► crée une spare_part_request liée à la panne
```

## Prompts (voir `src/lib/ai/diagnose.ts`)

**Système** : impose le rôle (ingénieur maintenance senior) + un **schéma JSON strict**
(réponse JSON uniquement, sans Markdown).

**Utilisateur** : `buildUserPrompt({ equipmentName, category, description })` + l'image jointe.

## Sortie JSON (contrat)
```json
{
  "diagnosis": "string",
  "probable_causes": ["string"],
  "severity": "low|medium|high|critical",
  "confidence": 0.0,
  "recommended_parts": [{ "reference":"string","name":"string","reason":"string" }],
  "recommended_actions": ["string"]
}
```

## Robustesse démo
Sans `ANTHROPIC_API_KEY`, `runDiagnosis()` renvoie un **mock déterministe** par
catégorie (mécanique/électrique/hydraulique). La démo fonctionne donc **même sans
réseau ni clé** — zéro risque de plantage devant le jury. Avec la clé, l'appel
réel à Claude prend le relais automatiquement.
