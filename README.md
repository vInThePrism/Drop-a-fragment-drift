# 🌊 Drift — Digital Drift Bottle

> *Drop an unfinished thought into the ocean. Catch one that drifted back.*

Drift is a single-session web app where strangers exchange fragments of feeling — unfinished thoughts, half-written lines, images without context. No accounts. No feeds. Just the quiet act of letting something go and finding something new.

---

## ✨ How It Works

```
You drop a fragment  →  Claude reads it  →  You catch a matched stranger's fragment  →  You respond
```

1. **Drop** — Write a fragment (or upload an image) and tag your emotional state
2. **Analyze** — Claude extracts the emotion, theme, and perspective signal
3. **Match** — Claude finds a fragment that shares *exactly one dimension* but diverges on perspective
4. **Catch** — Read what drifted back to you
5. **Respond** — Leave a continuation for the next person

---

## 🎨 Design

Quiet editorial — paper-and-ink physicality, like handwritten letters on a windowsill.

- **Palette**: warm off-white paper, near-black ink, single ember accent
- **Typography**: Fraunces serif display + Inter Tight for UI
- **Motion**: gentle drift-in animations, compositor-only (`transform` + `opacity`)
- **Layout**: asymmetric, no card grids, ever

---

## 🛠 Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS custom properties |
| AI | Anthropic Claude (Haiku) — 2-call design |
| Storage | JSON on disk with atomic file locking |
| Validation | Zod |

---

## 🚀 Getting Started

### 1. Clone & install

```bash
git clone https://github.com/vInThePrism/Drop-a-fragment-drift.git
cd Drop-a-fragment-drift
npm install
```

### 2. Set up your API key

```bash
cp .env.example .env.local
```

Open `.env.local` and add your [Anthropic API key](https://console.anthropic.com):

```env
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The seed fragments are loaded automatically on first run.

---

## 📁 Project Structure

```
drift-fragments/
├── app/                    # Next.js App Router pages + API routes
│   ├── page.tsx            # Home
│   ├── drop/               # Drop a fragment
│   ├── catch/[id]/         # Catch your match
│   ├── respond/[id]/       # Respond to a fragment
│   └── api/                # fragments + responses endpoints
├── components/             # UI components organized by surface
│   ├── home/
│   ├── drop/
│   ├── catch/
│   ├── respond/
│   └── ui/                 # Primitives: Button, PaperSurface, Tag, DriftMark
├── lib/
│   ├── claude/             # Anthropic client, analyze.ts, match.ts
│   ├── store/              # JSON repo + file locking
│   └── validation/         # Zod schemas
├── data/
│   └── seed.json           # 12 curated starter fragments
└── styles/tokens.css       # Design tokens
```

---

## 🤖 Claude Integration

Two API calls per drop:

**Call 1 — Analyze** (`lib/claude/analyze.ts`)
- Extracts `{ emotion, theme, perspectiveSignal }` from text or image
- Supports multimodal (vision) input

**Call 2 — Match** (`lib/claude/match.ts`)
- Pre-filters up to 20 candidates sharing emotion OR theme
- Claude picks the one with exactly one shared dimension and a clearly different perspective
- Falls back to seed pool if no candidates exist

---

## 🌱 Seed Fragments

12 hand-curated starter fragments ship with the repo so the pool is never empty on first run. They cover the full range of emotion tags: `restless`, `tender`, `grief`, `longing`, `wonder`.

---

## 📝 License

MIT
