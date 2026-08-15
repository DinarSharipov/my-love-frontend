# My Love — статус реализации

Последнее обновление: 15 августа 2026 года.

Этот файл — точка входа для следующей рабочей сессии. Сначала прочитать его и `AGENTS.md`; обращаться к `PRODUCT_ROADMAP.md` только за подробным продуктовым контекстом. После каждого законченного вертикального среза обновлять чек-листы и журнал ниже.

## Текущий фокус

- Этап roadmap: **1 — закрыть уже начатые сценарии**.
- Последний завершённый продуктовый срез: **рабочая dashboard-обвязка MainPage**.
- Следующий рекомендуемый срез: **согласование общих loading/empty/error/optimistic states**.

## Уже было в проекте

- [x] React/TypeScript/Vite, FSD-структура и cyberpunk theme tokens.
- [x] Регистрация, вход, выход, JWT-сессия и закрытые маршруты.
- [x] Поиск пользователей и отправка приглашения в семью.
- [x] Backend приглашений: incoming/outgoing/accept/reject/cancel.
- [x] Backend семейных событий и сгенерированные RTK Query hooks.
- [x] Backend CRUD первой встречи и frontend-виджет чтения.
- [x] Базовые UI-компоненты: button, input, select, table, pagination, calendar, panels/layout.

## Прогресс roadmap

### Этап 0. Контракты и фундамент

- [ ] Роли `PARTNER`/`CHILD`, максимум два партнёра и жизненный цикл семьи.
- [x] Общая membership/role policy на backend.
- [ ] Visibility/consent model для чувствительных данных.
- [x] Единые API errors, money/date conventions и базовые idempotency rules.
- [ ] Notification/outbox contract и scheduled jobs.
- [ ] Недостающие UI primitives; backend e2e-каркас готов.

### Этап 1. Закрыть начатые сценарии

- [x] UI входящих/исходящих приглашений и действий с ними.
- [x] Закрытое приглашение партнёра по email/одноразовой ссылке.
- [x] Полный frontend CRUD первой встречи.
- [x] Рабочий календарь и управление family events.
- [x] Настоящее восстановление пароля через одноразовую ссылку.
- [x] Редактирование профиля через `GET/PATCH /users/me`.
- [x] Смена пароля и управление активными сессиями.
- [x] Dashboard MainPage на поддержанных backend-контрактах.
- [ ] Согласованные loading/empty/error/optimistic states.

### Этапы 2–7

- [ ] Этап 2: dashboard, задачи, покупки и уведомления.
- [ ] Этап 3: финансовый MVP.
- [ ] Этап 4: wellbeing и гармония.
- [ ] Этап 5: дети, питание и семейные рутины.
- [ ] Этап 6: воспоминания и долгосрочная ценность.
- [ ] Этап 7: production readiness.

## Принятые решения

- Семья целевой модели: два взрослых партнёра и их дети; расширенные родственники — только календарные записи/контакты.
- Wellbeing private-by-default: никаких диагнозов, скрытого анализа партнёра, рейтингов или слежения.
- API-контракт проверяется на backend до frontend-реализации; generated RTK Query code вручную не редактируется.
- Для frontend-задач backend read-only: агент только сверяет контракты и останавливает срез при недостающем backend API.
- Основной рекомендуемый family onboarding — закрытое приглашение знакомого партнёра; публичный каталог пока остаётся существующей функцией и будет пересмотрен отдельным срезом.
- Текущий закрытый onboarding использует передаваемую партнёру одноразовую ссылку, привязанную к точному email; автоматическая email-доставка появится после outbox/provider-контракта.
- Визуальную проверку UI выполняет владелец проекта; агент не запускает browser-проверки без нового прямого запроса.

## Известные пробелы

- `MainPage` пока является заглушкой.
- Family events пока не поддерживают recurrence, reminders, all-day и участников; текущий календарь работает с одиночными событиями и максимум 100 записями на видимый диапазон.
- Автоматических frontend-тестов пока нет.

## Журнал сессий

