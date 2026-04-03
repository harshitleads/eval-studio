# CLAUDE.md

## Vision and Mission
[What this project does and who it is for. One paragraph.]

## Current Stack
- Framework and language:
- Key dependencies:
- Deployment:
- Repo:
- Domain:

## Architecture
[Key files and folders. What lives where. How main components connect.]

## Code Rules
- No em dashes anywhere in copy
- No placeholder content in production
- Test mobile viewport before shipping
- Handle errors gracefully, never show raw errors to users
- Keep components small and focused on one job
- Delete unused code, no commented-out blocks
- Meaningful commit messages
- NEVER run git commit, git push, git reset, git checkout, or any git write commands. Only the developer commits and pushes manually. This rule has no exceptions.
- NEVER delete files unless the task spec explicitly says to delete a specific named file. If unsure, rename or comment out instead of deleting.

## Decision Logging
When you make or execute a product or technical decision, append it to `docs/decisions.md` in this format:
```
### YYYY-MM-DD -- Short title
**Decision:** What was decided.
**Why:** The reasoning.
**Rejected:** What alternatives were considered and why they lost.
```
This applies to every Claude session touching this project, not just the CTO chat.

## Known Issues and Backlog
[Active tasks. Keep this current.]

## Project Log
[Technical decisions appended here automatically via claude-code-bridge.]
