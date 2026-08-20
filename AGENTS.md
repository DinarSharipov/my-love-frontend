# AGENTS.md

## Communication

- Always respond to the user only in Russian, including status updates, questions, plans, reports, and final answers.

## Product

Cyberpunk web app for creating a family and managing family life: household tasks, budgets, events, reminders, relationship visualizations, and family psychological well-being. A family may contain first-line members only (partners and their children; no grandparents).

## Stack and architecture

- React + TypeScript + Vite; React Router, Redux Toolkit, RTK Query.
- Follow Feature-Sliced Design: `app → pages → widgets → features → entities → shared`; imports may only point downward.
- Put generic UI primitives in `src/shared/ui`. Move other code to `shared` when it is reused 2–3 times and is genuinely domain-agnostic; keep domain logic in `entities`/`features`.
- Оборачивай самостоятельные визуальные блоки и карточки в общий `AnimatedPanel`; специализированные контейнеры с собственным overflow/layout можно не оборачивать, если это ломает их поведение.
- Use RTK Query for server state and Redux Toolkit only for justified client/global state.

## UI

- Keep the cyberpunk visual language and existing UX patterns.
- Use theme tokens from `src/shared/styles/index.css`; avoid hard-coded duplicate colors.
- Use `motion` for declarative UI transitions and `gsap`/`@gsap/react` for complex timelines or imperative animation. Respect reduced-motion preferences.
- Preserve responsive layout, accessibility, and keyboard interaction.

## Backend and configuration

- Backend repository: `/Users/dinarsaripov/projects/my-love`.
- Backend is read-only for frontend tasks: never edit files, migrations, configuration, or run state-changing backend commands in `/Users/dinarsaripov/projects/my-love`.
- Before implementing API-dependent behavior, inspect the backend for an existing endpoint, DTO, validation, and domain rules. Match its contract; do not invent or mock an API silently.
- If backend support is missing or does not meet the task requirements, stop that part and clearly warn the user about the gap, proposing the needed backend change or a better alternative.
- Put backend-related configuration in `.env` and access client variables through `import.meta.env` (`VITE_` prefix). During development use the repository `.env`; never hard-code URLs or commit secrets.
- Prefer generated RTK Query contracts where applicable (`npm run api:generate`). Do not edit generated code manually.

## Validation

- Keep changes scoped and reuse existing patterns before adding abstractions or dependencies.
- Format all project files according to the repository's Prettier configuration; run `npm run format` after code changes and confirm with `npm run format:check`.
- Do not write unit or end-to-end tests for this project.
- When backend contracts change, regenerate frontend API types through the repository scripts from `package.json`, using `npm run api:generate` before adapting the UI.
- After every implementation slice, run the frontend in the browser and verify every affected route visually: page layout, loading/error/empty states, visible buttons, inputs, keyboard access, and primary interactions. Use Playwright when available; do not consider a slice complete until the affected controls are reachable and work.

## Continuity

- Read `docs/IMPLEMENTATION_STATUS.md` before planning substantial work; use `docs/PRODUCT_ROADMAP.md` for product scope.
- After each implementation slice, update the status file with completed work, checks, decisions, blockers, and the recommended next slice.
