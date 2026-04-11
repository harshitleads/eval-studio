# CLAUDE.md

## Vision and Mission
Eval Studio is a browser-based AI prompt evaluation tool for developers and PMs.

## Current Stack
- Framework: Next.js 14 (App Router), TypeScript strict mode
- Styling: Tailwind CSS with CSS variable-based color system
- Fonts: Syne (display/headings), Inter (all UI text), DM Mono (data values and scores only)
- AI: Multi-provider -- Anthropic, OpenAI, Google Gemini
- Deployment: Vercel -- live at eval.harshit.ai
- Repo: github.com/harshitleads/eval-studio

## Code Rules
- No em dashes anywhere in copy
- All API calls go through /api/proxy route
- TypeScript strict mode, no any types
- Minimum font size 13px, no uppercase labels
- DM Mono only for data values
- NEVER run git commit, git push, git reset, git checkout, or any git write commands
- NEVER delete files unless the task spec explicitly says to delete a specific named file

## Components
- `components/CaseStudyBubble.tsx` — persistent floating popup linking to harshit.ai/work/eval-studio, green accent
- `components/LandingScreen.tsx` — landing page with clean one-line subtitle

## Completed Work
- 2026-04-03: v0 bootstrapped
- 2026-04-04: Multi-provider, council judge, redesign, deployed
- 2026-04-05: Pricing transparency, favicon fix
- 2026-04-10: Landing copy simplified ("Which prompt, which model, at what cost?"), persistent case study bubble on all screens
