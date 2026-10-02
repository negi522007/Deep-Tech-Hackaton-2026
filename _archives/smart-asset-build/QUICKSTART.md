# Quick Start Checklist

## Before You Code (30 min)

- [ ] Read `Plan_de_Bataille_Hackathon.md` (the strategy)
- [ ] Read `README.md` (this project setup)
- [ ] Understand the three pillars:
  - **Data Model:** Journal of events, not single status fields (see `database/schema.sql`)
  - **Flywheel:** Each diagnosis enriches future predictions
  - **Insight:** Sourcing is the bottleneck (96+ hours avg)

## Setup (15 min)

- [ ] Create Supabase project at https://supabase.com (free tier is fine)
- [ ] Run `database/schema.sql` in Supabase SQL editor
- [ ] Run `database/seed.sql` to load demo data
- [ ] Copy Supabase keys to `.env.local` (see `.env.example`)
- [ ] Get Claude API key from https://console.anthropic.com
- [ ] Add to `.env.local`

## Run (5 min)

```bash
npm install
npm run dev
# Visit http://localhost:3000
```

You should see:
- Hero section explaining the problem
- AI diagnosis demo (from sample data)
- Workflow timeline (7 stages)
- Analytics snapshot (revealing sourcing bottleneck)

## What Works Now

✅ **Demo mode** — fully functional UI showing the full story
✅ **Supabase integration** — schema ready, RLS configured, seed data loaded
✅ **API routes** — `/api/diagnose` (Claude), `/api/workflow` (state transitions)
✅ **Design system** — dark theme (industrial-luxe), dual-theme support
✅ **PWA manifest** — installable on mobile

## What to Build Next (Priority Order)

### Hour 0–4: Validate Data Model
- [ ] Test connecting to your Supabase instance
- [ ] Verify RLS policies (each org sees only its data)
- [ ] Manually insert a test equipment record
- [ ] Confirm demo page reads from your instance (not just sample data)

### Hour 4–16: Failure Reporting Flow
- [ ] Create form component: Equipment selector → Description → Capture guideline
- [ ] Integrate camera capture (browser API)
- [ ] Upload photo to Supabase Storage
- [ ] Create failure record in DB
- [ ] Call `/api/diagnose` endpoint with photo
- [ ] Display AI result, pre-fill part request form

### Hour 16–28: Workflow Live Updates
- [ ] Build admin dashboard: list part requests by status
- [ ] Add state transition buttons (submit → analysis → … → closed)
- [ ] Each click calls `/api/workflow` → creates event → updates status
- [ ] Subscribe to Supabase Realtime to see updates live (demo mode won't show this)
- [ ] Toast/notification when status changes

### Hour 28–38: Analytics Dashboard
- [ ] Query the three views (`v_top_failing_equipment`, `v_top_requested_parts`, `v_avg_time_per_stage`)
- [ ] Build charts showing top failures, most-used parts
- [ ] **Hero chart:** Bar graph of avg time per workflow stage (should show sourcing spike)
- [ ] Add filter by date range, organization

### Hour 38–44: Polish & Testing
- [ ] Test on real mobile (PWA install, camera permission)
- [ ] Dark/light theme toggle works throughout
- [ ] Responsive design (mobile-first)
- [ ] Error states (network down, API fails, bad image) — graceful fallbacks
- [ ] Two rehearsals of the 5-minute demo

### Hour 44–48: Buffer
- [ ] Bug fixes, polish animations, final deploy to Vercel

---

## Key Files to Edit

| File | What | Why |
|---|---|---|
| `src/app/page.tsx` | Home page | Replace demo with real UI components |
| `src/app/(app)/...` | New routes | Dashboard, report, admin pages |
| `src/components/...` | New components | FailureForm, WorkflowBoard, AnalyticsChart |
| `database/schema.sql` | Data model | Already complete, just deploy to Supabase |
| `.env.local` | Secrets | Never commit, Vercel env vars |

## Common Gotchas

### 1. "My demo page is blank"
- Check `.env.local` has SUPABASE_URL and ANON_KEY
- Verify schema.sql was run (tables exist in Supabase)
- Open browser console for errors

### 2. "Diagnosis endpoint returns 500"
- Verify `ANTHROPIC_API_KEY` is set in `.env.local`
- Check the API key is valid (test at https://console.anthropic.com)
- Ensure image base64 is valid JPEG

### 3. "Realtime updates aren't working"
- RLS policies might be blocking. Check Supabase logs.
- Supabase Realtime is opt-in — you need `realtime_subscribe` in RLS policies.
- For demo, render will default to polling (not perfect but works).

### 4. "I need more sample data"
- Edit `database/seed.sql` and re-run it
- Or manually insert in Supabase UI
- Or use the API (once you build the UI forms)

---

## Before 5-Minute Demo

**Rehearse twice:**
1. Live photo → AI diagnoses → part request created
2. Admin changes status → see it update on technician screen
3. Click to analytics → show sourcing time (the insight)

**Have a fallback:**
- If internet drops, demo mode activates (sample data)
- Keep sample data realistic and memorable

**Script (don't improvise):**
- 0:00–0:30 — "In emerging markets, downtime costs less than waiting for parts. This tool reveals where."
- 0:30–2:30 — Show live diagnosis (photo → AI result → part request)
- 2:30–3:30 — Show workflow advancing in real-time
- 3:30–4:30 — Show analytics: sourcing takes 96 hours, everything else takes hours
- 4:30–5:00 — "That data fuels tomorrow's predictions. That's the flywheel."

---

## Deployment (Before Submission)

```bash
# Vercel
vercel deploy

# Or manual
npm run build
npm start
```

Share the URL with your team. Add `.env` secrets to Vercel project settings.

---

**You have the entire skeleton. Now build the screens. Every line of code matters — quality over quantity. Good luck!**
