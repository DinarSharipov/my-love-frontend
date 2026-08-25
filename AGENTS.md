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
- Все модальные окна открывай через переиспользуемый `src/shared/ui/modal/Modal.tsx`: компонент использует React Portal, принимает `children` и `onClose`, закрывается по outside click/Escape и содержит единые open/close-анимации.
- Use RTK Query for server state and Redux Toolkit only for justified client/global state.

## UI

- Keep the cyberpunk visual language and existing UX patterns.
- Use theme tokens from `src/shared/styles/index.css`; avoid hard-coded duplicate colors.
- Use `motion` for declarative UI transitions and `gsap`/`@gsap/react` for complex timelines or imperative animation. Respect reduced-motion preferences.
- Preserve responsive layout, accessibility, and keyboard interaction.

## Backend and configuration

- Backend repository: `/Users/dinarsaripov/projects/my-love`.
- Backend is read-only for frontend tasks: never edit files, migrations, configuration, or run state-changing backend commands in `/Users/dinarsaripov/projects/my-love`.
- Frontend contract source of truth is the deployed Swagger document `https://api.147.45.124.221.sslip.io/docs-json` (Swagger UI: `https://api.147.45.124.221.sslip.io/docs`). Use this document for every contract audit and API generation; local backend Swagger is not a generation source.
- Before implementing API-dependent behavior, inspect the backend for an existing endpoint, DTO, validation, and domain rules. Match its contract; do not invent or mock an API silently.
- If backend support is missing or does not meet the task requirements, stop that part and clearly warn the user about the gap, proposing the needed backend change or a better alternative.
- Put backend-related configuration in `.env` and access client variables through `import.meta.env` (`VITE_` prefix). During development use the repository `.env`; never hard-code URLs or commit secrets.
- Prefer generated RTK Query contracts where applicable. `npm run api:generate` must fetch the fixed deployed Swagger source above before codegen. Do not edit generated code manually.

## Validation

- Keep changes scoped and reuse existing patterns before adding abstractions or dependencies.
- Format all project files according to the repository's Prettier configuration; run `npm run format` after code changes and confirm with `npm run format:check`.
- Do not write unit or end-to-end tests for this project.
- When backend contracts change, regenerate frontend API types from the deployed Swagger source through `npm run api:generate` before adapting the UI.
- Browser QA is performed by the user. The agent must not open or interact with the browser for visual or interaction checks; limit validation to formatting, lint, typecheck, build, and relevant static checks, and clearly report that browser QA remains user-owned.

## Continuity

- Read `docs/IMPLEMENTATION_STATUS.md` before planning substantial work; use `docs/PRODUCT_ROADMAP.md` for product scope.
- After each implementation slice, update the status file with completed work, checks, decisions, blockers, and the recommended next slice.
