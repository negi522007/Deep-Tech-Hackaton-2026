# Smart Asset Intelligence — Hackathon Project

> **Mission:** Turn equipment failures into structured data. Diagnose damage with AI. Track parts through a 7-stage workflow. Build intelligence from every incident.

## Quick Start

### 1. Setup Environment

```bash
# Clone repo (already in smart-asset-build/)
cd smart-asset-build

# Install dependencies
npm install

# Copy env template
cp .env.example .env.local
```

### 2. Configure Supabase

1. Create a free Supabase project at [supabase.com](https://supabase.com)
2. In Supabase SQL Editor, run the entire contents of `database/schema.sql`
3. Then run `database/seed.sql` to populate demo data
4. Go to **Settings > API** and copy:
   - `NEXT_PUBLIC_SUPABASE_URL` → `.env.local`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `.env.local`
   - `SUPABASE_SERVICE_ROLE_KEY` → `.env.local` (server-side only)

### 3. Configure Claude API

1. Get your API key at [console.anthropic.com](https://console.anthropic.com)
2. Add to `.env.local`:
   ```
   ANTHROPIC_API_KEY=your-key-here
   ```

### 4. Run Locally

```bash
npm run dev
# Open http://localhost:3000
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              Next.js Frontend (PWA)                  │
│     React 18 · Tailwind · Framer Motion            │
│     TypeScript · zustand (state)                     │
└─────────────┬─────────────────────┬─────────────────┘
              │                     │
        ┌─────▼─────┐        ┌──────▼──────────┐
        │  Supabase │        │ API Routes      │
        │ Postgres  │        │ (Next.js)       │
        │ + RLS     │◄───────│                 │
        │           │ write  │ • /api/diagnose │
        │ Auth      │        │ • /api/workflow │
        │ Storage   │        │ • /api/health   │
        │ Realtime  │        └────────┬────────┘
        └───────────┘                 │
                                      ▼
                          ┌───────────────────────┐
                          │  Claude Vision API    │
                          │  (via edge function)  │
                          └───────────────────────┘
```

## Core Concepts

### 1. The Flywheel (Key Differentiator)

```
Failure Photo → AI Diagnosis → Structured Data → Analytics → Predictions
     ↑                                                            │
     └────────────────────── Each cycle improves ────────────────┘
```

**Every failure becomes data.** When you photograph a part, the AI doesn't just display a verdict — it writes a structured record that feeds analytics, which reveals patterns, which powers predictions.

### 2. Multi-Tenant RLS

Each organization sees only its own equipment, failures, and parts. Security is in the database (Row Level Security on Supabase), not in the UI.

### 3. The 7-Stage Workflow

```
submitted → analysis → inspection → validation → sourcing → delivery → closed
```

Not a single status field. An **event log** (`part_request_events`) records every transition with timestamps. This gives you:
- **Timeline visualization** (real-time updates)
- **Analytics on delays** (how long stuck at each stage? — usually sourcing)
- **Audit trail**

### 4. AI Diagnosis as Structured Entry Point

When Claude analyzes a photo, the response isn't just displayed. It:
- Pre-fills the part request form
- Writes to `ai_diagnoses` table
- Enriches the failure categorization
- Becomes part of your training data for tomorrow's predictions

## Key Files

| File | Purpose |
|---|---|
| `src/app/page.tsx` | Demo home page (shows diagnosis, workflow, analytics) |
| `src/app/api/diagnose/route.ts` | AI diagnosis endpoint (Claude Vision) |
| `src/app/api/workflow/route.ts` | Workflow state transition + event logging |
| `database/schema.sql` | Postgres schema (enums, tables, RLS, views) |
| `database/seed.sql` | Demo data (3 orgs, 4 machines, realistic failures) |
| `src/lib/types.ts` | TypeScript interfaces for all entities |
| `src/lib/ai/diagnose.ts` | Claude integration + JSON parsing |
| `src/lib/motion.ts` | Framer Motion choreography library |

## Demo Mode

The home page runs in **demo mode** by default. It shows:
1. **AI Diagnosis Result** — a real-looking damage analysis
2. **Workflow Timeline** — the 7 stages with current progress
3. **Analytics Snapshot** — top failing equipment, most-requested parts, **time per stage** (the insight)

To toggle: check `src/lib/store.ts` → `useAppStore`.

### To Simulate a Real Failure

1. Create a failure record in Supabase (via SQL or future UI)
2. Upload a photo to `media_assets`
3. Call `/api/diagnose` with the photo base64 + failureId
4. Claude will analyze it, write `ai_diagnoses`, and you'll see results in real-time (via Supabase Realtime)

## Design System

- **Font:** Hanken Grotesk (one font, two themes)
- **Dark theme:** Industrial-luxe (cockpit-like, molten orange accent)
- **Light theme:** Editorial bold (paper-white, deep red accent)
- **Animations:** Framer Motion with custom easing curves (not default ease-in-out)
- **Components:** Button, Card, StatusBadge, LoadingSpinner (in `src/components/ui.tsx`)

## Deployment

### Vercel (Recommended)

```bash
# Link repo
vercel link

# Deploy
vercel deploy
```

Vercel will auto-detect Next.js and deploy. Your `.env.local` secrets become Vercel environment variables.

### Manual (Railway, Render, etc.)

1. Set environment variables on platform
2. Run `npm build && npm start`

## Extending the Demo

- **Add real equipment photos:** Replace demo data in `DEMO_MODE_DATA` with real photos
- **Connect real Supabase:** Swap anon key + URL
- **Build missing screens:** Dashboard (list equipment), Report Failure (upload + diagnose), Admin (track requests)
- **PWA features:** Manifest already in `public/`, service worker ready for offline mode

## The Insight (Why This Wins)

Most teams focus on "flashy AI diagnosis" or "ML predictions." **We focus on the supply chain bottleneck.**

The data shows: **sourcing takes 96+ hours on average.** Everything else (analysis, inspection, validation, delivery) is 1–5 hours. That's where you save money in emerging markets with import dependencies.

Our analytics view surfaces this immediately. The jury sees not just "a diagnosis tool," but a tool that reveals the *real* cost drivers in supply chains.

---

**Questions?** Read `Plan_de_Bataille_Hackathon.md` for full strategy. Read `database/schema.sql` for data model details.

**Ready to build?** Your Supabase instance + Claude API key + 48 hours = you're live.
