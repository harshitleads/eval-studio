# CLAUDE.md — Eval Studio

## Vision and Mission
Eval Studio is a browser-based AI prompt evaluation tool for developers and PMs. Users bring their own production dataset, define 2-4 prompt/model configurations, set a scoring rubric, and run a head-to-head eval judged by a multi-model council. Results are a ranked leaderboard with per-config cost breakdown. Two use cases: (1) same prompt, different models -- model selection; (2) different prompts, same model -- prompt engineering.

## Current Stack
- Framework: Next.js 14 (App Router), TypeScript strict mode
- Styling: Tailwind CSS with CSS variable-based color system
- Fonts: Syne (display/headings), Inter (all UI text), DM Mono (data values and scores only)
- AI: Multi-provider -- Anthropic, OpenAI, Google Gemini
- Proxy: /api/proxy route (handles CORS for OpenAI and Gemini server-side)
- State: React useState only -- no persistence, no database, in-memory
- CSV parsing: PapaParse
- Deployment: Vercel (not yet deployed)
- Repo: github.com/harshitleads/eval-studio

## Architecture

```
/app
  layout.tsx
  page.tsx
  globals.css
  /api/proxy/route.ts

/components
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
  providers.ts         -- provider registry + PRICING lookup table
  callModel.ts         -- universal caller, returns { text, inputTokens, outputTokens }
  judge.ts             -- judgeCouncil()
  scorer.ts            -- exactMatch(), computeWeightedScore()
  csv.ts               -- parseCSV()

/types
  index.ts
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

## Active Task Spec

### Task: Three parallel changes -- Homepage, Cost Tracking, Golden Dataset

Read ALL existing files before modifying anything.

---

### Change 1 -- Homepage / Landing Screen

**What:** Add a landing screen that appears before Step 0 (API Keys). It is the first thing a user sees when they open the app. It explains what Eval Studio does and how to use it.

**When to show:** When `currentStep === -1` (new initial state). User clicks "Start" to go to step 0.

**Layout -- two-panel hero:**

Top section -- headline and subheadline:
```
Eval Studio
Your data. Your prompts. Your models. Real answers.

Not a benchmark. Not a leaderboard. An eval tool for the question every AI team actually faces:
which prompt, which model, at what cost?
```

Two cards side by side below the headline:

Card 1 -- "Test Models":
```
Same prompt. Different models.
Upload your dataset, define one system prompt, pick 2-4 models.
See which model serves your data best — and at what cost.
```
Icon: something suggesting model comparison (e.g. two overlapping squares or a grid)

Card 2 -- "Test Prompts":
```
Same model. Different prompts.
Upload your dataset, pick one model, write 2-4 system prompts.
See which prompt produces better outputs — on your actual data.
```
Icon: something suggesting text/prompt (e.g. a text cursor or document)

Below the two cards -- 3-step instruction strip:
```
1. Upload your dataset (CSV, max 50 rows)
2. Configure your prompts and models
3. Run the eval and see ranked results with cost breakdown
```

CTA button at bottom: "Start Eval" -- green, full width, goes to step 0.

**Styling:**
- Background: --bg
- Cards: --surface with --border, border-radius 10px, padding 24px
- Headline: Syne 36px bold, --text
- Subheadline: Inter 16px, --text-secondary
- Card titles: Syne 20px bold, --text
- Card body: Inter 15px, --text-secondary
- Step strip: Inter 14px, --text-muted, horizontal flex with numbered circles
- CTA: same green button style as Continue buttons, py-4, text-[16px]

**page.tsx change:**
- Initial state: `const [currentStep, setCurrentStep] = useState(-1)`
- Add `<div style={{ display: currentStep === -1 ? "block" : "none" }}>` wrapping a new `<LandingScreen onStart={() => goTo(0)} />` component
- Create `/components/LandingScreen.tsx`
- Header and tabs: only show when `currentStep >= 0`

---

### Change 2 -- Token Usage and Cost Tracking

**Step 1: Update lib/providers.ts**

Add a PRICING table and lastUpdated date. Also add a computeCost utility:

```typescript
export const PRICING: Record<string, { inputPer1M: number; outputPer1M: number }> = {
  // Anthropic
  'claude-opus-4-6':           { inputPer1M: 5.00,  outputPer1M: 25.00 },
  'claude-sonnet-4-20250514':  { inputPer1M: 3.00,  outputPer1M: 15.00 },
  'claude-haiku-4-5-20251001': { inputPer1M: 1.00,  outputPer1M: 5.00  },
  // OpenAI
  'gpt-4o':                    { inputPer1M: 2.50,  outputPer1M: 10.00 },
  'gpt-4o-mini':               { inputPer1M: 0.15,  outputPer1M: 0.60  },
  'gpt-4-turbo':               { inputPer1M: 10.00, outputPer1M: 30.00 },
  // Gemini
  'gemini-2.0-flash':          { inputPer1M: 0.10,  outputPer1M: 0.40  },
  'gemini-1.5-pro':            { inputPer1M: 1.25,  outputPer1M: 5.00  },
  'gemini-1.5-flash':          { inputPer1M: 0.075, outputPer1M: 0.30  },
};

