# Implementation Plan: Drift — Digital Drift Bottle Platform

## 1. Requirements Restatement

Drift is a single-session web app for exchanging unfinished thoughts with strangers. The loop:
- **Drop** a fragment (text or image) + one emotional tag
- **Claude analyzes** it, extracts emotion + theme, matches against the JSON pool
- **Catch** the matched fragment (shares ONE dimension — emotion OR theme — but diverges on perspective)
- **Respond** with a continuation

No accounts, no auth, no realtime, JSON-on-disk only, runs via `npm run dev`.

---

## 2. File / Folder Structure

```
drift-fragments/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                        # Home
│   ├── drop/page.tsx
│   ├── catch/[id]/page.tsx
│   ├── respond/[id]/page.tsx
│   └── api/
│       ├── fragments/route.ts          # POST: create + analyze + match
│       ├── fragments/[id]/route.ts     # GET: fragment + match
│       ├── match/route.ts              # POST: internal matching
│       └── responses/route.ts         # POST: append response
├── components/
│   ├── home/  (HomeHero, ConceptStrip)
│   ├── drop/  (FragmentComposer, EmotionPicker, ImageDropZone)
│   ├── catch/ (FragmentCard, DriftMeta)
│   ├── respond/ (ResponseComposer)
│   └── ui/   (Button, PaperSurface, Tag, DriftMark)
├── lib/
│   ├── claude/ (client.ts, analyze.ts, match.ts)
│   ├── store/  (fragmentsRepo.ts, fileLock.ts)
│   ├── validation/ (fragmentSchema.ts)
│   └── ids.ts
├── data/
│   ├── fragments.json                  # Runtime DB (gitignored)
│   └── seed.json                       # 12 curated starter fragments (committed)
├── styles/tokens.css
├── scripts/seed.ts
└── .env.local / .env.example
```

---

## 3. Phased Implementation Plan

### Phase 1 — Foundation
1. Initialize Next.js 14 + TS + Tailwind; add `@anthropic-ai/sdk`, `zod`, `nanoid`
2. Define design tokens (`styles/tokens.css`)
3. Set up font pairing (serif display + humanist sans via `next/font`)
4. Build base UI primitives (`Button`, `PaperSurface`, `Tag`, `DriftMark`)

### Phase 2 — Storage & Data Layer
5. Define Zod schemas for `Fragment`, `Response`, `EmotionTag`, `DropInput`
6. Implement fragment repository with atomic file locking (mutex-style, `fs.rename` from temp file)
7. Seed bootstrap via `predev` script — copy `seed.json` → `fragments.json` if missing

### Phase 3 — Claude Integration
8. Anthropic client singleton (reads `ANTHROPIC_API_KEY`, fails fast if missing)
9. `extractEmotionAndTheme()` — Call 1, returns structured `{ emotion, theme, perspectiveSignal }`
10. `selectMatch()` — Call 2, pre-filters to 20 candidates, Claude picks best under "exactly one shared dimension"

### Phase 4 — Pages
11. Home — asymmetric editorial hero, 3-step explainer (no card grid)
12. Drop — narrow-measure textarea, image dropzone, 5-chip emotion picker
13. Catch — `PaperSurface` at `-0.6deg` rotation, drift-in animation, single CTA
14. Respond — matched fragment compact at top, response composer below

### Phase 5 — API Routes
15. `POST /api/fragments` — validate → image handling → analyze → match → persist → return `{ id, matchedWith }`
16. `GET /api/fragments/[id]` — fetch fragment + matched fragment
17. `POST /api/responses` — validate → `appendResponse` under lock

### Phase 6 — Polish & Edge Cases
18. Empty pool fallback to seed pool
19. `prefers-reduced-motion` support
20. Error surfaces (quiet, on-brand — no red toasts)
21. Image safety (MIME sniff, 5MB cap, EXIF strip)
22. In-memory rate limiting on drop/respond routes

---

## 4. Data Model

```jsonc
{
  "fragments": [{
    "id": "frg_8xK2pQ",
    "createdAt": "2026-04-14T18:22:31.000Z",
    "kind": "text",           // "text" | "image" | "mixed"
    "content": { "text": "I keep starting letters I never send.", "imageUrl": null },
    "userTag": "restless",    // user-selected
    "analysis": {
      "emotion": "restless",
      "theme": "unfinished communication",
      "perspectiveSignal": "introspective, written, solitary"
    },
    "matchedWith": "frg_3rT9aB",   // set once at drop time
    "responses": [
      { "id": "rsp_1aB2cD", "createdAt": "...", "text": "Send one. Even the wrong one." }
    ]
  }],
  "meta": { "version": 1, "lastWriteAt": "..." }
}
```

---

## 5. Claude Integration (Two-Call Design)

**Call 1 — Analyze** (`analyze.ts`)
- Extracts: `{ emotion, theme, perspectiveSignal }`
- `max_tokens: 200`, temperature `0.3`, strict JSON, one retry on parse failure

**Call 2 — Match** (`match.ts`)
- Pre-filter pool server-side (max 20 candidates sharing emotion OR theme, exclude self)
- Claude picks the candidate with "exactly one shared dimension, clearly different perspective"
- Returns `{ matchId, reason }`
- Falls back to seed pool if null

**UX**: ~1.5–3s end-to-end, intentional "drifting…" loading state fits the metaphor.

---

## 6. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Concurrent JSON writes corrupting file | High | Atomic write via `fs.rename` from temp + in-process lock |
| Claude returns malformed JSON | Medium | Zod parse + one retry + heuristic fallback |
| Empty pool on first run | Medium | Committed `seed.json` with 12 curated fragments |
| `ANTHROPIC_API_KEY` missing/leaked | High | Validate at startup; `.env.local` gitignored |
| Image upload abuse | Medium | Server-side MIME sniff, 5MB cap, EXIF strip |
| App looks like a template | Medium | Design direction enforced (see below) |

---

## 7. Design Direction

**Style**: Quiet editorial — paper-and-ink physicality, like handwritten letters on a windowsill.

**Palette** (oklch, one accent):
- `--color-paper: oklch(97% 0.012 80)` — warm off-white
- `--color-ink: oklch(22% 0.02 60)` — near-black with warmth
- `--color-ember: oklch(63% 0.16 45)` — single accent, CTA + active chip only
- Subtle per-emotion tints (1px underline only, never fills)

**Typography**: Fraunces/Newsreader (serif display) + Inter Tight (sans UI). Fragment text at 22–28px for slow, literary reading.

**Layout**: Asymmetric hero, matched fragment presented as a slightly rotated `PaperSurface` with layered shadows + SVG grain overlay. No card grids. Ever.

**Motion**: `translateY(12px) → 0` + `opacity 0 → 1` drift-in on catch. All compositor-only (`transform`, `opacity`). Full `prefers-reduced-motion` support.

---

## Status

**WAITING FOR CONFIRMATION**: Proceed with this plan? (yes/no/modify)
