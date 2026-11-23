# 🧪 TubeNiche Lab

A vibrant YouTube niche research & production planner. Track trendiness, virality, and competition for unlimited niches, then build the complete video production plan — including CapCut workflow steps and every asset you need.

Built with **Next.js 16** + **React 19** + **TypeScript**. Zero UI dependencies, zero database — everything runs client-side.

---

## ✨ Features

### Niche research
- **Unlimited niches** — add as many as you want, fully manual
- **Opportunity score** — weighted blend of trend, virality, and (inverted) competition, with tunable weights
- **Trendiness** — score, momentum (rising/stable/falling), search volume, keyword tags, trend history chart
- **Virality** — viral potential, shareability, avg views, sub growth, winning formats, hook bank
- **Competition** — competition score, saturation, top channel count, views-per-sub, monetization difficulty, content gaps

### Production planning
- **Video ideas backlog** — title, hook, format, CTA, difficulty
- **Content pillars** — recurring series/themes
- **Editing workflow** — 12-step generic pipeline checklist
- **CapCut workflow** — 11-step pipeline mapped to your local automation scripts (`align_beats.ps1`, `rebuild_timeline.ps1`, `finalize_timings.ps1`, `verify_draft.ps1`, …)
- **Asset library** — images, B-roll, music, SFX, fonts, LUTs, tools, stock sources with license, cost, and needed → ready → downloaded status

### Views
| View | What it does |
|---|---|
| **Dashboard** | Stat tiles, portfolio trend, stage funnel, top opportunities, production health gauges, momentum board |
| **Niche Library** | Card grid + table toggle, search, filters (category/stage/momentum), 6 sort modes, bulk delete |
| **Niche Detail** | 7 tabs: Overview · Trend · Virality · Competition · Video Plan · Assets · Activity |
| **Pipeline** | Drag-and-drop Kanban across Idea → Research → Scripted → Recorded → Edited → Published |
| **Compare** | Up to 4 niches side-by-side with radar charts; best value per row highlighted |
| **Asset Library** | Every asset across all niches in one filterable table |
| **Settings** | Score weights, theme, JSON backup/restore, CSV export |

### UX
- Vibrant dark theme (violet → fuchsia → amber gradients) + light mode
- Glassmorphism cards, gradient glow, animated SVG gauges/sparklines/radars
- `Ctrl/⌘ + K` search · `Ctrl/⌘ + N` new niche · `Esc` clear
- Responsive down to mobile
- Autosave to `localStorage`

---

## 🚀 Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

```bash
npm run build && npm start   # production
```

---

## 📦 Deploy

```bash
npm i -g vercel
vercel --prod
```

Or push to GitHub and import at [vercel.com/new](https://vercel.com/new). No environment variables required.

---

## 🗂 Project structure

```
app/
  layout.tsx        # metadata, viewport
  page.tsx          # store provider + app mount
  globals.css       # full design system
components/
  App.tsx           # shell, routing, sidebar, search
  ui.tsx            # Modal, Toast, Field, Slider, CheckRow, TagEditor, Empty, Confirm
  views/
    Dashboard.tsx   # command center
    Library.tsx     # grid + table
    NicheDetail.tsx # 7-tab detail view
    NicheForm.tsx   # create/edit modal
    Pipeline.tsx    # Kanban with drag & drop
    Compare.tsx     # radar comparison
    AssetsView.tsx  # global asset table
    SettingsView.tsx
lib/
  types.ts          # domain model
  scoring.ts        # opportunity score, tiers, progress helpers
  store.tsx         # localStorage store + React context
  charts.tsx        # hand-rolled SVG charts (no deps)
  seed.ts           # blank template + 6 sample niches
```

---

## 💾 Data & backup

All data lives in `localStorage` under `tubeniche-lab:v1`. Nothing is sent anywhere.

**Settings → Data** to export JSON (full backup), export CSV (niche summary), import JSON, restore demo data, or delete everything.

The store (`lib/store.tsx`) is written behind a small API (`addNiche`, `updateNiche`, `removeNiche`, `update`, …) so a cloud backend can be swapped in later without touching the UI.

---

## 🎥 CapCut workflow mapping

The CapCut checklist mirrors the PowerShell pipeline in the parent project folder:

| Step | Script |
|---|---|
| Build timeline from shot list | `rebuild_timeline.ps1` |
| Align VO to beats | `align_beats.ps1` |
| Verify alignment | `check_alignment.ps1` |
| Finalize clip timings | `finalize_timings.ps1` |
| Append stock B-roll | `append_stock.ps1` |
| Fit template / safe zones | `fit_template.ps1` |
| Export draft & verify duration | `verify_draft.ps1` |

Each niche can store its own `projectPath` so the workflow knows where to write.

---

## 🗺 Roadmap

- [ ] YouTube Data API integration for live trend/competition data
- [ ] Cloud sync + accounts (Supabase/Neon)
- [ ] CSV bulk import for niche lists
- [ ] Thumbnail A/B tracker with CTR logging
- [ ] Publish checklist → auto-post to YouTube
