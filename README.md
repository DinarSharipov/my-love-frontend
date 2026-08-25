# My Love Frontend

Стартовый шаблон SPA на React, TypeScript и Vite с архитектурой Feature-Sliced Design.

## Стек

- React 19 и React Router 7
- Redux Toolkit и RTK Query
- React Hook Form и Zod
- Tailwind CSS 4
- Motion for React
- Day.js и Lodash
- ESLint (Airbnb) и Prettier

## Команды

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
```

Для запуска требуется Node.js 22.12 или новее.

## Контрактный источник API

Frontend-контракты генерируются только из deployed Swagger: `https://api.147.45.124.221.sslip.io/docs-json`.
Команда `npm run api:generate` сначала загружает этот документ, затем обновляет `src/shared/api/generated/api.ts`.
Сгенерированный файл не редактируется вручную.

## Структура

```text
src/
├── app/       # инициализация приложения, роутер и store
├── pages/     # страницы маршрутов
└── shared/    # переиспользуемая инфраструктура и стили
```

При расширении проекта добавляйте слои `widgets`, `features` и `entities` по мере появления соответствующей бизнес-логики. Каждый слайс экспортирует наружу только публичный API через `index.ts`.

Для импортов из `src` настроен алиас `@`, например: `import { HomePage } from '@/pages/home'`.
