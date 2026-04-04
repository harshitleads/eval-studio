# docs/decisions.md — Eval Studio

### 2026-04-03 -- v0 scope: Anthropic-only
**Decision:** Limit v0 to Anthropic API only (claude-sonnet-4-20250514 for generation, claude-haiku-4-5-20251001 for judging).
**Why:** Multi-provider adds auth complexity and surface area. Anthropic-only ships faster, covers the core eval story, and is enough to demo the concept. Can speak to multi-provider as roadmap in interviews.
**Rejected:** OpenAI + Gemini + Groq in v0 -- too much scope given 12-week deadline.

### 2026-04-03 -- BYO key, client-side only
**Decision:** User provides their own Anthropic API key. Key is stored in React state only, never sent to any backend server. All API calls go directly from the browser to api.anthropic.com.
**Why:** No server cost, no security liability, builds user trust, and is honest about the architecture. Enables the "we'd welcome the audit" copy angle.
**Rejected:** Proxying through a Next.js API route -- adds server cost and requires storing keys server-side.

### 2026-04-03 -- In-memory only, no Supabase for v0
**Decision:** No persistence. Eval run state lives in React useState. Closing the tab clears everything.
**Why:** Database adds setup time, RLS config, and schema decisions that don't affect the core demo. Portfolio reviewers run one session.
**Rejected:** Supabase runs table -- deferred to v1.

