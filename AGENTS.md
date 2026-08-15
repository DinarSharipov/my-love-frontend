# AGENTS.md

## Product

Cyberpunk web app for creating a family and managing family life: household tasks, budgets, events, reminders, relationship visualizations, and family psychological well-being. A family may contain first-line members only (partners and their children; no grandparents).

## Stack and architecture

- React + TypeScript + Vite; React Router, Redux Toolkit, RTK Query.
- Follow Feature-Sliced Design: `app → pages → widgets → features → entities → shared`; imports may only point downward.
- Put generic UI primitives in `src/shared/ui`. Move other code to `shared` when it is reused 2–3 times and is genuinely domain-agnostic; keep domain logic in `entities`/`features`.
- Use RTK Query for server state and Redux Toolkit only for justified client/global state.

## UI

- Keep the cyberpunk visual language and existing UX patterns.
- Use theme tokens from `src/shared/styles/index.css`; avoid hard-coded duplicate colors.
- Use `motion` for declarative UI transitions and `gsap`/`@gsap/react` for complex timelines or imperative animation. Respect reduced-motion preferences.
- Preserve responsive layout, accessibility, and keyboard interaction.

## Backend and configuration

- Backend repository: `/Users/dinarsaripov/projects/my-love`.
- Before implementing API-dependent behavior, inspect the backend for an existing endpoint, DTO, validation, and domain rules. Match its contract; do not invent or mock an API silently.
- If backend support is missing, stop that part and clearly propose the needed backend change or a better alternative.
- Put backend-related configuration in `.env` and access client variables through `import.meta.env` (`VITE_` prefix). During development use the repository `.env`; never hard-code URLs or commit secrets.
- Prefer generated RTK Query contracts where applicable (`npm run api:generate`). Do not edit generated code manually.

## Validation

- Keep changes scoped and reuse existing patterns before adding abstractions or dependencies.
- Before completion run the relevant checks; for normal code changes use `npm run typecheck`, `npm run lint`, and `npm run build` when practical.

## Continuity

- Read `docs/IMPLEMENTATION_STATUS.md` before planning substantial work; use `docs/PRODUCT_ROADMAP.md` for product scope.
- After each implementation slice, update the status file with completed work, checks, decisions, blockers, and the recommended next slice.