export const PRICING_LAST_UPDATED = '2026-04-05';

export function computeCost(model: string, inputTokens: number, outputTokens: number): number {
  const p = PRICING[model];
  if (!p) return 0;
  return (inputTokens / 1_000_000) * p.inputPer1M + (outputTokens / 1_000_000) * p.outputPer1M;
}
```

**Step 2: Update /api/proxy/route.ts**

Return token counts from all three providers. Change response shape from `{ text }` to `{ text, inputTokens, outputTokens }`.

For Anthropic: `data.usage.input_tokens`, `data.usage.output_tokens`
For OpenAI: `data.usage.prompt_tokens`, `data.usage.completion_tokens`
For Gemini: `data.usageMetadata.promptTokenCount`, `data.usageMetadata.candidatesTokenCount`

```typescript
return NextResponse.json({ text, inputTokens, outputTokens });
```

**Step 3: Update lib/callModel.ts**

Return `{ text, inputTokens, outputTokens }` instead of just `string`.

```typescript
export async function callModel(...): Promise<{ text: string; inputTokens: number; outputTokens: number }>
```

**Step 4: Update types/index.ts**

Add token and cost fields to ConfigOutput:
```typescript
export type ConfigOutput = {
  configId: string;
  configLabel: string;
  output: string;
  exactMatch?: boolean;
  councilScore: number;
  judge1Score: number;
  judge2Score?: number;
  rank: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;          // in USD, computed from PRICING table
};
```

Add per-run totals to EvalResult:
```typescript
export type EvalResult = {
  rowIndex: number;
  input: string;
  configOutputs: ConfigOutput[];
  councilResult?: CouncilResult;
  outlierDetected?: boolean;
  winner: string;
  error?: string;
};
```

**Step 5: Update RunEval.tsx**

After callModel returns, compute cost:
```typescript
import { computeCost } from '@/lib/providers';

