# dev-template

Harshit's standard starting point for all new projects. Clone this template to get the full project structure, workflow commands, and context files set up from day one.

## What's Included

- `.cursorrules` — tells Cursor to read CLAUDE.md automatically at every session start
- `CLAUDE.md` — project intelligence template, fill in per project
- `AGENTS.md` — agent instructions template
- `docs/decisions.md` — product decision log template
- `.claude/commands/` — slash commands for Claude Code workflow
- `.cursor/rules/` — Cursor workflow rules

## Slash Commands

- `/explore` — understand the codebase before touching anything
- `/create-plan` — propose an approach, wait for approval
- `/execute` — build only what was approved
- `/review` — check for errors and quality
- `/document` — update CLAUDE.md with what changed this session

## Repo Files

**CLAUDE.md** — technical context for Claude Code. Fill in stack, architecture, code rules, and known issues when starting a new project.

**docs/decisions.md** — product decision log. Record significant decisions here as you build. Each entry: what was decided, why, what was rejected.

## How to Use

Go to `github.com/harshitleads/dev-template` and click "Use this template" to create a new repo. Never clone directly.