| Дата       | Срез                               | Результат                                                                                                                                                                                                                                                                                          | Проверки                                                                                                                                                                                        | Следующий шаг                                                   |
| ---------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 2026-08-15 | Аудит и roadmap                    | Созданы `PRODUCT_ROADMAP.md`, правила безопасности и этапы 0–7                                                                                                                                                                                                                                     | `git diff --check`                                                                                                                                                                              | Начать первый вертикальный срез                                 |
| 2026-08-15 | Приглашения                        | Добавлены `/family-invitations`, incoming/outgoing states, accept/reject/cancel, навигация и корректная invalidation family/users cache; API error parser вынесен в `shared`                                                                                                                       | `typecheck`, `lint`, `build`; route `200`, API без токена `401`                                                                                                                                 | Реализовать frontend CRUD первой встречи                        |
| 2026-08-15 | Первая встреча                     | Добавлены create/edit/delete, Zod-валидация, подтверждение удаления, понятная ошибка прав и общий `Textarea`; nullable description обработан без правки generated API                                                                                                                              | `typecheck`, `lint`, `build`, `format:check`                                                                                                                                                    | Реализовать календарь и family events                           |
| 2026-08-15 | Backend foundation                 | Добавлены роли/lifecycle семьи, единая membership policy, DB-лимит двух партнёров и изолированный security e2e harness                                                                                                                                                                             | backend `lint`, unit, e2e, `build`                                                                                                                                                              | Унифицировать базовые API-контракты                             |
| 2026-08-15 | Backend API contracts              | Без изменения текущих форм добавлены error codes/details/requestId, общий offset pagination и date/time/money conventions                                                                                                                                                                          | backend `lint`, unit, e2e, `build`                                                                                                                                                              | Cursor pagination, concurrency и idempotency отдельными срезами |
| 2026-08-15 | Семейный календарь                 | Добавлены `/family-calendar`, загрузка событий по видимому диапазону, agenda дня, create/edit/confirm/reject/delete, timezone семьи, optimistic `If-Match`, навигация и адаптация `/families/me` к `403`; OpenAPI nullable-типы и codegen из `.env` синхронизированы                               | frontend `format:check`, `typecheck`, `lint`, `build`; backend `format:check`, `lint`, 24 unit, e2e, `build`; миграции применены                                                                | Реализовать закрытое приглашение партнёра                       |
| 2026-08-15 | Backend concurrency                | В ответы first-date/events добавлен `version`, PATCH поддерживает optional `If-Match`; stale update возвращает `VERSION_CONFLICT` без изменения старых frontend-запросов                                                                                                                           | backend `prisma:generate`, `lint`, unit, e2e, `build`, production Docker build                                                                                                                  | Реализовать транзакционную idempotency для критических команд   |
| 2026-08-15 | Backend idempotency и roadmap sync | Optional `Idempotency-Key` резервирует payload hash и переигрывает сохранённый ответ; этапы backend A–H перенумерованы ровно в frontend 0–7                                                                                                                                                        | backend `prisma:generate`, `lint`, unit, e2e, `build`; сверка обоих roadmap                                                                                                                     | Завершить foundation этапа 0, затем общий этап 1                |
| 2026-08-15 | Закрытые приглашения               | Backend хранит только hash email-bound токена и поддерживает expiry/cooldown/revoke/accept после регистрации; frontend создаёт, копирует и отзывает ссылки, `/join-family` сохраняется через login/register; старый `recipientId` flow сохранён; глобальный scrollbar сделан тоньше в theme colors | frontend `format:check`, `typecheck`, `lint`, `build`; backend `prisma:generate`, `format:check`, `lint`, 24 unit, 3 e2e, `build`, production Docker build; миграция `20260815030000` применена | Реализовать frontend профиля                                    |
| 2026-08-15 | Backend-профиль                    | Добавлены совместимые `GET/PATCH /users/me`, locale, timezone, `version` и optional `If-Match`; email и дата рождения намеренно не меняются общей командой                                                                                                                                         | backend `prisma:generate`, `lint`, 24 unit, 3 e2e, `build`; миграция на чистой БД                                                                                                               | Смена пароля и управление сессиями                              |
| 2026-08-15 | Frontend-профиль                   | `ProfilePage` заменена на загрузку и форму редактирования имени, фамилии, пола, телефона, locale, timezone и описания; данные Redux синхронизируются после сохранения, `If-Match` обрабатывает конфликт версий; email и дата рождения отображаются как read-only                                   | frontend `format:check`, `typecheck`, `lint`, `build`, `git diff --check`; визуальная проверка не выполнялась                                                                                   | Запросить backend-контракт для смены пароля и сессий            |
| 2026-08-15 | Пароль и сессии                    | В `ProfilePage` добавлены смена пароля, список активных сессий с текущим устройством, отзыв одной не-текущей или всех остальных сессий; контракт сверялся с опубликованным Swagger, backend не изменялся                                                                                           | frontend `api:generate`, `format:check`, `typecheck`, `lint`, `build`, `git diff --check`; визуальная проверка не выполнялась                                                                   | Запросить backend-контракт для восстановления пароля            |
| 2026-08-15 | Восстановление пароля              | Legacy `/auth/restore` заменён на generated `POST /auth/password-reset/request`; добавлен `/reset-password?token=...` с подтверждением нового пароля, валидацией токена и понятными success/error states                                                                                           | frontend `api:generate`, `format:check`, `typecheck`, `lint`, `build`, `git diff --check`; визуальная проверка не выполнялась                                                                   | Согласовать общие states и заполнить MainPage                   |
| 2026-08-15 | Dashboard MainPage                 | Убрана заглушка главной страницы; добавлены карточки трекера первой встречи, семейного календаря и переход в календарь. Не добавлялись задачи/покупки/уведомления без соответствующих backend endpoints                                                                                            | frontend `format:check`, `typecheck`, `lint`, `build`, `git diff --check`; визуальная проверка не выполнялась                                                                                   | Согласовать общие loading/empty/error/optimistic states         |
