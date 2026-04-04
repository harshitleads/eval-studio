# Eval Studio

A browser-based AI prompt evaluation tool. Upload your dataset, configure 2-4 prompts or models, define a scoring rubric, and run a head-to-head eval judged by a multi-model council. Results are a ranked leaderboard with per-config cost breakdown.

**Live:** [eval.harshit.ai](https://eval.harshit.ai)

## What it does

**Test Models** — Same prompt, different models. See which model serves your data best and at what cost.

**Test Prompts** — Same model, different prompts. See which prompt produces better outputs on your actual data.

## How it works

1. Enter API keys for Anthropic, OpenAI, or Google Gemini
2. Upload a CSV dataset or use the built-in 50-row sample dataset
3. Configure 2-4 prompt/model combinations
4. Define a scoring rubric with weighted criteria
5. Run the eval — a judge council scores each output independently
6. Get a ranked leaderboard with scores, cost breakdown, and CSV export

## Stack

Next.js 14, TypeScript, Tailwind CSS, Vercel. All API calls go through a server-side proxy. Keys are never stored or logged.

## Local development

npm install && npm run dev
