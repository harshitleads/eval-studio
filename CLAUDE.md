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

---

## ACTIVE TASK: Add Floating Case Study Bubble

### Context
Every sub-site in the portfolio needs a floating popup (bottom-right corner) linking back to its case study on harshit.ai. This helps hiring managers and recruiters discover the product thinking behind the tool. The pattern mirrors the CalendlyBubble on harshit.ai (fixed bottom-right, appears after delay, dismissable, reappears after delay).

### What to Build
Create a new component `components/CaseStudyBubble.tsx` and render it in `app/page.tsx`.

### Component Spec: CaseStudyBubble.tsx

```tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export default function CaseStudyBubble() {
  const [visible, setVisible] = useState(false);
  const reappearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleShow = useCallback((delay: number) => {
    if (reappearTimer.current) clearTimeout(reappearTimer.current);
    reappearTimer.current = setTimeout(() => setVisible(true), delay);
  }, []);

  useEffect(() => {
    scheduleShow(3000);
    return () => {
      if (reappearTimer.current) clearTimeout(reappearTimer.current);
    };
  }, [scheduleShow]);

  function hide() {
    setVisible(false);
    scheduleShow(7000);
  }

  function handleDismiss(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    hide();
  }

  if (!visible) return null;

  return (
    <a
      href="https://harshit.ai/work/eval-studio"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[9999] flex items-center gap-[10px] rounded-2xl border px-4 py-3 no-underline transition-all hover:brightness-110"
      style={{
        background: "rgba(10,10,10,0.95)",
        borderColor: "rgba(255,255,255,0.1)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        animation: "bubbleIn 0.4s ease-out",
      }}
    >
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
        style={{ background: "rgba(0,232,122,0.1)" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green, #00e87a)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      </div>
      <div>
        <p className="text-[13px] font-medium" style={{ color: "#e2e8f0", margin: 0 }}>
          See the product thinking behind this
        </p>
        <p className="text-[11px]" style={{ color: "#94a3b8", margin: 0 }}>
          How I built Eval Studio
        </p>
      </div>
      <button
        onClick={handleDismiss}
        className="ml-1 bg-transparent border-none cursor-pointer text-[16px] leading-none p-0"
        style={{ color: "#64748b" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#e2e8f0")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
        aria-label="Dismiss"
      >
        &#215;
      </button>
    </a>
  );
}
```

### Add the bubbleIn keyframe animation
In `app/globals.css`, add at the bottom (only if not already present):
```css
@keyframes bubbleIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Wire it into the page
In `app/page.tsx`:

1. Add import at top: `import CaseStudyBubble from "@/components/CaseStudyBubble";`

2. The page has multiple return statements (landing screen early return, loading, error, result, input). The bubble must appear on ALL screens. The cleanest approach:
   - Wrap each return in a fragment `<>...</>` if not already wrapped
   - Add `<CaseStudyBubble />` at the end of each return block, inside the fragment

   Example for the landing screen early return:
   ```tsx
   if (currentStep === -1) {
     return (
       <>
         <LandingScreen onStart={() => goTo(0)} />
         <CaseStudyBubble />
       </>
     );
   }
   ```

   And for the main return (the step wizard), add `<CaseStudyBubble />` as the last child inside the outermost `<div>`.

### Mobile Responsiveness
On screens below 640px, the bubble should be full-width at the bottom. Add this to globals.css alongside the keyframe:
```css
@media (max-width: 639px) {
  .fixed.bottom-6.right-6 {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
  }
}
```

### Acceptance Criteria
- [ ] Bubble appears bottom-right after 3 seconds on both landing screen and step screens
- [ ] Clicking the bubble opens https://harshit.ai/work/eval-studio in a new tab
- [ ] Clicking x dismisses it; it reappears after 7 seconds
- [ ] Does not overlap with any existing UI elements
- [ ] Looks consistent with the dark theme (uses CSS variables from the existing design system)
- [ ] Works on mobile (full-width pill at bottom)
- [ ] No em dashes in any copy
- [ ] No TypeScript errors

### Files to Touch
- CREATE: `components/CaseStudyBubble.tsx`
- EDIT: `app/page.tsx` (import + render in all return paths)
- EDIT: `app/globals.css` (keyframe animation + mobile media query, only if not already present)
