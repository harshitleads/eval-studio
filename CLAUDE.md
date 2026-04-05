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

---

## ACTIVE TASK: Wire up favicon and OG metadata in layout.tsx

The favicon (`/favicon.ico`) and OG image (`/og-image.png`) files are already in the `/public` folder. But the Next.js metadata in `app/layout.tsx` does not reference them.

### Fix

In `app/layout.tsx`, update the `metadata` export to include:

```typescript
export const metadata: Metadata = {
  title: "Eval Studio | AI Prompt Evaluation Platform",
  description: "Browser-based LLM evaluation tool. Test prompts and models on your own data with multi-model judge council, cost tracking, and ranked results.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Eval Studio | AI Prompt Evaluation Platform",
    description: "Which prompt, which model, at what cost? Test prompts and models on your own data with multi-model judge council, cost tracking, and ranked results.",
    url: "https://eval.harshit.ai",
    siteName: "Eval Studio",
    images: [
      {
        url: "https://eval.harshit.ai/og-image.png",
        width: 1200,
        height: 630,
        alt: "Eval Studio - AI Prompt Evaluation Platform",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eval Studio | AI Prompt Evaluation Platform",
    description: "Which prompt, which model, at what cost? Browser-based LLM evaluation with multi-model judge council.",
    images: ["https://eval.harshit.ai/og-image.png"],
  },
};
```

If `metadata` already exists in layout.tsx, merge these fields into it. If it doesn't exist, add it.

### Acceptance criteria
- Favicon shows in browser tab when visiting eval.harshit.ai
- OG image appears when the link is shared on LinkedIn/Twitter/Slack
- Title and description are set in metadata
- Build passes
