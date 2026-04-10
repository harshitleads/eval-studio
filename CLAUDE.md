# CLAUDE.md

## Vision and Mission
Eval Studio is a browser-based AI prompt evaluation tool for developers and PMs.

## Current Stack
- Framework: Next.js 14 (App Router), TypeScript strict mode
- Styling: Tailwind CSS with CSS variable-based color system
- Deployment: Vercel -- live at eval.harshit.ai
- Repo: github.com/harshitleads/eval-studio

## Code Rules
- No em dashes anywhere in copy
- TypeScript strict mode, no any types
- NEVER run git commit, git push, git reset, git checkout, or any git write commands
- NEVER delete files unless the task spec explicitly says to delete a specific named file

## Components
- `components/CaseStudyBubble.tsx` -- floating case study bubble

## Favicon and OG Setup
- Favicon files in `/public/`
- OG image: `/public/og-image.png` (1200x630)

## Pricing Data
- Hardcoded in `lib/providers.ts` in the `PRICING` table

---

## ACTIVE TASK: Simplify Case Study Bubble — persistent, all pages

### What to Do

**1. Replace `components/CaseStudyBubble.tsx`** with this simplified version (no state, no timers, no dismiss):

```tsx
"use client";

export default function CaseStudyBubble() {
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
    </a>
  );
}
```

**2. In `app/globals.css`**, REMOVE the mobile full-width override if present:
```css
@media (max-width: 639px) {
  .fixed.bottom-6.right-6 {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
  }
}
```
Keep the `bubbleIn` keyframe.

**3. Ensure bubble renders on ALL screens** — it should already be in all return paths from the earlier task. Verify it shows on landing, steps, and results screens.

### Files to Touch (ONLY these)
- EDIT: `components/CaseStudyBubble.tsx`
- EDIT: `app/globals.css` (remove mobile override only)