### 2026-04-03 -- Clinical Lab dark theme
**Decision:** Dark precision aesthetic (bg #080808, DM Mono for data, Syne for headings, green/amber/red semantic colors).
**Why:** Target audience is engineers and technical PMs at frontier AI companies. Dark terminal aesthetic signals the tool is serious and purpose-built, not a toy. Matches the mental model of internal eval tooling at Anthropic/OpenAI/Meta.
**Rejected:** Minimal editorial (light theme, Notion-style) -- too approachable, loses the "eval tool" signal.

### 2026-04-03 -- Sequential row processing
**Decision:** Process CSV rows one at a time (sequential, not parallel).
**Why:** Avoids Anthropic rate limit errors. Shows live progress after each row. Simpler error handling.
**Rejected:** Parallel processing -- hits rate limits quickly at 3 calls/row x 50 rows.

### 2026-04-04
### 2026-04-04 -- Model council judge architecture designed
**Decision:** Defer multi-provider ensemble judging to v1. Deploy v0 with single Haiku judge first.
**Why:** Multi-provider judge (Claude + Gemini + GPT-4o Mini) requires OpenAI and Google API integrations, 3 key slots in UI, judge aggregation logic, and CORS handling. Adds significant scope. Better to ship v0, validate the core flow, then add council judging as the v1 differentiator.
**The v1 design:** 3 API key slots (generation key, judge key, optional second judge). Independent scoring from 2-3 judges across providers. Aggregate scores with outlier detection (flag if >15 points off peers). Winner confidence tiers: Tie (<3 gap), Lean A/B (3-8 gap), Win A/B (>8 gap). Show per-judge breakdown in expanded row view.
**Rejected:** Building council in v0 -- too much scope, blocks deployment.

### 2026-04-04
### 2026-04-04 -- Multi-provider + model council: building in v0, not deferring
**Decision:** Build multi-provider support and model council judging as part of v0, not v1.
**Why:** The judge bias problem (Claude judging Claude outputs) is a fundamental credibility issue with the product. User correctly identified that a single-model judge from the same provider as the configs is structurally biased. The architecture is clean and modular -- the only engineering addition is a Next.js /api/proxy route to handle CORS for OpenAI and Gemini. Cursor can build this quickly.
**Design:**
- Step 0: Three key slots (Generation Key, Judge 1 Key, Judge 2 Key) each with provider dropdown (Anthropic, OpenAI, Gemini)
- Config A/B: model selector per config, any provider using the Generation Key
- Judge council: two independent judges score outputs, scores averaged, per-judge breakdown shown
- Winner: confidence tiers (Tie <3pts, Lean A/B 3-8pts, Win A/B >8pts)
- Proxy: /api/proxy route handles non-Anthropic API calls server-side to avoid CORS
**Rejected:** Deferring to v1 -- the bias issue makes v0 demos less credible without this fix.

### 2026-04-04
### 2026-04-04 -- N-way config: ranked leaderboard over A vs B table
**Decision:** Results table becomes a per-row ranked leaderboard (1st/2nd/3rd/4th) instead of A vs B columns.
**Why:** With N configs there is no natural A vs B framing. A ranked list is easier to read and scales cleanly from 2 to 4 configs. Gold/silver/bronze rank badges are visually intuitive.
**Rejected:** Horizontal side-by-side output columns for N configs -- overflows on 4 configs, hard to scan.

### 2026-04-04 -- N-way max capped at 4 configs
**Decision:** Maximum 4 configs, minimum 2.
**Why:** 4 configs + 2 judges = 6 API calls per row x 50 rows = 300 calls. Manageable sequentially. 5 configs would be 350 calls and risks rate limit issues on Tier 1 Anthropic accounts (50 RPM). 4 is a clean demo number.
**Rejected:** 5 configs -- rate limit risk at Tier 1, diminishing demo value.

### 2026-04-04 -- Judge prompt: independent N-config scoring replaces pairwise
**Decision:** Judge sees all N outputs and scores each independently (0-100) rather than comparing A vs B.
**Why:** Pairwise comparison doesn't scale to N configs cleanly. Independent scoring is also more credible -- each output is judged on its own merits, not relative to the other. Ranking emerges from scores, not from head-to-head framing.
**Rejected:** Running N*(N-1)/2 pairwise judge calls -- too many API calls, slow, complex aggregation.

### 2026-04-04
### 2026-04-05 -- Key design: 3 provider keys replaces generation+judge slots
**Decision:** One key per provider (Anthropic, OpenAI, Gemini) instead of "generation key + judge 1 key + judge 2 key."
**Why:** The original design had a fundamental bug -- the generation key is provider-specific but configs can pick any provider. A user setting Config A to GPT-4o with an Anthropic generation key would fail silently. One key per provider is cleaner, maps to how users actually hold API keys, and lets configs + judges freely pick any keyed provider.
**Rejected:** Generation key + judge key slots -- key-to-provider mismatch bug, confusing UX.

### 2026-04-05 -- Bias warning: judge-config provider overlap detection
**Decision:** Show amber warning when any judge provider matches any config provider. Silent when all judges use distinct providers from all configs.
**Why:** Research supports that same-provider models show systematic preference for their own outputs. Warn, don't block -- user may have only one API key. Warning is informational and dismissable.
**Rejected:** Blocking same-provider selection entirely -- too restrictive for users with only one key.

### 2026-04-05 -- Judge prompt: independent N-config scoring replaces pairwise A vs B
**Decision:** Judge receives all N outputs and scores each independently (0-100 per criterion). Ranking emerges from scores.
**Why:** Pairwise doesn't scale to N configs. Independent scoring is more credible -- each output judged on its own merits. Cleaner JSON response format.
**Rejected:** N*(N-1)/2 pairwise calls -- too many API calls, slow, complex aggregation.

### 2026-04-05 -- Typography: Inter for UI, DM Mono for data only, min 13px
**Decision:** Inter replaces DM Mono as the primary UI font. DM Mono kept only for score numbers, progress counters, results table data cells. Minimum font size 13px. Labels no longer uppercase.
**Why:** DM Mono at 10-12px on near-black is unreadable. Terminal aesthetic went too far. Inter at readable sizes with proper contrast makes this feel like a real product, not a dev tool mockup.
**Rejected:** Keeping DM Mono everywhere -- bad readability, user feedback confirmed.

### 2026-04-04
### 2026-04-05 -- Cost tracking: hardcoded lookup table with last-updated date
Prices from provider docs as of April 2026. computeCost() in providers.ts takes model + token counts, returns USD. /api/proxy now returns inputTokens + outputTokens for all 3 providers. callModel returns { text, inputTokens, outputTokens }. Cost shown per row in ResultsTable (DM Mono), total cost in AggregateSummary.

### 2026-04-05 -- Homepage: landing screen before API Keys step
New LandingScreen component. Shows before step 0. Two-handle framing: "Test Models" (same prompt, different models) and "Test Prompts" (same model, different prompts). 3-step instruction strip. "Start Eval" CTA. Header and tabs hidden on landing.

### 2026-04-05 -- Golden dataset: 50 rows, 8 task categories
Production-realistic prompts relevant to AI PMs and engineers. Categories: Factual QA, Reasoning, Summarization, Code Explanation, Instruction Following, Ambiguous/Edge Case, Tone Adaptation, Multi-step Planning. Stored in /public/golden-dataset.csv. "Use sample dataset" link in DatasetUpload loads it programmatically.

### 2026-04-05 -- Positioning locked
Not a benchmarking tool. Not MMLU. "Bring your company's real data. Test which prompt and which model serves it best. See the cost." Two handles: model selection + prompt engineering. Multi-agent eval parked as v2.

### 2026-04-04

### 2026-04-03 -- Git and file deletion guardrails in CLAUDE.md
**Decision:** Added two code rules to CLAUDE.md: (1) Never run git commit, push, reset, or any git write commands. (2) Never delete files unless the task spec explicitly names the file. Default to rename or comment out.
**Why:** With Cursor auto-run mode enabled, Claude Code executes without permission prompts. Without guardrails, a poorly scoped prompt could result in destructive commits or file deletions. These rules apply regardless of which chat generates the Cursor prompt.
**Rejected:** Relying on Cursor's sandbox protection alone (tested: sandbox does not block file deletion), disabling auto-run (too much friction for daily workflow).

