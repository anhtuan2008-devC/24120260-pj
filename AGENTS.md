# Agent Instructions (AGENTS.md)

Purpose: concise guidance for AI coding agents working in this repository.

Quick facts
- Project type: exercise repository for a React + Supabase frontend (see [references/paper.md](references/paper.md)).
- Key paths: [references/paper.md](references/paper.md), [README.md](README.md), [src/App.tsx](src/App.tsx), [src/api/employees.ts](src/api/employees.ts), `supabase/` (project assets), `.env` (local secrets - do not commit).
- Tooling: Vite + React + TypeScript. Scripts: `npm run dev`, `npm run build`, `npm run lint`, `npm run preview`.

When you start working
- Read the exercise in [references/paper.md](references/paper.md) before making changes.
- Read [README.md](README.md) for required env vars and Supabase setup.
- Do not add or commit secrets from `.env`, `.env.local`, or other environment files.

What agents should do by default
- Prefer small, reversible changes and open a PR for larger work.
- Link to existing docs instead of duplicating them.
- Keep changes aligned with the exercise scope (list, delete, rename employees).

Developer notes
- Supabase setup steps are documented in [references/paper.md](references/paper.md).
- Supabase client init lives in [src/lib/supabase.ts](src/lib/supabase.ts).
- Data access lives in [src/api/employees.ts](src/api/employees.ts).

If something is missing
- Ask the user to confirm which frontend framework and package manager to use before major re-scaffolding.
