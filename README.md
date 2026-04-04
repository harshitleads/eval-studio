# Eval Studio

**Which prompt? Which model? At what cost?**

Every AI team eventually faces the same question. The standard answer is a spreadsheet, a gut feel, or a vibe check. Eval Studio is the other answer.

Upload your real data. Define your criteria. Run a scored, ranked, cost-tracked evaluation across up to 4 prompt and model combinations -- judged by a two-model council to reduce bias.

**Live:** [eval.harshit.ai](https://eval.harshit.ai)

![Eval Studio results page showing ranked leaderboard with cost breakdown](docs/results-screenshot.jpg)

---

## Why I built this

Every AI team I talked to was making prompt and model selection decisions based on vibes, manual review, or generic benchmarks that had nothing to do with their actual product. Evals are the right answer -- but existing tools either require significant engineering setup, test on public benchmarks that don't reflect real use cases, or lock results behind expensive SaaS plans. I wanted a tool I could open in a browser, point at my own data, and get a reproducible, scored, cost-tracked answer in under 5 minutes. So I built it.

---

## The problem it solves

Benchmarks test AI on generic tasks. Your product isn't generic.

When you need to choose between Claude Sonnet and GPT-4o for your specific use case, or decide whether prompt A or prompt B produces better outputs on your actual customer data, there is no standard tool for that. Eval Studio fills that gap -- bring your own data, define what "good" means for your product, and get a ranked, reproducible result.

## Two use cases

**Test Models** -- Same prompt, different models. Upload your dataset, write one system prompt, pick 2-4 models across providers. See which model serves your data best and at what cost.

**Test Prompts** -- Same model, different prompts. Upload your dataset, pick one model, write 2-4 system prompts. See which prompt produces better outputs on your actual data.

## How it works

1. Enter API keys for Anthropic, OpenAI, or Google Gemini (any combination, BYO key)
2. Upload a CSV dataset (max 50 rows) or use the built-in 50-row sample dataset
3. Configure 2-4 prompt/model combinations
4. Define a scoring rubric -- name your criteria, set weights, pick colors
5. Choose your judge council (1-2 models, cross-provider recommended to reduce bias)
6. Run the eval -- each row is scored independently by each judge, scores averaged
7. Get a ranked leaderboard with per-row scores, cost breakdown, outlier flags, and CSV export

## Design decisions worth noting

**Judge council over single judge.** A single model judging its own provider's outputs has a known bias. Eval Studio uses two independent judges, averages their scores, and flags rows where they disagree by more than 15 points. You can pick judges from different providers than your configs.

**Your data, your keys, your cost.** No hosted backend. No stored keys. API calls go through a server-side proxy to handle CORS, but nothing is logged or persisted. The eval runs on your API quota. You see exactly what it costs per config per row.

**Cost tracking built in.** Every eval shows total tokens, total cost, and average cost per row per config. Pricing is pulled from provider documentation and timestamped. Useful when cost is a real selection criterion alongside quality.

**Ranked leaderboard over A vs B.** With N configs, there is no natural A vs B. Results are a ranked list with gold/silver/bronze badges, enabling clean comparison across 2, 3, or 4 configs.

## Stack

Next.js 14, TypeScript strict, Tailwind CSS, Vercel. PapaParse for CSV. No database, no auth, no persistence.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

You'll need at least one API key from Anthropic, OpenAI, or Google to run evals.

---

Built by [Harshit Sharma](https://harshit.ai) as part of a portfolio of AI products demonstrating LLM evals fluency.