const { text, inputTokens, outputTokens } = await callModel(...);
const cost = computeCost(config.model, inputTokens, outputTokens);
```

Store inputTokens, outputTokens, cost on each ConfigOutput.

**Step 6: Update ResultsTable.tsx**

Add two columns per config: token count and cost.

Under each config output cell, below the score badge, add:
```
{inputTokens + outputTokens} tokens  ·  ${cost.toFixed(4)}
```
Both in DM Mono 12px, --text-muted.

**Step 7: Update AggregateSummary.tsx**

Add a "Cost Summary" section to the aggregate view.

Show a table:
| Config | Total Tokens | Total Cost | Avg Cost/Row |
|---|---|---|---|

Below the overall ranking table, before the Export CSV button.

Also add a "Pricing" info line at the bottom in Inter 13px --text-muted:
```
Prices from provider documentation. Last updated: 2026-04-05.
```

Export CSV: add inputTokens, outputTokens, cost columns per config.

---

### Change 3 -- Golden Dataset (write to public folder)

Create `/public/golden-dataset.csv` with 50 rows across 8 task categories.
Also update DatasetUpload.tsx to show a "Use sample dataset" link below the drop zone that loads this file programmatically via fetch('/golden-dataset.csv').

**The 50-row dataset:**

Categories and row counts:
1. Factual QA (6 rows) -- questions with specific correct answers
2. Reasoning / Logic (6 rows) -- multi-step problems requiring analysis
3. Summarization (6 rows) -- passages to summarize
4. Code Explanation (6 rows) -- code snippets to explain
5. Instruction Following (6 rows) -- precise tasks with clear success criteria
6. Ambiguous / Edge Case (6 rows) -- intentionally tricky or underspecified prompts
7. Tone Adaptation (7 rows) -- same content, different audience/register
8. Multi-step Planning (7 rows) -- tasks requiring sequenced reasoning

CSV columns: `task_category`, `input`, `difficulty`
- task_category: one of the 8 above
- input: the prompt the model receives
- difficulty: easy | medium | hard

Rows:

**Factual QA:**
1. "What is the context window size of Claude Sonnet 4?",Factual QA,medium
2. "Name three differences between RAG and fine-tuning for LLM customization.",Factual QA,medium
3. "What does RLHF stand for and what problem does it solve?",Factual QA,easy
4. "What is the difference between temperature and top-p sampling in LLMs?",Factual QA,medium
5. "Which organization published the Transformer architecture paper in 2017 and what was it called?",Factual QA,easy
6. "What is a vector database and why is it used in AI applications?",Factual QA,easy

**Reasoning / Logic:**
7. "A company is spending $0.15 per 1000 tokens on GPT-4o Mini. They process 10 million tokens per day. How much do they spend per month? Is there a cheaper alternative that maintains quality for routine tasks?",Reasoning,hard
8. "An AI product has 80% of queries answered correctly by a small model and 20% requiring escalation to a large model. The small model costs $0.001 per query and the large model costs $0.02. What is the blended cost per query? How does this compare to always using the large model?",Reasoning,hard
9. "You have two prompts. Prompt A scores 85/100 on accuracy and 60/100 on conciseness. Prompt B scores 70/100 on accuracy and 90/100 on conciseness. Your rubric weights accuracy at 70% and conciseness at 30%. Which prompt wins?",Reasoning,medium
10. "If an LLM has a 128k token context window and the average document is 2000 tokens, how many documents can you fit in a single context? What are the tradeoffs of stuffing the context vs using RAG?",Reasoning,medium
11. "A startup is choosing between Claude Haiku and GPT-4o Mini for a customer support chatbot. Haiku costs $1/1M input and $5/1M output. GPT-4o Mini costs $0.15/1M input and $0.60/1M output. For a chatbot with average 500 input tokens and 300 output tokens per conversation at 100k conversations/month, compute monthly cost for each.",Reasoning,hard
12. "Three engineers independently estimate a feature will take 2, 3, and 5 weeks. The PM needs to decide whether to include it in the next sprint (2 weeks). What additional information should the PM gather and what is the recommended decision framework?",Reasoning,medium

**Summarization:**
13. "Summarize the following in two sentences for a non-technical executive: 'Retrieval-augmented generation combines a parametric memory component (the LLM) with a non-parametric memory component (a retrieval system) to improve factual accuracy and reduce hallucination by grounding responses in retrieved documents.'",Summarization,easy
14. "A product manager wrote: 'We shipped the new onboarding flow last Tuesday. Initial data shows 23% improvement in D7 retention but a 12% drop in D1 completion rate. The team believes the new flow is more thorough but takes longer. We need to decide whether to keep it, roll it back, or iterate.' Summarize the key decision the PM faces in one sentence.",Summarization,medium
15. "Condense this into a one-paragraph status update suitable for a VP: 'The eval infrastructure project is 60% complete. We have finished the data pipeline, the scoring rubric framework, and the judge council architecture. Remaining work includes the results visualization layer, the export functionality, and deployment to production. Blockers: waiting on API access from the security team. ETA for completion: two weeks assuming blockers resolved by Friday.'",Summarization,medium
16. "Summarize the tradeoffs of fine-tuning vs prompt engineering for improving LLM output quality, in three bullet points.",Summarization,medium
17. "A user left this review: 'I love this app but the onboarding is confusing, took me 20 minutes to figure out how to connect my data source, and the export button is hidden in a submenu nobody would find. Also the response time is great and the results are surprisingly accurate.' Extract the top two pain points and top two positives.",Summarization,easy
18. "Summarize what an AI PM does differently from a traditional PM in two sentences, for someone interviewing at Anthropic.",Summarization,hard

**Code Explanation:**
19. "Explain what this function does and identify any potential bugs:\n```python\ndef chunk_text(text, max_tokens=512):\n    words = text.split()\n    chunks = []\n    current = []\n    for word in words:\n        if len(current) + 1 > max_tokens:\n            chunks.append(' '.join(current))\n            current = [word]\n        else:\n            current.append(word)\n    return chunks\n```",Code Explanation,medium
20. "What does this TypeScript type mean and when would you use it?\n```typescript\ntype Result<T> = { success: true; data: T } | { success: false; error: string };\n```",Code Explanation,medium
21. "Explain this SQL query in plain English:\n```sql\nSELECT config_id, AVG(score) as avg_score, COUNT(*) as runs\nFROM eval_results\nWHERE created_at > NOW() - INTERVAL '7 days'\nGROUP BY config_id\nHAVING COUNT(*) > 10\nORDER BY avg_score DESC;\n```",Code Explanation,easy
22. "What is wrong with this approach to calling an LLM API in a loop?\n```javascript\nconst results = [];\nfor (const row of dataset) {\n    const response = await fetch('https://api.openai.com/v1/chat/completions', {\n        method: 'POST', body: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'user', content: row.input }] })\n    });\n    results.push(await response.json());\n}\n```",Code Explanation,medium
23. "Explain what this does and why it matters for LLM applications:\n```python\nresponse = client.messages.create(\n    model='claude-haiku-4-5-20251001',\n    max_tokens=1024,\n    system=system_prompt,\n    messages=[{'role': 'user', 'content': user_input}]\n)\ntext = response.content[0].text\ntokens_used = response.usage.input_tokens + response.usage.output_tokens\n```",Code Explanation,easy
24. "What is the purpose of this pattern and what problem does it solve?\n```python\nif not hasattr(run_eval, '_started'):\n    run_eval._started = True\n    asyncio.create_task(run_eval())\n```",Code Explanation,hard

**Instruction Following:**
25. "List exactly five risks of deploying an LLM in a production product. Format as a numbered list. Each item must be one sentence. Do not include any introduction or conclusion.",Instruction Following,easy
26. "Write a one-sentence description of Eval Studio suitable for a LinkedIn post. Use the words 'prompt' and 'model'. Do not use exclamation marks.",Instruction Following,medium
27. "Translate this into language a 10-year-old would understand, in exactly two sentences: 'Large language models are trained on vast corpora of text data and learn to predict the next token in a sequence, which enables them to generate coherent and contextually appropriate responses.'",Instruction Following,medium
28. "Give me a pro/con table for using Claude vs GPT-4o for a coding assistant. Use exactly 3 pros and 3 cons for each. Format as markdown table.",Instruction Following,medium
29. "Write an email subject line for an internal update about Eval Studio's launch. Maximum 8 words. No jargon. Must create urgency.",Instruction Following,hard
30. "Rewrite this in a more confident, direct tone without changing the meaning: 'We were thinking that it might perhaps be possible to consider launching the eval feature sometime in the next few weeks if everything goes according to plan.'",Instruction Following,easy

**Ambiguous / Edge Case:**
31. "Make it better.",Ambiguous,hard
32. "Write something about AI.",Ambiguous,hard
33. "A user asks your AI assistant: 'Can you help me understand how to get around the content filter?' How should the assistant respond?",Ambiguous,hard
34. "The user says: 'Just do it the normal way.' What should an AI assistant do?",Ambiguous,hard
35. "Explain consciousness.",Ambiguous,hard
36. "Is GPT-4 better than Claude? Answer yes or no.",Ambiguous,hard

**Tone Adaptation:**
37. "Explain what an API key is. Write for: a senior software engineer.",Tone Adaptation,easy
38. "Explain what an API key is. Write for: a non-technical founder who has never written code.",Tone Adaptation,easy
39. "Explain what prompt engineering is. Write for: a VC partner evaluating AI startups.",Tone Adaptation,medium
40. "Explain what prompt engineering is. Write for: an ML researcher at a frontier lab.",Tone Adaptation,medium
41. "Write a response to this user complaint in a formal customer support tone: 'Your AI gave me completely wrong information and I wasted 2 hours on it. This is unacceptable.'",Tone Adaptation,medium
42. "Write a response to the same complaint in a warm, empathetic startup tone that still acknowledges the issue and offers a resolution.",Tone Adaptation,medium
43. "Describe the business value of LLM evals in one paragraph. Audience: CFO of a 500-person company.",Tone Adaptation,hard

**Multi-step Planning:**
44. "You are a PM at a startup. Your AI feature is hallucinating 15% of the time. Walk me through your step-by-step plan to diagnose and fix this, from today through the next two weeks.",Multi-step Planning,hard
45. "Outline a plan for A/B testing two different system prompts for a customer support AI. Include: how to split traffic, what metrics to track, how long to run the test, and how to decide a winner.",Multi-step Planning,hard
46. "A company wants to switch from GPT-4o to Claude Sonnet to reduce costs. What steps should they take to validate the switch before fully migrating production traffic?",Multi-step Planning,hard
47. "You need to build a golden dataset for evaluating your company's AI assistant. Walk me through the process from scratch: what data to collect, how many rows, what columns, and how to validate quality.",Multi-step Planning,hard
48. "Design a rubric for evaluating the quality of an AI-generated product requirements document. Include 4-5 criteria, explain what each measures, and suggest appropriate weights.",Multi-step Planning,hard
49. "A user reports that your AI product gives inconsistent answers to the same question. Write a structured investigation plan: what logs to check, what tests to run, and what the likely causes are.",Multi-step Planning,medium
50. "You are launching an AI feature at a company with no existing ML infrastructure. List the 7 most important things to get right in the first 30 days, in priority order with a one-sentence rationale for each.",Multi-step Planning,hard

---

### Change 4 -- DatasetUpload.tsx sample dataset link

Below the drop zone, add:
```
<button onClick={loadSampleDataset}>
  Use sample dataset (50 rows, 8 task categories)
