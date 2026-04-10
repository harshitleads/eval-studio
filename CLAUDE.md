# CLAUDE.md

## Vision and Mission
Eval Studio is a browser-based AI prompt evaluation tool for developers and PMs. Users bring their own production dataset, define 2-4 prompt/model configurations, set a scoring rubric, and run a head-to-head eval judged by a multi-model council. Results are a ranked leaderboard with per-config cost breakdown.

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

## Code Rules
- No em dashes anywhere in copy
- All API calls go through /api/proxy route
- TypeScript strict mode, no any types
- Minimum font size 13px, no uppercase labels
- DM Mono only for data values (scores, tokens, costs, progress counter)
- NEVER run git commit, git push, git reset, git checkout, or any git write commands
- NEVER delete files unless the task spec explicitly says to delete a specific named file

## Favicon and OG Setup
- Favicon files in `/public/`: `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`
- OG image: `/public/og-image.png` (1200x630)
- All wired up in `app/layout.tsx` metadata icons section
- No PWA manifest -- not needed for this project

## Pricing Data
- Hardcoded in `lib/providers.ts` in the `PRICING` table
- `PRICING_LAST_UPDATED` date string tracks when prices were last verified
- `PRICING_URLS` maps each provider to their pricing page
- Pricing transparency surfaced in AggregateSummary (footer with date + source links) and ResultsTable (cost column tooltip)

## Components
- `components/CaseStudyBubble.tsx` -- floating bottom-right popup linking to harshit.ai/work/eval-studio. Appears after 3s, dismissable, reappears after 7s. Green accent matching app theme.

## Decision Logging
When you make or execute a product or technical decision, append it to `docs/decisions.md` in this format:
```
### YYYY-MM-DD -- Short title
**Decision:** What was decided.
**Why:** The reasoning.
**Rejected:** What alternatives were considered and why they lost.
```

## Pending Work
- Demo mode with pre-loaded mock results (no API key needed for browsing)
- Persistent run history across sessions
- Batch API support for larger datasets

## Completed Work
- 2026-04-03: v0 bootstrapped (Anthropic-only, single judge)
- 2026-04-04: Multi-provider support, council judge architecture, N-way configs, ranked leaderboard
- 2026-04-04: Full redesign, deployed to eval.harshit.ai, GitHub repo configured
- 2026-04-04: Favicon and OG image added to /public
- 2026-04-05: Pricing source links and "last updated" display added to AggregateSummary and ResultsTable
- 2026-04-05: Favicon fixed -- converted from broken JPEG-as-ico to proper PNG/ICO from converter, cleaned up PWA files
- 2026-04-10: Floating case study bubble added (CaseStudyBubble.tsx, wired into page.tsx, bubbleIn keyframe in globals.css)
