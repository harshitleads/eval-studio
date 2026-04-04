# CLAUDE.md — Eval Studio

## Vision and Mission
Eval Studio is a browser-based AI prompt evaluation tool for developers and PMs. Users bring their own production dataset, define 2-4 prompt/model configurations, set a scoring rubric, and run a head-to-head eval judged by a multi-model council. Results are a ranked leaderboard with per-config cost breakdown. Two use cases: (1) same prompt, different models -- model selection; (2) different prompts, same model -- prompt engineering.

## Current Stack
- Framework: Next.js 14 (App Router), TypeScript strict mode
- Styling: Tailwind CSS with CSS variable-based color system
- Fonts: Syne (display/headings), Inter (all UI text), DM Mono (data values and scores only)
- AI: Multi-provider -- Anthropic, OpenAI, Google Gemini
- Proxy: /api/proxy route (handles CORS for all providers server-side)
- State: React useState only -- no persistence, no database, in-memory
- CSV parsing: PapaParse
- Deployment: Vercel -- live at eval.harshit.ai
- Repo: github.com/harshitleads/eval-studio

## Architecture

```
/app
  layout.tsx
  page.tsx
  globals.css
  /api/proxy/route.ts

/components
  LandingScreen.tsx
  /ui
    ScoreBadge.tsx
    Spinner.tsx
    Tab.tsx
  /steps
    KeyEntry.tsx
    DatasetUpload.tsx
    ConfigBuilder.tsx
    RubricBuilder.tsx
    RunEval.tsx
  /results
    ResultsTable.tsx
    AggregateSummary.tsx

/lib
  providers.ts         -- provider registry + PRICING lookup table + computeCost()
  callModel.ts         -- universal caller, returns { text, inputTokens, outputTokens }
  judge.ts             -- judgeCouncil()
  scorer.ts            -- exactMatch(), computeWeightedScore()
  csv.ts               -- parseCSV()

/types
  index.ts

/public
  golden-dataset.csv   -- 50-row sample dataset, 8 task categories
```

## Design System

### Colors
```css
--bg: #0a0a0a
--surface: #141414
--card: #1a1a1a
--border: #2a2a2a
--border-interactive: #3a3a3a
--text: #f0f0f0
--text-secondary: #c0c0c0
--text-muted: #909090
--green: #00e87a
--amber: #f59e0b
--red: #f87171
--blue: #38bdf8
```

### Typography rules
- Labels: Inter 13px semibold, --text-secondary. No uppercase.
- Body/descriptions: Inter 14px, --text-secondary
- Inputs/selects: Inter 15px, --text, min height 44px
- Card titles: Syne 18px bold, --text
- Primary buttons: Inter 15px semibold, min height 48px
- DM Mono ONLY for: score numbers, token counts, cost figures, progress counter
- Minimum font size: 13px. No exceptions.

## Shipped Features

### Step flow
- Step -1: LandingScreen (two-handle framing: Test Models / Test Prompts, 3-step strip, Start Eval CTA)
- Step 0: KeyEntry (3 provider cards -- Anthropic/OpenAI/Gemini, accent colors green/blue/amber)
- Step 1: DatasetUpload (CSV drop zone, sample dataset link, column mapping)
- Step 2: ConfigBuilder (2-4 dynamic configs, provider dropdown filters to keyed providers)
- Step 3: RubricBuilder (4 default criteria, Judge Council section with J1/J2 selectors, bias warning)
- Step 4: RunEval (progress bar, results table, aggregate summary, cost tracking)

### Key recovery (RunEval.tsx)
When >= 50% of rows error after eval completes, an inline key-fix panel appears above the aggregate summary:
- Red-bordered card: "API calls failed" title + explanation
- 3 editable key inputs (Anthropic, OpenAI, Gemini) pre-filled with current localKeys
- "Retry with updated keys" button reruns eval without navigating away
- Dismiss x button
- Uses localKeys state override so user never loses dataset/config/rubric state

### Cost tracking
- PRICING lookup table in providers.ts with per-model input/output rates
- computeCost() utility in providers.ts
- /api/proxy returns inputTokens and outputTokens for all 3 providers
- callModel returns { text, inputTokens, outputTokens }
- Per-row cost shown in ResultsTable (DM Mono)
- Cost Summary table in AggregateSummary (Total Tokens, Total Cost, Avg Cost/Row)
- PRICING_LAST_UPDATED = '2026-04-05' shown in footer

### Golden dataset
- /public/golden-dataset.csv: 50 rows, 8 task categories, columns: task_category, input, difficulty
- "Use sample dataset" link in DatasetUpload loads it via fetch('/golden-dataset.csv')

## Code Rules
- No em dashes anywhere in copy
- All API calls go through /api/proxy route
- TypeScript strict mode, no any types
- NEVER run git commands
- Minimum font size 13px, no uppercase labels
- DM Mono only for data values (scores, tokens, costs, progress counter)

## Project Log
### 2026-04-03 -- v0 bootstrapped
### 2026-04-04 -- Multi-provider + council judge
### 2026-04-05 -- Full redesign: 3 provider keys, N-way configs, ranked leaderboard, typography overhaul
### 2026-04-05 -- Cost tracking + homepage + golden dataset shipped
### 2026-04-05 -- API key error recovery panel shipped
### 2026-04-05 -- Deployed to Vercel at eval.harshit.ai
