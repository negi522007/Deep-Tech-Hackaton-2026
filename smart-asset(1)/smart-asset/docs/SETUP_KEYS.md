# Guide pas à pas — récupérer les clés API et les placer au bon endroit

Ce guide couvre **exactement** quoi récupérer et **où le coller** dans le projet.

---

## 1) Créer le fichier `.env.local`

Dans le dossier du projet :

`/tmp/workspace/negi522007/Deep-Tech-Hackaton-2026/smart-asset(1)/smart-asset`

copier `.env.example` vers `.env.local` :

```bash
cp .env.example .env.local
```

Ensuite, ouvre le fichier :

`/tmp/workspace/negi522007/Deep-Tech-Hackaton-2026/smart-asset(1)/smart-asset/.env.local`

---

## 2) Récupérer les clés Supabase

1. Va sur [https://supabase.com](https://supabase.com)
2. Crée un projet (ou ouvre un projet existant)
3. Dans le dashboard Supabase :
   - **Project Settings** → **API**
4. Copie ces 3 valeurs :
   - **Project URL**
   - **anon public key**
   - **service_role key**

Colle-les dans `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## 3) Récupérer la clé IA Anthropic (Claude)

1. Va sur [https://console.anthropic.com](https://console.anthropic.com)
2. Crée/ouvre un workspace
3. Ouvre **API Keys**
4. Clique **Create Key**
5. Copie la clé

Colle dans `.env.local` :

```env
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-5
```

> Si `ANTHROPIC_API_KEY` est vide, l’app reste fonctionnelle avec un mock déterministe.

---

## 4) Exécuter la base SQL (obligatoire pour le mode réel)

Dans Supabase → **SQL Editor**, exécuter dans cet ordre :

1. `database/schema.sql`
2. `database/analytics.sql`
3. `database/seed.sql`

Puis créer un bucket Storage public nommé **`evidence`** :

- Supabase → **Storage** → **Create bucket**
- Name: `evidence`
- Public: `true`

---

## 5) Redémarrer l’app localement

Dans le dossier projet :

```bash
npm run dev
```

L’app basculera automatiquement du mode mock vers le mode Supabase réel si les clés sont valides.

---

## 6) Vérification rapide

- `GET /api/equipments` doit retourner `"source":"db"`
- `GET /api/failures` doit retourner `"source":"db"`
- `GET /api/parts` doit retourner `"source":"db"`
- `POST /api/ai/diagnose` doit appeler Claude si `ANTHROPIC_API_KEY` est présent

Si `"source":"demo"` apparaît, vérifie `.env.local` + redémarrage serveur.