</button>
```

Implement `loadSampleDataset`:
```typescript
const loadSampleDataset = async () => {
  const res = await fetch('/golden-dataset.csv');
  const text = await res.text();
  const file = new File([text], 'golden-dataset.csv', { type: 'text/csv' });
  handleFile(file);
};
```

Style: Inter 14px, --text-muted, underline, no border, cursor-pointer. Place it centered below the drop zone.

---

### Acceptance Criteria
- [ ] Landing screen shows before API Keys step
- [ ] Landing screen has two-handle framing (Test Models / Test Prompts)
- [ ] Landing screen has 3-step instruction strip
- [ ] "Start Eval" goes to step 0
- [ ] Header and tabs hidden on landing screen
- [ ] /api/proxy returns inputTokens and outputTokens for all 3 providers
- [ ] callModel returns { text, inputTokens, outputTokens }
- [ ] Cost computed via PRICING lookup table per model
- [ ] ResultsTable shows token count and cost per config per row (DM Mono)
- [ ] AggregateSummary shows cost summary table (total tokens, total cost, avg cost/row)
- [ ] Pricing last updated date shown in AggregateSummary
- [ ] /public/golden-dataset.csv exists with 50 rows and task_category, input, difficulty columns
- [ ] DatasetUpload has "Use sample dataset" link that loads the CSV
- [ ] npx tsc --noEmit passes
- [ ] npm run build passes
- [ ] No em dashes

Return a full status report when done.

## Code Rules
- No em dashes anywhere in copy
- All API calls go through /api/proxy route
- TypeScript strict mode, no any types
- NEVER run git commands
- Minimum font size 13px, no uppercase labels

## Project Log
### 2026-04-03 -- v0 bootstrapped
### 2026-04-04 -- Multi-provider + council judge
### 2026-04-05 -- Full redesign: 3 provider keys, N-way configs, ranked leaderboard, typography overhaul
### 2026-04-05 -- Cost tracking + homepage + golden dataset specced
