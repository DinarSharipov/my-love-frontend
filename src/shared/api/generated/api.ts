import { baseApi as api } from '@/shared/api/baseApi';
export const addTagTypes = [
  'tasks',
  'task-routines',
  'finance',
  'shopping',
  'meals',
  'notifications',
  'reminders',
  'auth',
  'users',
  'telegram',
  'families',
  'family invitations',
  'child-profiles',
  'family events',
  'first date',
  'calendar',
  'wellbeing',
  'health',
] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      create: build.mutation<CreateApiResponse, CreateApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/tasks`,
          method: 'POST',
          body: queryArg.createTaskDto,
        }),
        invalidatesTags: ['tasks'],
      }),
      list: build.query<ListApiResponse, ListApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/tasks`,
          params: {
            page: queryArg.page,
            limit: queryArg.limit,
          },
        }),
        providesTags: ['tasks'],
      }),
      update: build.mutation<UpdateApiResponse, UpdateApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/tasks/${queryArg.id}`,
          method: 'PATCH',
          body: queryArg.updateTaskDto,
        }),
        invalidatesTags: ['tasks'],
      }),
      archive: build.mutation<ArchiveApiResponse, ArchiveApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/tasks/${queryArg.id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['tasks'],
      }),
      complete: build.mutation<CompleteApiResponse, CompleteApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/tasks/${queryArg.id}/complete`,
          method: 'POST',
        }),
        invalidatesTags: ['tasks'],
      }),
      reopen: build.mutation<ReopenApiResponse, ReopenApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/tasks/${queryArg.id}/reopen`,
          method: 'POST',
        }),
        invalidatesTags: ['tasks'],
      }),
      create2: build.mutation<Create2ApiResponse, Create2ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/task-routines`,
          method: 'POST',
          body: queryArg.createTaskRoutineDto,
        }),
        invalidatesTags: ['task-routines'],
      }),
      list2: build.query<List2ApiResponse, List2ApiArg>({
        query: () => ({ url: `/api/v1/families/me/task-routines` }),
        providesTags: ['task-routines'],
      }),
      listArchived: build.query<ListArchivedApiResponse, ListArchivedApiArg>({
        query: () => ({ url: `/api/v1/families/me/task-routines/archived` }),
        providesTags: ['task-routines'],
      }),
      update2: build.mutation<Update2ApiResponse, Update2ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/task-routines/${queryArg.id}`,
          method: 'PATCH',
          body: queryArg.updateTaskRoutineDto,
        }),
        invalidatesTags: ['task-routines'],
      }),
      archive2: build.mutation<Archive2ApiResponse, Archive2ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/task-routines/${queryArg.id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['task-routines'],
      }),
      generate: build.mutation<GenerateApiResponse, GenerateApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/task-routines/${queryArg.id}/generate`,
          method: 'POST',
        }),
        invalidatesTags: ['task-routines'],
      }),
      restore: build.mutation<RestoreApiResponse, RestoreApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/task-routines/${queryArg.id}/restore`,
          method: 'POST',
        }),
        invalidatesTags: ['task-routines'],
      }),
      create3: build.mutation<Create3ApiResponse, Create3ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/wallets`,
          method: 'POST',
          body: queryArg.createWalletDto,
        }),
        invalidatesTags: ['finance'],
      }),
      list3: build.query<List3ApiResponse, List3ApiArg>({
        query: () => ({ url: `/api/v1/families/me/wallets` }),
        providesTags: ['finance'],
      }),
      archived: build.query<ArchivedApiResponse, ArchivedApiArg>({
        query: () => ({ url: `/api/v1/families/me/wallets/archived` }),
        providesTags: ['finance'],
      }),
      getApiV1FamiliesMeWalletsById: build.query<
        GetApiV1FamiliesMeWalletsByIdApiResponse,
        GetApiV1FamiliesMeWalletsByIdApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/families/me/wallets/${queryArg.id}` }),
        providesTags: ['finance'],
      }),
      update3: build.mutation<Update3ApiResponse, Update3ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/wallets/${queryArg.id}`,
          method: 'PATCH',
          body: queryArg.updateWalletDto,
        }),
        invalidatesTags: ['finance'],
      }),
      archive3: build.mutation<Archive3ApiResponse, Archive3ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/wallets/${queryArg.id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['finance'],
      }),
      restore2: build.mutation<Restore2ApiResponse, Restore2ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/wallets/${queryArg.id}/restore`,
          method: 'POST',
        }),
        invalidatesTags: ['finance'],
      }),
      list4: build.query<List4ApiResponse, List4ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/ledger`,
          params: {
            page: queryArg.page,
            limit: queryArg.limit,
            walletId: queryArg.walletId,
          },
        }),
        providesTags: ['finance'],
      }),
      get2: build.query<Get2ApiResponse, Get2ApiArg>({
        query: (queryArg) => ({ url: `/api/v1/families/me/ledger/${queryArg.id}` }),
        providesTags: ['finance'],
      }),
      income: build.mutation<IncomeApiResponse, IncomeApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/ledger/income`,
          method: 'POST',
          body: queryArg.createLedgerCommandDto,
          headers: {
            'Idempotency-Key': queryArg['Idempotency-Key'],
          },
        }),
        invalidatesTags: ['finance'],
      }),
      expense: build.mutation<ExpenseApiResponse, ExpenseApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/ledger/expense`,
          method: 'POST',
          body: queryArg.createLedgerCommandDto,
          headers: {
            'Idempotency-Key': queryArg['Idempotency-Key'],
          },
        }),
        invalidatesTags: ['finance'],
      }),
      transfer: build.mutation<TransferApiResponse, TransferApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/ledger/transfer`,
          method: 'POST',
          body: queryArg.createTransferCommandDto,
          headers: {
            'Idempotency-Key': queryArg['Idempotency-Key'],
          },
        }),
        invalidatesTags: ['finance'],
      }),
      reverse: build.mutation<ReverseApiResponse, ReverseApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/ledger/${queryArg.id}/reversal`,
          method: 'POST',
          body: queryArg.reverseLedgerTransactionDto,
          headers: {
            'Idempotency-Key': queryArg['Idempotency-Key'],
          },
        }),
        invalidatesTags: ['finance'],
      }),
      create4: build.mutation<Create4ApiResponse, Create4ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/financial-categories`,
          method: 'POST',
          body: queryArg.createFinancialCategoryDto,
        }),
        invalidatesTags: ['finance'],
      }),
      list5: build.query<List5ApiResponse, List5ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/financial-categories`,
          params: {
            kind: queryArg.kind,
          },
        }),
        providesTags: ['finance'],
      }),
      archived2: build.query<Archived2ApiResponse, Archived2ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/financial-categories/archived`,
          params: {
            kind: queryArg.kind,
          },
        }),
        providesTags: ['finance'],
      }),
      update4: build.mutation<Update4ApiResponse, Update4ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/financial-categories/${queryArg.id}`,
          method: 'PATCH',
          body: queryArg.updateFinancialCategoryDto,
        }),
        invalidatesTags: ['finance'],
      }),
      archive4: build.mutation<Archive4ApiResponse, Archive4ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/financial-categories/${queryArg.id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['finance'],
      }),
      restore3: build.mutation<Restore3ApiResponse, Restore3ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/financial-categories/${queryArg.id}/restore`,
          method: 'POST',
        }),
        invalidatesTags: ['finance'],
      }),
      create5: build.mutation<Create5ApiResponse, Create5ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/budgets`,
          method: 'POST',
          body: queryArg.createBudgetDto,
        }),
        invalidatesTags: ['finance'],
      }),
      list6: build.query<List6ApiResponse, List6ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/budgets`,
          params: {
            periodStart: queryArg.periodStart,
          },
        }),
        providesTags: ['finance'],
      }),
      update5: build.mutation<Update5ApiResponse, Update5ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/budgets/${queryArg.id}`,
          method: 'PATCH',
          body: queryArg.updateBudgetDto,
        }),
        invalidatesTags: ['finance'],
      }),
      remove: build.mutation<RemoveApiResponse, RemoveApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/budgets/${queryArg.id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['finance'],
      }),
      create6: build.mutation<Create6ApiResponse, Create6ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/recurring-payments`,
          method: 'POST',
          body: queryArg.createRecurringPaymentDto,
        }),
        invalidatesTags: ['finance'],
      }),
      list7: build.query<List7ApiResponse, List7ApiArg>({
        query: () => ({ url: `/api/v1/families/me/recurring-payments` }),
        providesTags: ['finance'],
      }),
      archived3: build.query<Archived3ApiResponse, Archived3ApiArg>({
        query: () => ({ url: `/api/v1/families/me/recurring-payments/archived` }),
        providesTags: ['finance'],
      }),
      forecasts: build.query<ForecastsApiResponse, ForecastsApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/recurring-payments/${queryArg.id}/forecasts`,
        }),
        providesTags: ['finance'],
      }),
      update6: build.mutation<Update6ApiResponse, Update6ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/recurring-payments/${queryArg.id}`,
          method: 'PATCH',
          body: queryArg.updateRecurringPaymentDto,
        }),
        invalidatesTags: ['finance'],
      }),
      archive5: build.mutation<Archive5ApiResponse, Archive5ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/recurring-payments/${queryArg.id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['finance'],
      }),
      restore4: build.mutation<Restore4ApiResponse, Restore4ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/recurring-payments/${queryArg.id}/restore`,
          method: 'POST',
        }),
        invalidatesTags: ['finance'],
      }),
      get3: build.query<Get3ApiResponse, Get3ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/finance/summary`,
          params: {
            periodStart: queryArg.periodStart,
          },
        }),
        providesTags: ['finance'],
      }),
      create7: build.mutation<Create7ApiResponse, Create7ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/financial-goals`,
          method: 'POST',
          body: queryArg.createFinancialGoalDto,
        }),
        invalidatesTags: ['finance'],
      }),
      list8: build.query<List8ApiResponse, List8ApiArg>({
        query: () => ({ url: `/api/v1/families/me/financial-goals` }),
        providesTags: ['finance'],
      }),
      archived4: build.query<Archived4ApiResponse, Archived4ApiArg>({
        query: () => ({ url: `/api/v1/families/me/financial-goals/archived` }),
        providesTags: ['finance'],
      }),
      update7: build.mutation<Update7ApiResponse, Update7ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/financial-goals/${queryArg.id}`,
          method: 'PATCH',
          body: queryArg.updateFinancialGoalDto,
        }),
        invalidatesTags: ['finance'],
      }),
      archive6: build.mutation<Archive6ApiResponse, Archive6ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/financial-goals/${queryArg.id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['finance'],
      }),
      contribute: build.mutation<ContributeApiResponse, ContributeApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/financial-goals/${queryArg.id}/contributions`,
          method: 'POST',
          body: queryArg.createFinancialGoalContributionDto,
          headers: {
            'Idempotency-Key': queryArg['Idempotency-Key'],
          },
        }),
        invalidatesTags: ['finance'],
      }),
      restore5: build.mutation<Restore5ApiResponse, Restore5ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/financial-goals/${queryArg.id}/restore`,
          method: 'POST',
        }),
        invalidatesTags: ['finance'],
      }),
      get4: build.query<Get4ApiResponse, Get4ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/finance/analytics`,
          params: {
            periodStart: queryArg.periodStart,
            months: queryArg.months,
            forecastDays: queryArg.forecastDays,
          },
        }),
        providesTags: ['finance'],
      }),
      create8: build.mutation<Create8ApiResponse, Create8ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/financial-meetings`,
          method: 'POST',
          body: queryArg.createFinancialMeetingDto,
        }),
        invalidatesTags: ['finance'],
      }),
      list9: build.query<List9ApiResponse, List9ApiArg>({
        query: () => ({ url: `/api/v1/families/me/financial-meetings` }),
        providesTags: ['finance'],
      }),
      update8: build.mutation<Update8ApiResponse, Update8ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/financial-meetings/${queryArg.id}`,
          method: 'PATCH',
          body: queryArg.updateFinancialMeetingDto,
        }),
        invalidatesTags: ['finance'],
      }),
      cancel: build.mutation<CancelApiResponse, CancelApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/financial-meetings/${queryArg.id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['finance'],
      }),
      complete2: build.mutation<Complete2ApiResponse, Complete2ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/financial-meetings/${queryArg.id}/complete`,
          method: 'POST',
        }),
        invalidatesTags: ['finance'],
      }),
      createDecision: build.mutation<CreateDecisionApiResponse, CreateDecisionApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/financial-meetings/${queryArg.id}/decisions`,
          method: 'POST',
          body: queryArg.createFinancialDecisionDto,
        }),
        invalidatesTags: ['finance'],
      }),
      respond: build.mutation<RespondApiResponse, RespondApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/financial-meetings/${queryArg.meetingId}/decisions/${queryArg.decisionId}/respond`,
          method: 'POST',
          body: queryArg.respondFinancialDecisionDto,
        }),
        invalidatesTags: ['finance'],
      }),
      get5: build.query<Get5ApiResponse, Get5ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/finance/expense-statistics`,
          params: {
            dateFrom: queryArg.dateFrom,
            dateTo: queryArg.dateTo,
          },
        }),
        providesTags: ['finance'],
      }),
      lists: build.query<ListsApiResponse, ListsApiArg>({
        query: () => ({ url: `/api/v1/families/me/shopping-lists` }),
        providesTags: ['shopping'],
      }),
      create9: build.mutation<Create9ApiResponse, Create9ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/shopping-lists`,
          method: 'POST',
          body: queryArg.createShoppingListDto,
        }),
        invalidatesTags: ['shopping'],
      }),
      archived5: build.query<Archived5ApiResponse, Archived5ApiArg>({
        query: () => ({ url: `/api/v1/families/me/shopping-lists/archived` }),
        providesTags: ['shopping'],
      }),
      add: build.mutation<AddApiResponse, AddApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/shopping-lists/${queryArg.listId}/items`,
          method: 'POST',
          body: queryArg.createShoppingItemDto,
        }),
        invalidatesTags: ['shopping'],
      }),
      check: build.mutation<CheckApiResponse, CheckApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/shopping-lists/${queryArg.listId}/items/${queryArg.itemId}/check`,
          method: 'POST',
        }),
        invalidatesTags: ['shopping'],
      }),
      uncheck: build.mutation<UncheckApiResponse, UncheckApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/shopping-lists/${queryArg.listId}/items/${queryArg.itemId}/uncheck`,
          method: 'POST',
        }),
        invalidatesTags: ['shopping'],
      }),
      archive7: build.mutation<Archive7ApiResponse, Archive7ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/shopping-lists/${queryArg.listId}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['shopping'],
      }),
      restore6: build.mutation<Restore6ApiResponse, Restore6ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/shopping-lists/${queryArg.listId}/restore`,
          method: 'POST',
        }),
        invalidatesTags: ['shopping'],
      }),
      list10: build.query<List10ApiResponse, List10ApiArg>({
        query: () => ({ url: `/api/v1/families/me/recipes` }),
        providesTags: ['meals'],
      }),
      create10: build.mutation<Create10ApiResponse, Create10ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/recipes`,
          method: 'POST',
          body: queryArg.createRecipeDto,
        }),
        invalidatesTags: ['meals'],
      }),
      listArchived2: build.query<ListArchived2ApiResponse, ListArchived2ApiArg>({
        query: () => ({ url: `/api/v1/families/me/recipes/archived` }),
        providesTags: ['meals'],
      }),
      update9: build.mutation<Update9ApiResponse, Update9ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/recipes/${queryArg.id}`,
          method: 'PATCH',
          body: queryArg.updateRecipeDto,
        }),
        invalidatesTags: ['meals'],
      }),
      archive8: build.mutation<Archive8ApiResponse, Archive8ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/recipes/${queryArg.id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['meals'],
      }),
      restore7: build.mutation<Restore7ApiResponse, Restore7ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/recipes/${queryArg.id}/restore`,
          method: 'POST',
        }),
        invalidatesTags: ['meals'],
      }),
      createPlan: build.mutation<CreatePlanApiResponse, CreatePlanApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/recipes/plans`,
          method: 'POST',
          body: queryArg.createMealPlanDto,
        }),
        invalidatesTags: ['meals'],
      }),
      listPlans: build.query<ListPlansApiResponse, ListPlansApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/recipes/plans`,
          params: {
            from: queryArg['from'],
            to: queryArg.to,
          },
        }),
        providesTags: ['meals'],
      }),
      updatePlan: build.mutation<UpdatePlanApiResponse, UpdatePlanApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/recipes/plans/${queryArg.id}`,
          method: 'PATCH',
          body: queryArg.updateMealPlanDto,
        }),
        invalidatesTags: ['meals'],
      }),
      deletePlan: build.mutation<DeletePlanApiResponse, DeletePlanApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/recipes/plans/${queryArg.id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['meals'],
      }),
      generateShopping: build.mutation<GenerateShoppingApiResponse, GenerateShoppingApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/recipes/plans/${queryArg.id}/generate-shopping`,
          method: 'POST',
          body: queryArg.generateShoppingDto,
        }),
        invalidatesTags: ['meals'],
      }),
      preferencesGet: build.query<PreferencesGetApiResponse, PreferencesGetApiArg>({
        query: () => ({ url: `/api/v1/notifications/preferences` }),
        providesTags: ['notifications'],
      }),
      preferencesUpdate: build.mutation<PreferencesUpdateApiResponse, PreferencesUpdateApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/notifications/preferences`,
          method: 'PATCH',
          body: queryArg.updateNotificationPreferencesDto,
        }),
        invalidatesTags: ['notifications'],
      }),
      listPaginated: build.query<ListPaginatedApiResponse, ListPaginatedApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/notifications/page`,
          params: {
            page: queryArg.page,
            limit: queryArg.limit,
          },
        }),
        providesTags: ['notifications'],
      }),
      list11: build.query<List11ApiResponse, List11ApiArg>({
        query: () => ({ url: `/api/v1/notifications` }),
        providesTags: ['notifications'],
      }),
      read: build.mutation<ReadApiResponse, ReadApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/notifications/${queryArg.id}/read`,
          method: 'PATCH',
        }),
        invalidatesTags: ['notifications'],
      }),
      readAll: build.mutation<ReadAllApiResponse, ReadAllApiArg>({
        query: () => ({ url: `/api/v1/notifications/read-all`, method: 'PATCH' }),
        invalidatesTags: ['notifications'],
      }),
      create11: build.mutation<Create11ApiResponse, Create11ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/tasks/${queryArg.taskId}/reminders`,
          method: 'POST',
          body: queryArg.createTaskReminderDto,
        }),
        invalidatesTags: ['reminders'],
      }),
      list12: build.query<List12ApiResponse, List12ApiArg>({
        query: (queryArg) => ({ url: `/api/v1/families/me/tasks/${queryArg.taskId}/reminders` }),
        providesTags: ['reminders'],
      }),
      remove2: build.mutation<Remove2ApiResponse, Remove2ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/tasks/reminders/${queryArg.id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['reminders'],
      }),
      register: build.mutation<RegisterApiResponse, RegisterApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/auth/register`,
          method: 'POST',
          body: queryArg.registerDto,
        }),
        invalidatesTags: ['auth'],
      }),
      login: build.mutation<LoginApiResponse, LoginApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/auth/login`,
          method: 'POST',
          body: queryArg.loginDto,
        }),
        invalidatesTags: ['auth'],
      }),
      logout: build.mutation<LogoutApiResponse, LogoutApiArg>({
        query: () => ({ url: `/api/v1/auth/logout`, method: 'POST' }),
        invalidatesTags: ['auth'],
      }),
      requestPasswordReset: build.mutation<
        RequestPasswordResetApiResponse,
        RequestPasswordResetApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/auth/password-reset/request`,
          method: 'POST',
          body: queryArg.requestPasswordResetDto,
        }),
        invalidatesTags: ['auth'],
      }),
      resetPassword: build.mutation<ResetPasswordApiResponse, ResetPasswordApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/auth/password-reset/confirm`,
          method: 'POST',
          body: queryArg.resetPasswordDto,
        }),
        invalidatesTags: ['auth'],
      }),
      requestEmailChange: build.mutation<RequestEmailChangeApiResponse, RequestEmailChangeApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/auth/email-change/request`,
          method: 'POST',
          body: queryArg.requestEmailChangeDto,
        }),
        invalidatesTags: ['auth'],
      }),
      confirmEmailChange: build.mutation<ConfirmEmailChangeApiResponse, ConfirmEmailChangeApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/auth/email-change/confirm`,
          method: 'POST',
          body: queryArg.confirmEmailChangeDto,
        }),
        invalidatesTags: ['auth'],
      }),
      requestAccountDeletion: build.mutation<
        RequestAccountDeletionApiResponse,
        RequestAccountDeletionApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/auth/account-deletion/request`,
          method: 'POST',
          body: queryArg.requestAccountDeletionDto,
        }),
        invalidatesTags: ['auth'],
      }),
      cancelAccountDeletion: build.mutation<
        CancelAccountDeletionApiResponse,
        CancelAccountDeletionApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/auth/account-deletion/cancel`,
          method: 'POST',
          body: queryArg.cancelAccountDeletionDto,
        }),
        invalidatesTags: ['auth'],
      }),
      listSessions: build.query<ListSessionsApiResponse, ListSessionsApiArg>({
        query: () => ({ url: `/api/v1/auth/sessions` }),
        providesTags: ['auth'],
      }),
      revokeOtherSessions: build.mutation<
        RevokeOtherSessionsApiResponse,
        RevokeOtherSessionsApiArg
      >({
        query: () => ({ url: `/api/v1/auth/sessions/others`, method: 'DELETE' }),
        invalidatesTags: ['auth'],
      }),
      revokeSession: build.mutation<RevokeSessionApiResponse, RevokeSessionApiArg>({
        query: (queryArg) => ({ url: `/api/v1/auth/sessions/${queryArg.id}`, method: 'DELETE' }),
        invalidatesTags: ['auth'],
      }),
      changePassword: build.mutation<ChangePasswordApiResponse, ChangePasswordApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/auth/password`,
          method: 'PATCH',
          body: queryArg.changePasswordDto,
        }),
        invalidatesTags: ['auth'],
      }),
      findCurrentUser: build.query<FindCurrentUserApiResponse, FindCurrentUserApiArg>({
        query: () => ({ url: `/api/v1/users/me` }),
        providesTags: ['users'],
      }),
      updateCurrentUser: build.mutation<UpdateCurrentUserApiResponse, UpdateCurrentUserApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/users/me`,
          method: 'PATCH',
          body: queryArg.updateCurrentUserDto,
          headers: {
            'If-Match': queryArg['If-Match'],
          },
        }),
        invalidatesTags: ['users'],
      }),
      exportCurrentUser: build.query<ExportCurrentUserApiResponse, ExportCurrentUserApiArg>({
        query: () => ({ url: `/api/v1/users/me/export` }),
        providesTags: ['users'],
      }),
      findUsers: build.query<FindUsersApiResponse, FindUsersApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/users`,
          params: {
            page: queryArg.page,
            limit: queryArg.limit,
            search: queryArg.search,
          },
        }),
        providesTags: ['users'],
      }),
      findUserById: build.query<FindUserByIdApiResponse, FindUserByIdApiArg>({
        query: (queryArg) => ({ url: `/api/v1/users/${queryArg.id}` }),
        providesTags: ['users'],
      }),
      create12: build.mutation<Create12ApiResponse, Create12ApiArg>({
        query: () => ({ url: `/api/v1/telegram/link-token`, method: 'POST' }),
        invalidatesTags: ['telegram'],
      }),
      status: build.query<StatusApiResponse, StatusApiArg>({
        query: () => ({ url: `/api/v1/telegram/connection` }),
        providesTags: ['telegram'],
      }),
      unlink: build.mutation<UnlinkApiResponse, UnlinkApiArg>({
        query: () => ({ url: `/api/v1/telegram/connection`, method: 'DELETE' }),
        invalidatesTags: ['telegram'],
      }),
      exchange: build.mutation<ExchangeApiResponse, ExchangeApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/telegram/link/exchange`,
          method: 'POST',
          body: queryArg.exchangeTelegramLinkDto,
        }),
        invalidatesTags: ['telegram'],
      }),
      integrationStatus: build.query<IntegrationStatusApiResponse, IntegrationStatusApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/telegram/integration/connection`,
          headers: {
            'x-telegram-integration-secret': queryArg['x-telegram-integration-secret'],
          },
          params: {
            telegramUserId: queryArg.telegramUserId,
          },
        }),
        providesTags: ['telegram'],
      }),
      integrationUnlink: build.mutation<IntegrationUnlinkApiResponse, IntegrationUnlinkApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/telegram/integration/connection`,
          method: 'DELETE',
          headers: {
            'x-telegram-integration-secret': queryArg['x-telegram-integration-secret'],
          },
          params: {
            telegramUserId: queryArg.telegramUserId,
          },
        }),
        invalidatesTags: ['telegram'],
      }),
      integrationNotifications: build.query<
        IntegrationNotificationsApiResponse,
        IntegrationNotificationsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/telegram/integration/notifications`,
          headers: {
            'x-telegram-integration-secret': queryArg['x-telegram-integration-secret'],
          },
          params: {
            telegramUserId: queryArg.telegramUserId,
          },
        }),
        providesTags: ['telegram'],
      }),
      findMyFamily: build.query<FindMyFamilyApiResponse, FindMyFamilyApiArg>({
        query: () => ({ url: `/api/v1/families/me` }),
        providesTags: ['families'],
      }),
      dashboard: build.query<DashboardApiResponse, DashboardApiArg>({
        query: () => ({ url: `/api/v1/families/me/dashboard` }),
        providesTags: ['families'],
      }),
      listAuditEvents: build.query<ListAuditEventsApiResponse, ListAuditEventsApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/audit-events`,
          params: {
            page: queryArg.page,
            limit: queryArg.limit,
            action: queryArg.action,
            resourceType: queryArg.resourceType,
          },
        }),
        providesTags: ['families'],
      }),
      leaveFamily: build.mutation<LeaveFamilyApiResponse, LeaveFamilyApiArg>({
        query: () => ({ url: `/api/v1/families/me/membership`, method: 'DELETE' }),
        invalidatesTags: ['families'],
      }),
      archiveFamily: build.mutation<ArchiveFamilyApiResponse, ArchiveFamilyApiArg>({
        query: () => ({ url: `/api/v1/families/me/archive`, method: 'POST' }),
        invalidatesTags: ['families'],
      }),
      restoreFamily: build.mutation<RestoreFamilyApiResponse, RestoreFamilyApiArg>({
        query: () => ({ url: `/api/v1/families/me/restore`, method: 'POST' }),
        invalidatesTags: ['families'],
      }),
      requestDissolution: build.mutation<RequestDissolutionApiResponse, RequestDissolutionApiArg>({
        query: () => ({ url: `/api/v1/families/me/dissolution/request`, method: 'POST' }),
        invalidatesTags: ['families'],
      }),
      confirmDissolution: build.mutation<ConfirmDissolutionApiResponse, ConfirmDissolutionApiArg>({
        query: () => ({ url: `/api/v1/families/me/dissolution/confirm`, method: 'POST' }),
        invalidatesTags: ['families'],
      }),
      cancelDissolution: build.mutation<CancelDissolutionApiResponse, CancelDissolutionApiArg>({
        query: () => ({ url: `/api/v1/families/me/dissolution`, method: 'DELETE' }),
        invalidatesTags: ['families'],
      }),
      createFamilyInvitation: build.mutation<
        CreateFamilyInvitationApiResponse,
        CreateFamilyInvitationApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/family-invitations`,
          method: 'POST',
          body: queryArg.createFamilyInvitationDto,
          headers: {
            'Idempotency-Key': queryArg['Idempotency-Key'],
          },
        }),
        invalidatesTags: ['family invitations'],
      }),
      createPrivateFamilyInvitation: build.mutation<
        CreatePrivateFamilyInvitationApiResponse,
        CreatePrivateFamilyInvitationApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/family-invitations/private`,
          method: 'POST',
          body: queryArg.createPrivateFamilyInvitationDto,
        }),
        invalidatesTags: ['family invitations'],
      }),
      findOutgoingPrivateFamilyInvitations: build.query<
        FindOutgoingPrivateFamilyInvitationsApiResponse,
        FindOutgoingPrivateFamilyInvitationsApiArg
      >({
        query: () => ({ url: `/api/v1/family-invitations/private/outgoing` }),
        providesTags: ['family invitations'],
      }),
      acceptPrivateFamilyInvitation: build.mutation<
        AcceptPrivateFamilyInvitationApiResponse,
        AcceptPrivateFamilyInvitationApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/family-invitations/private/accept`,
          method: 'POST',
          body: queryArg.acceptPrivateFamilyInvitationDto,
          headers: {
            'Idempotency-Key': queryArg['Idempotency-Key'],
          },
        }),
        invalidatesTags: ['family invitations'],
      }),
      revokePrivateFamilyInvitation: build.mutation<
        RevokePrivateFamilyInvitationApiResponse,
        RevokePrivateFamilyInvitationApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/family-invitations/private/${queryArg.id}/revoke`,
          method: 'PATCH',
        }),
        invalidatesTags: ['family invitations'],
      }),
      findIncomingInvitations: build.query<
        FindIncomingInvitationsApiResponse,
        FindIncomingInvitationsApiArg
      >({
        query: () => ({ url: `/api/v1/family-invitations/incoming` }),
        providesTags: ['family invitations'],
      }),
      findOutgoingInvitations: build.query<
        FindOutgoingInvitationsApiResponse,
        FindOutgoingInvitationsApiArg
      >({
        query: () => ({ url: `/api/v1/family-invitations/outgoing` }),
        providesTags: ['family invitations'],
      }),
      acceptFamilyInvitation: build.mutation<
        AcceptFamilyInvitationApiResponse,
        AcceptFamilyInvitationApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/family-invitations/${queryArg.id}/accept`,
          method: 'PATCH',
          headers: {
            'Idempotency-Key': queryArg['Idempotency-Key'],
          },
        }),
        invalidatesTags: ['family invitations'],
      }),
      rejectFamilyInvitation: build.mutation<
        RejectFamilyInvitationApiResponse,
        RejectFamilyInvitationApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/family-invitations/${queryArg.id}/reject`,
          method: 'PATCH',
        }),
        invalidatesTags: ['family invitations'],
      }),
      cancelFamilyInvitation: build.mutation<
        CancelFamilyInvitationApiResponse,
        CancelFamilyInvitationApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/family-invitations/${queryArg.id}/cancel`,
          method: 'PATCH',
        }),
        invalidatesTags: ['family invitations'],
      }),
      create13: build.mutation<Create13ApiResponse, Create13ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/children`,
          method: 'POST',
          body: queryArg.createChildProfileDto,
        }),
        invalidatesTags: ['child-profiles'],
      }),
      list13: build.query<List13ApiResponse, List13ApiArg>({
        query: () => ({ url: `/api/v1/families/me/children` }),
        providesTags: ['child-profiles'],
      }),
      getApiV1FamiliesMeChildrenByIdExport: build.query<
        GetApiV1FamiliesMeChildrenByIdExportApiResponse,
        GetApiV1FamiliesMeChildrenByIdExportApiArg
      >({
        query: (queryArg) => ({ url: `/api/v1/families/me/children/${queryArg.id}/export` }),
        providesTags: ['child-profiles'],
      }),
      update10: build.mutation<Update10ApiResponse, Update10ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/children/${queryArg.id}`,
          method: 'PATCH',
          body: queryArg.updateChildProfileDto,
        }),
        invalidatesTags: ['child-profiles'],
      }),
      remove3: build.mutation<Remove3ApiResponse, Remove3ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/children/${queryArg.id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['child-profiles'],
      }),
      createFamilyEvent: build.mutation<CreateFamilyEventApiResponse, CreateFamilyEventApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/family-events`,
          method: 'POST',
          body: queryArg.createFamilyEventDto,
          headers: {
            'Idempotency-Key': queryArg['Idempotency-Key'],
          },
        }),
        invalidatesTags: ['family events'],
      }),
      findFamilyEvents: build.query<FindFamilyEventsApiResponse, FindFamilyEventsApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/family-events`,
          params: {
            page: queryArg.page,
            limit: queryArg.limit,
            dateFrom: queryArg.dateFrom,
            dateTo: queryArg.dateTo,
          },
        }),
        providesTags: ['family events'],
      }),
      findFamilyEventById: build.query<FindFamilyEventByIdApiResponse, FindFamilyEventByIdApiArg>({
        query: (queryArg) => ({ url: `/api/v1/family-events/${queryArg.id}` }),
        providesTags: ['family events'],
      }),
      updateFamilyEvent: build.mutation<UpdateFamilyEventApiResponse, UpdateFamilyEventApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/family-events/${queryArg.id}`,
          method: 'PATCH',
          body: queryArg.updateFamilyEventDto,
          headers: {
            'If-Match': queryArg['If-Match'],
          },
        }),
        invalidatesTags: ['family events'],
      }),
      removeFamilyEvent: build.mutation<RemoveFamilyEventApiResponse, RemoveFamilyEventApiArg>({
        query: (queryArg) => ({ url: `/api/v1/family-events/${queryArg.id}`, method: 'DELETE' }),
        invalidatesTags: ['family events'],
      }),
      confirmFamilyEvent: build.mutation<ConfirmFamilyEventApiResponse, ConfirmFamilyEventApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/family-events/${queryArg.id}/confirm`,
          method: 'PATCH',
        }),
        invalidatesTags: ['family events'],
      }),
      rejectFamilyEvent: build.mutation<RejectFamilyEventApiResponse, RejectFamilyEventApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/family-events/${queryArg.id}/reject`,
          method: 'PATCH',
        }),
        invalidatesTags: ['family events'],
      }),
      createFirstDate: build.mutation<CreateFirstDateApiResponse, CreateFirstDateApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/first-date`,
          method: 'POST',
          body: queryArg.createFirstDateDto,
          headers: {
            'Idempotency-Key': queryArg['Idempotency-Key'],
          },
        }),
        invalidatesTags: ['first date'],
      }),
      findMyFirstDate: build.query<FindMyFirstDateApiResponse, FindMyFirstDateApiArg>({
        query: () => ({ url: `/api/v1/first-date` }),
        providesTags: ['first date'],
      }),
      updateFirstDate: build.mutation<UpdateFirstDateApiResponse, UpdateFirstDateApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/first-date`,
          method: 'PATCH',
          body: queryArg.updateFirstDateDto,
          headers: {
            'If-Match': queryArg['If-Match'],
          },
        }),
        invalidatesTags: ['first date'],
      }),
      removeFirstDate: build.mutation<RemoveFirstDateApiResponse, RemoveFirstDateApiArg>({
        query: () => ({ url: `/api/v1/first-date`, method: 'DELETE' }),
        invalidatesTags: ['first date'],
      }),
      project: build.query<ProjectApiResponse, ProjectApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/calendar`,
          params: {
            dateFrom: queryArg.dateFrom,
            dateTo: queryArg.dateTo,
          },
        }),
        providesTags: ['calendar'],
      }),
      create14: build.mutation<Create14ApiResponse, Create14ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/wellbeing/check-ins`,
          method: 'POST',
          body: queryArg.createWellbeingCheckInDto,
        }),
        invalidatesTags: ['wellbeing'],
      }),
      list14: build.query<List14ApiResponse, List14ApiArg>({
        query: () => ({ url: `/api/v1/families/me/wellbeing/check-ins` }),
        providesTags: ['wellbeing'],
      }),
      deleteAll: build.mutation<DeleteAllApiResponse, DeleteAllApiArg>({
        query: () => ({ url: `/api/v1/families/me/wellbeing/check-ins`, method: 'DELETE' }),
        invalidatesTags: ['wellbeing'],
      }),
      findOne: build.query<FindOneApiResponse, FindOneApiArg>({
        query: (queryArg) => ({ url: `/api/v1/families/me/wellbeing/check-ins/${queryArg.id}` }),
        providesTags: ['wellbeing'],
      }),
      remove4: build.mutation<Remove4ApiResponse, Remove4ApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/wellbeing/check-ins/${queryArg.id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['wellbeing'],
      }),
      grantConsent: build.mutation<GrantConsentApiResponse, GrantConsentApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/wellbeing/check-ins/consents`,
          method: 'POST',
          body: queryArg.createWellbeingConsentDto,
        }),
        invalidatesTags: ['wellbeing'],
      }),
      listConsents: build.query<ListConsentsApiResponse, ListConsentsApiArg>({
        query: () => ({ url: `/api/v1/families/me/wellbeing/check-ins/consents` }),
        providesTags: ['wellbeing'],
      }),
      revokeConsent: build.mutation<RevokeConsentApiResponse, RevokeConsentApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/wellbeing/check-ins/consents/${queryArg.id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['wellbeing'],
      }),
      sharedWithMe: build.query<SharedWithMeApiResponse, SharedWithMeApiArg>({
        query: () => ({ url: `/api/v1/families/me/wellbeing/check-ins/shared-with-me` }),
        providesTags: ['wellbeing'],
      }),
      createAssessment: build.mutation<CreateAssessmentApiResponse, CreateAssessmentApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/wellbeing/check-ins/assessments`,
          method: 'POST',
          body: queryArg.createWellbeingAssessmentDto,
        }),
        invalidatesTags: ['wellbeing'],
      }),
      listAssessments: build.query<ListAssessmentsApiResponse, ListAssessmentsApiArg>({
        query: () => ({ url: `/api/v1/families/me/wellbeing/check-ins/assessments` }),
        providesTags: ['wellbeing'],
      }),
      trends: build.query<TrendsApiResponse, TrendsApiArg>({
        query: () => ({ url: `/api/v1/families/me/wellbeing/check-ins/trends` }),
        providesTags: ['wellbeing'],
      }),
      exportData: build.query<ExportDataApiResponse, ExportDataApiArg>({
        query: () => ({ url: `/api/v1/families/me/wellbeing/check-ins/export` }),
        providesTags: ['wellbeing'],
      }),
      createGratitude: build.mutation<CreateGratitudeApiResponse, CreateGratitudeApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/wellbeing/check-ins/gratitudes`,
          method: 'POST',
          body: queryArg.createWellbeingGratitudeDto,
        }),
        invalidatesTags: ['wellbeing'],
      }),
      listGratitudes: build.query<ListGratitudesApiResponse, ListGratitudesApiArg>({
        query: () => ({ url: `/api/v1/families/me/wellbeing/check-ins/gratitudes` }),
        providesTags: ['wellbeing'],
      }),
      removeGratitude: build.mutation<RemoveGratitudeApiResponse, RemoveGratitudeApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/wellbeing/check-ins/gratitudes/${queryArg.id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['wellbeing'],
      }),
      createSupportRequest: build.mutation<
        CreateSupportRequestApiResponse,
        CreateSupportRequestApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/families/me/wellbeing/check-ins/support-requests`,
          method: 'POST',
          body: queryArg.createWellbeingSupportRequestDto,
        }),
        invalidatesTags: ['wellbeing'],
      }),
      listSupportRequests: build.query<ListSupportRequestsApiResponse, ListSupportRequestsApiArg>({
        query: () => ({ url: `/api/v1/families/me/wellbeing/check-ins/support-requests` }),
        providesTags: ['wellbeing'],
      }),
      updateSupportRequest: build.mutation<
        UpdateSupportRequestApiResponse,
        UpdateSupportRequestApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/families/me/wellbeing/check-ins/support-requests/${queryArg.id}/status`,
          method: 'POST',
          body: queryArg.updateWellbeingSupportRequestDto,
        }),
        invalidatesTags: ['wellbeing'],
      }),
      createRitual: build.mutation<CreateRitualApiResponse, CreateRitualApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/wellbeing/check-ins/rituals`,
          method: 'POST',
          body: queryArg.createWellbeingRitualDto,
        }),
        invalidatesTags: ['wellbeing'],
      }),
      listRituals: build.query<ListRitualsApiResponse, ListRitualsApiArg>({
        query: () => ({ url: `/api/v1/families/me/wellbeing/check-ins/rituals` }),
        providesTags: ['wellbeing'],
      }),
      updateRitual: build.mutation<UpdateRitualApiResponse, UpdateRitualApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/wellbeing/check-ins/rituals/${queryArg.id}`,
          method: 'POST',
          body: queryArg.updateWellbeingRitualDto,
        }),
        invalidatesTags: ['wellbeing'],
      }),
      removeRitual: build.mutation<RemoveRitualApiResponse, RemoveRitualApiArg>({
        query: (queryArg) => ({
          url: `/api/v1/families/me/wellbeing/check-ins/rituals/${queryArg.id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['wellbeing'],
      }),
      createCoupleMeeting: build.mutation<
        CreateCoupleMeetingApiResponse,
        CreateCoupleMeetingApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/families/me/wellbeing/check-ins/couple-meetings`,
          method: 'POST',
          body: queryArg.createWellbeingCoupleMeetingDto,
        }),
        invalidatesTags: ['wellbeing'],
      }),
      listCoupleMeetings: build.query<ListCoupleMeetingsApiResponse, ListCoupleMeetingsApiArg>({
        query: () => ({ url: `/api/v1/families/me/wellbeing/check-ins/couple-meetings` }),
        providesTags: ['wellbeing'],
      }),
      updateCoupleMeeting: build.mutation<
        UpdateCoupleMeetingApiResponse,
        UpdateCoupleMeetingApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/families/me/wellbeing/check-ins/couple-meetings/${queryArg.id}`,
          method: 'POST',
          body: queryArg.updateWellbeingCoupleMeetingDto,
        }),
        invalidatesTags: ['wellbeing'],
      }),
      respondToCoupleMeeting: build.mutation<
        RespondToCoupleMeetingApiResponse,
        RespondToCoupleMeetingApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/families/me/wellbeing/check-ins/couple-meetings/${queryArg.id}/response`,
          method: 'POST',
          body: queryArg.wellbeingCoupleMeetingResponseInputDto,
        }),
        invalidatesTags: ['wellbeing'],
      }),
      publishCoupleMeeting: build.mutation<
        PublishCoupleMeetingApiResponse,
        PublishCoupleMeetingApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/families/me/wellbeing/check-ins/couple-meetings/${queryArg.id}/publish`,
          method: 'POST',
        }),
        invalidatesTags: ['wellbeing'],
      }),
      setCoupleMeetingDecision: build.mutation<
        SetCoupleMeetingDecisionApiResponse,
        SetCoupleMeetingDecisionApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/families/me/wellbeing/check-ins/couple-meetings/${queryArg.id}/decision`,
          method: 'POST',
          body: queryArg.wellbeingCoupleMeetingDecisionDto,
        }),
        invalidatesTags: ['wellbeing'],
      }),
      checkHealth: build.query<CheckHealthApiResponse, CheckHealthApiArg>({
        query: () => ({ url: `/api/v1/health` }),
        providesTags: ['health'],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as generatedApi };
export type CreateApiResponse = /** status 200  */ TaskResponseDto;
export type CreateApiArg = {
  createTaskDto: CreateTaskDto;
};
export type ListApiResponse = unknown;
export type ListApiArg = {
  page?: number;
  limit?: number;
};
export type UpdateApiResponse = /** status 200  */ TaskResponseDto;
export type UpdateApiArg = {
  id: string;
  updateTaskDto: UpdateTaskDto;
};
export type ArchiveApiResponse = unknown;
export type ArchiveApiArg = {
  id: string;
};
export type CompleteApiResponse = /** status 200  */ TaskResponseDto;
export type CompleteApiArg = {
  id: string;
};
export type ReopenApiResponse = /** status 200  */ TaskResponseDto;
export type ReopenApiArg = {
  id: string;
};
export type Create2ApiResponse = /** status 200  */ TaskRoutineResponseDto;
export type Create2ApiArg = {
  createTaskRoutineDto: CreateTaskRoutineDto;
};
export type List2ApiResponse = /** status 200  */ TaskRoutineResponseDto[];
export type List2ApiArg = void;
export type ListArchivedApiResponse = /** status 200  */ TaskRoutineResponseDto[];
export type ListArchivedApiArg = void;
export type Update2ApiResponse = /** status 200  */ TaskRoutineResponseDto;
export type Update2ApiArg = {
  id: string;
  updateTaskRoutineDto: UpdateTaskRoutineDto;
};
export type Archive2ApiResponse = unknown;
export type Archive2ApiArg = {
  id: string;
};
export type GenerateApiResponse = /** status 200  */ TaskRoutineResponseDto;
export type GenerateApiArg = {
  id: string;
};
export type RestoreApiResponse = /** status 200  */ TaskRoutineResponseDto;
export type RestoreApiArg = {
  id: string;
};
export type Create3ApiResponse = /** status 201  */ WalletResponseDto;
export type Create3ApiArg = {
  createWalletDto: CreateWalletDto;
};
export type List3ApiResponse = /** status 200  */ WalletResponseDto[];
export type List3ApiArg = void;
export type ArchivedApiResponse = /** status 200  */ WalletResponseDto[];
export type ArchivedApiArg = void;
export type GetApiV1FamiliesMeWalletsByIdApiResponse = /** status 200  */ WalletResponseDto;
export type GetApiV1FamiliesMeWalletsByIdApiArg = {
  id: string;
};
export type Update3ApiResponse = /** status 200  */ WalletResponseDto;
export type Update3ApiArg = {
  id: string;
  updateWalletDto: UpdateWalletDto;
};
export type Archive3ApiResponse = unknown;
export type Archive3ApiArg = {
  id: string;
};
export type Restore2ApiResponse = /** status 200  */ WalletResponseDto;
export type Restore2ApiArg = {
  id: string;
};
export type List4ApiResponse = /** status 200  */ PaginatedLedgerTransactionsResponseDto;
export type List4ApiArg = {
  page?: number;
  limit?: number;
  /** Limit history to one visible wallet. */
  walletId?: string;
};
export type Get2ApiResponse = /** status 200  */ LedgerTransactionResponseDto;
export type Get2ApiArg = {
  id: string;
};
export type IncomeApiResponse = /** status 201  */ LedgerTransactionResponseDto;
export type IncomeApiArg = {
  /** Required retry key (8-128 safe ASCII characters). */
  'Idempotency-Key': string;
  createLedgerCommandDto: CreateLedgerCommandDto;
};
export type ExpenseApiResponse = /** status 201  */ LedgerTransactionResponseDto;
export type ExpenseApiArg = {
  /** Required retry key (8-128 safe ASCII characters). */
  'Idempotency-Key': string;
  createLedgerCommandDto: CreateLedgerCommandDto;
};
export type TransferApiResponse = /** status 201  */ LedgerTransactionResponseDto;
export type TransferApiArg = {
  /** Required retry key (8-128 safe ASCII characters). */
  'Idempotency-Key': string;
  createTransferCommandDto: CreateTransferCommandDto;
};
export type ReverseApiResponse = /** status 201  */ LedgerTransactionResponseDto;
export type ReverseApiArg = {
  id: string;
  /** Required retry key (8-128 safe ASCII characters). */
  'Idempotency-Key': string;
  reverseLedgerTransactionDto: ReverseLedgerTransactionDto;
};
export type Create4ApiResponse = /** status 201  */ FinancialCategoryResponseDto;
export type Create4ApiArg = {
  createFinancialCategoryDto: CreateFinancialCategoryDto;
};
export type List5ApiResponse = /** status 200  */ FinancialCategoryResponseDto[];
export type List5ApiArg = {
  kind: string;
};
export type Archived2ApiResponse = /** status 200  */ FinancialCategoryResponseDto[];
export type Archived2ApiArg = {
  kind: string;
};
export type Update4ApiResponse = /** status 200  */ FinancialCategoryResponseDto;
export type Update4ApiArg = {
  id: string;
  updateFinancialCategoryDto: UpdateFinancialCategoryDto;
};
export type Archive4ApiResponse = unknown;
export type Archive4ApiArg = {
  id: string;
};
export type Restore3ApiResponse = /** status 200  */ FinancialCategoryResponseDto;
export type Restore3ApiArg = {
  id: string;
};
export type Create5ApiResponse = /** status 201  */ BudgetResponseDto;
export type Create5ApiArg = {
  createBudgetDto: CreateBudgetDto;
};
export type List6ApiResponse = /** status 200  */ BudgetResponseDto[];
export type List6ApiArg = {
  periodStart?: string;
};
export type Update5ApiResponse = /** status 200  */ BudgetResponseDto;
export type Update5ApiArg = {
  id: string;
  updateBudgetDto: UpdateBudgetDto;
};
export type RemoveApiResponse = unknown;
export type RemoveApiArg = {
  id: string;
};
export type Create6ApiResponse = /** status 201  */ RecurringPaymentResponseDto;
export type Create6ApiArg = {
  createRecurringPaymentDto: CreateRecurringPaymentDto;
};
export type List7ApiResponse = /** status 200  */ RecurringPaymentResponseDto[];
export type List7ApiArg = void;
export type Archived3ApiResponse = /** status 200  */ RecurringPaymentResponseDto[];
export type Archived3ApiArg = void;
export type ForecastsApiResponse = /** status 200  */ RecurringPaymentForecastResponseDto[];
export type ForecastsApiArg = {
  id: string;
};
export type Update6ApiResponse = /** status 200  */ RecurringPaymentResponseDto;
export type Update6ApiArg = {
  id: string;
  updateRecurringPaymentDto: UpdateRecurringPaymentDto;
};
export type Archive5ApiResponse = unknown;
export type Archive5ApiArg = {
  id: string;
};
export type Restore4ApiResponse = /** status 200  */ RecurringPaymentResponseDto;
export type Restore4ApiArg = {
  id: string;
};
export type Get3ApiResponse = /** status 200  */ FinancialSummaryResponseDto;
export type Get3ApiArg = {
  /** First calendar day of the requested month; defaults to the current UTC month. */
  periodStart?: string;
};
export type Create7ApiResponse = /** status 201  */ FinancialGoalResponseDto;
export type Create7ApiArg = {
  createFinancialGoalDto: CreateFinancialGoalDto;
};
export type List8ApiResponse = /** status 200  */ FinancialGoalResponseDto[];
export type List8ApiArg = void;
export type Archived4ApiResponse = /** status 200  */ FinancialGoalResponseDto[];
export type Archived4ApiArg = void;
export type Update7ApiResponse = /** status 200  */ FinancialGoalResponseDto;
export type Update7ApiArg = {
  id: string;
  updateFinancialGoalDto: UpdateFinancialGoalDto;
};
export type Archive6ApiResponse = unknown;
export type Archive6ApiArg = {
  id: string;
};
export type ContributeApiResponse = /** status 201  */ FinancialGoalContributionResponseDto;
export type ContributeApiArg = {
  id: string;
  /** Required retry key (8-128 safe ASCII characters). */
  'Idempotency-Key': string;
  createFinancialGoalContributionDto: CreateFinancialGoalContributionDto;
};
export type Restore5ApiResponse = /** status 200  */ FinancialGoalResponseDto;
export type Restore5ApiArg = {
  id: string;
};
export type Get4ApiResponse = /** status 200  */ FinancialAnalyticsResponseDto;
export type Get4ApiArg = {
  /** First day of the first UTC month. */
  periodStart?: string;
  months?: number;
  forecastDays?: number;
};
export type Create8ApiResponse = /** status 201  */ FinancialMeetingResponseDto;
export type Create8ApiArg = {
  createFinancialMeetingDto: CreateFinancialMeetingDto;
};
export type List9ApiResponse = /** status 200  */ FinancialMeetingResponseDto[];
export type List9ApiArg = void;
export type Update8ApiResponse = /** status 200  */ FinancialMeetingResponseDto;
export type Update8ApiArg = {
  id: string;
  updateFinancialMeetingDto: UpdateFinancialMeetingDto;
};
export type CancelApiResponse = unknown;
export type CancelApiArg = {
  id: string;
};
export type Complete2ApiResponse = /** status 200  */ FinancialMeetingResponseDto;
export type Complete2ApiArg = {
  id: string;
};
export type CreateDecisionApiResponse = /** status 201  */ FinancialDecisionResponseDto;
export type CreateDecisionApiArg = {
  id: string;
  createFinancialDecisionDto: CreateFinancialDecisionDto;
};
export type RespondApiResponse = /** status 200  */ FinancialDecisionResponseDto;
export type RespondApiArg = {
  meetingId: string;
  decisionId: string;
  respondFinancialDecisionDto: RespondFinancialDecisionDto;
};
export type Get5ApiResponse = /** status 200  */ ExpenseStatisticsResponseDto;
export type Get5ApiArg = {
  /** Inclusive UTC calendar date. */
  dateFrom?: string;
  /** Inclusive UTC calendar date. */
  dateTo?: string;
};
export type ListsApiResponse = /** status 200  */ ShoppingListResponseDto[];
export type ListsApiArg = void;
export type Create9ApiResponse = /** status 200  */ ShoppingListResponseDto;
export type Create9ApiArg = {
  createShoppingListDto: CreateShoppingListDto;
};
export type Archived5ApiResponse = /** status 200  */ ShoppingListResponseDto[];
export type Archived5ApiArg = void;
export type AddApiResponse = /** status 200  */ ShoppingItemResponseDto;
export type AddApiArg = {
  listId: string;
  createShoppingItemDto: CreateShoppingItemDto;
};
export type CheckApiResponse = /** status 200  */ ShoppingItemResponseDto;
export type CheckApiArg = {
  listId: string;
  itemId: string;
};
export type UncheckApiResponse = /** status 200  */ ShoppingItemResponseDto;
export type UncheckApiArg = {
  listId: string;
  itemId: string;
};
export type Archive7ApiResponse = unknown;
export type Archive7ApiArg = {
  listId: string;
};
export type Restore6ApiResponse = /** status 200  */ ShoppingListResponseDto;
export type Restore6ApiArg = {
  listId: string;
};
export type List10ApiResponse = /** status 200  */ RecipeResponseDto[];
export type List10ApiArg = void;
export type Create10ApiResponse = /** status 200  */ RecipeResponseDto;
export type Create10ApiArg = {
  createRecipeDto: CreateRecipeDto;
};
export type ListArchived2ApiResponse = /** status 200  */ RecipeResponseDto[];
export type ListArchived2ApiArg = void;
export type Update9ApiResponse = /** status 200  */ RecipeResponseDto;
export type Update9ApiArg = {
  id: string;
  updateRecipeDto: UpdateRecipeDto;
};
export type Archive8ApiResponse = unknown;
export type Archive8ApiArg = {
  id: string;
};
export type Restore7ApiResponse = /** status 200  */ RecipeResponseDto;
export type Restore7ApiArg = {
  id: string;
};
export type CreatePlanApiResponse = /** status 200  */ MealPlanResponseDto;
export type CreatePlanApiArg = {
  createMealPlanDto: CreateMealPlanDto;
};
export type ListPlansApiResponse = /** status 200  */ MealPlanResponseDto[];
export type ListPlansApiArg = {
  from?: string;
  to?: string;
};
export type UpdatePlanApiResponse = /** status 200  */ MealPlanResponseDto;
export type UpdatePlanApiArg = {
  id: string;
  updateMealPlanDto: UpdateMealPlanDto;
};
export type DeletePlanApiResponse = unknown;
export type DeletePlanApiArg = {
  id: string;
};
export type GenerateShoppingApiResponse = unknown;
export type GenerateShoppingApiArg = {
  id: string;
  generateShoppingDto: GenerateShoppingDto;
};
export type PreferencesGetApiResponse = /** status 200  */ NotificationPreferencesResponseDto;
export type PreferencesGetApiArg = void;
export type PreferencesUpdateApiResponse = /** status 200  */ NotificationPreferencesResponseDto;
export type PreferencesUpdateApiArg = {
  updateNotificationPreferencesDto: UpdateNotificationPreferencesDto;
};
export type ListPaginatedApiResponse = /** status 200  */ PaginatedNotificationsResponseDto;
export type ListPaginatedApiArg = {
  page?: number;
  limit?: number;
};
export type List11ApiResponse = /** status 200  */ NotificationResponseDto[];
export type List11ApiArg = void;
export type ReadApiResponse = unknown;
export type ReadApiArg = {
  id: string;
};
export type ReadAllApiResponse = unknown;
export type ReadAllApiArg = void;
export type Create11ApiResponse = /** status 201  */ TaskReminderResponseDto;
export type Create11ApiArg = {
  taskId: string;
  createTaskReminderDto: CreateTaskReminderDto;
};
export type List12ApiResponse = /** status 200  */ TaskReminderResponseDto[];
export type List12ApiArg = {
  taskId: string;
};
export type Remove2ApiResponse = unknown;
export type Remove2ApiArg = {
  id: string;
};
export type RegisterApiResponse = /** status 201  */ AuthResponseDto;
export type RegisterApiArg = {
  registerDto: RegisterDto;
};
export type LoginApiResponse = /** status 200  */ AuthResponseDto;
export type LoginApiArg = {
  loginDto: LoginDto;
};
export type LogoutApiResponse = unknown;
export type LogoutApiArg = void;
export type RequestPasswordResetApiResponse = /** status 202  */ PasswordResetRequestResponseDto;
export type RequestPasswordResetApiArg = {
  requestPasswordResetDto: RequestPasswordResetDto;
};
export type ResetPasswordApiResponse = unknown;
export type ResetPasswordApiArg = {
  resetPasswordDto: ResetPasswordDto;
};
export type RequestEmailChangeApiResponse = unknown;
export type RequestEmailChangeApiArg = {
  requestEmailChangeDto: RequestEmailChangeDto;
};
export type ConfirmEmailChangeApiResponse = unknown;
export type ConfirmEmailChangeApiArg = {
  confirmEmailChangeDto: ConfirmEmailChangeDto;
};
export type RequestAccountDeletionApiResponse =
  /** status 202  */ AccountDeletionRequestResponseDto;
export type RequestAccountDeletionApiArg = {
  requestAccountDeletionDto: RequestAccountDeletionDto;
};
export type CancelAccountDeletionApiResponse = unknown;
export type CancelAccountDeletionApiArg = {
  cancelAccountDeletionDto: CancelAccountDeletionDto;
};
export type ListSessionsApiResponse = /** status 200  */ AuthSessionResponseDto[];
export type ListSessionsApiArg = void;
export type RevokeOtherSessionsApiResponse = unknown;
export type RevokeOtherSessionsApiArg = void;
export type RevokeSessionApiResponse = unknown;
export type RevokeSessionApiArg = {
  id: string;
};
export type ChangePasswordApiResponse = unknown;
export type ChangePasswordApiArg = {
  changePasswordDto: ChangePasswordDto;
};
export type FindCurrentUserApiResponse = /** status 200  */ UserResponseDto;
export type FindCurrentUserApiArg = void;
export type UpdateCurrentUserApiResponse = /** status 200  */ UserResponseDto;
export type UpdateCurrentUserApiArg = {
  /** Optional current profile version */
  'If-Match'?: string;
  updateCurrentUserDto: UpdateCurrentUserDto;
};
export type ExportCurrentUserApiResponse = /** status 200  */ AccountExportResponseDto;
export type ExportCurrentUserApiArg = void;
export type FindUsersApiResponse = /** status 200  */ PaginatedUsersResponseDto;
export type FindUsersApiArg = {
  page?: number;
  limit?: number;
  /** Search by first name, last name or email */
  search?: string;
};
export type FindUserByIdApiResponse = /** status 200  */ PublicUserResponseDto;
export type FindUserByIdApiArg = {
  id: string;
};
export type Create12ApiResponse = /** status 201  */ TelegramLinkTokenResponseDto;
export type Create12ApiArg = void;
export type StatusApiResponse = /** status 200  */ TelegramConnectionResponseDto;
export type StatusApiArg = void;
export type UnlinkApiResponse = unknown;
export type UnlinkApiArg = void;
export type ExchangeApiResponse = /** status 201  */ TelegramLinkExchangeResponseDto;
export type ExchangeApiArg = {
  exchangeTelegramLinkDto: ExchangeTelegramLinkDto;
};
export type IntegrationStatusApiResponse =
  /** status 200  */ TelegramIntegrationConnectionResponseDto;
export type IntegrationStatusApiArg = {
  telegramUserId: string;
  'x-telegram-integration-secret': string;
};
export type IntegrationUnlinkApiResponse = unknown;
export type IntegrationUnlinkApiArg = {
  telegramUserId: string;
  'x-telegram-integration-secret': string;
};
export type IntegrationNotificationsApiResponse = unknown;
export type IntegrationNotificationsApiArg = {
  telegramUserId: string;
  'x-telegram-integration-secret': string;
};
export type FindMyFamilyApiResponse = /** status 200  */ FamilyResponseDto;
export type FindMyFamilyApiArg = void;
export type DashboardApiResponse = /** status 200  */ FamilyDashboardResponseDto;
export type DashboardApiArg = void;
export type ListAuditEventsApiResponse = /** status 200  */ PaginatedAuditEventsResponseDto;
export type ListAuditEventsApiArg = {
  page?: number;
  limit?: number;
  action?: string;
  resourceType?: string;
};
export type LeaveFamilyApiResponse = unknown;
export type LeaveFamilyApiArg = void;
export type ArchiveFamilyApiResponse = unknown;
export type ArchiveFamilyApiArg = void;
export type RestoreFamilyApiResponse = unknown;
export type RestoreFamilyApiArg = void;
export type RequestDissolutionApiResponse = /** status 200  */ DissolutionResponseDto;
export type RequestDissolutionApiArg = void;
export type ConfirmDissolutionApiResponse = unknown;
export type ConfirmDissolutionApiArg = void;
export type CancelDissolutionApiResponse = unknown;
export type CancelDissolutionApiArg = void;
export type CreateFamilyInvitationApiResponse = /** status 201  */ FamilyInvitationResponseDto;
export type CreateFamilyInvitationApiArg = {
  /** Retry key for this command (8-128 safe ASCII characters). Reusing it with another payload returns 409. */
  'Idempotency-Key'?: string;
  createFamilyInvitationDto: CreateFamilyInvitationDto;
};
export type CreatePrivateFamilyInvitationApiResponse =
  /** status 201  */ CreatedPrivateFamilyInvitationResponseDto;
export type CreatePrivateFamilyInvitationApiArg = {
  createPrivateFamilyInvitationDto: CreatePrivateFamilyInvitationDto;
};
export type FindOutgoingPrivateFamilyInvitationsApiResponse =
  /** status 200  */ PrivateFamilyInvitationResponseDto[];
export type FindOutgoingPrivateFamilyInvitationsApiArg = void;
export type AcceptPrivateFamilyInvitationApiResponse =
  /** status 200  */ PrivateFamilyInvitationResponseDto;
export type AcceptPrivateFamilyInvitationApiArg = {
  /** Retry key for this command (8-128 safe ASCII characters). Reusing it with another payload returns 409. */
  'Idempotency-Key'?: string;
  acceptPrivateFamilyInvitationDto: AcceptPrivateFamilyInvitationDto;
};
export type RevokePrivateFamilyInvitationApiResponse =
  /** status 200  */ PrivateFamilyInvitationResponseDto;
export type RevokePrivateFamilyInvitationApiArg = {
  id: string;
};
export type FindIncomingInvitationsApiResponse = /** status 200  */ FamilyInvitationResponseDto[];
export type FindIncomingInvitationsApiArg = void;
export type FindOutgoingInvitationsApiResponse = /** status 200  */ FamilyInvitationResponseDto[];
export type FindOutgoingInvitationsApiArg = void;
export type AcceptFamilyInvitationApiResponse = /** status 200  */ FamilyInvitationResponseDto;
export type AcceptFamilyInvitationApiArg = {
  id: string;
  /** Retry key for this command (8-128 safe ASCII characters). Reusing it with another payload returns 409. */
  'Idempotency-Key'?: string;
};
export type RejectFamilyInvitationApiResponse = /** status 200  */ FamilyInvitationResponseDto;
export type RejectFamilyInvitationApiArg = {
  id: string;
};
export type CancelFamilyInvitationApiResponse = /** status 200  */ FamilyInvitationResponseDto;
export type CancelFamilyInvitationApiArg = {
  id: string;
};
export type Create13ApiResponse = /** status 201  */ ChildProfileResponseDto;
export type Create13ApiArg = {
  createChildProfileDto: CreateChildProfileDto;
};
export type List13ApiResponse = /** status 200  */ ChildProfileResponseDto[];
export type List13ApiArg = void;
export type GetApiV1FamiliesMeChildrenByIdExportApiResponse =
  /** status 200  */ ChildProfileExportDto;
export type GetApiV1FamiliesMeChildrenByIdExportApiArg = {
  id: string;
};
export type Update10ApiResponse = /** status 200  */ ChildProfileResponseDto;
export type Update10ApiArg = {
  id: string;
  updateChildProfileDto: UpdateChildProfileDto;
};
export type Remove3ApiResponse = unknown;
export type Remove3ApiArg = {
  id: string;
};
export type CreateFamilyEventApiResponse = /** status 201  */ FamilyEventResponseDto;
export type CreateFamilyEventApiArg = {
  /** Retry key for this command (8-128 safe ASCII characters). Reusing it with another payload returns 409. */
  'Idempotency-Key'?: string;
  createFamilyEventDto: CreateFamilyEventDto;
};
export type FindFamilyEventsApiResponse = /** status 200  */ PaginatedFamilyEventsResponseDto;
export type FindFamilyEventsApiArg = {
  page?: number;
  limit?: number;
  /** Start date, inclusive, in the family timezone */
  dateFrom?: string;
  /** End date, exclusive, in the family timezone */
  dateTo?: string;
};
export type FindFamilyEventByIdApiResponse = /** status 200  */ FamilyEventResponseDto;
export type FindFamilyEventByIdApiArg = {
  id: string;
};
export type UpdateFamilyEventApiResponse = /** status 200  */ FamilyEventResponseDto;
export type UpdateFamilyEventApiArg = {
  id: string;
  /** Current resource version. Omit for backward-compatible last-write-wins behavior. */
  'If-Match'?: string;
  updateFamilyEventDto: UpdateFamilyEventDto;
};
export type RemoveFamilyEventApiResponse = unknown;
export type RemoveFamilyEventApiArg = {
  id: string;
};
export type ConfirmFamilyEventApiResponse = /** status 200  */ FamilyEventResponseDto;
export type ConfirmFamilyEventApiArg = {
  id: string;
};
export type RejectFamilyEventApiResponse = /** status 200  */ FamilyEventResponseDto;
export type RejectFamilyEventApiArg = {
  id: string;
};
export type CreateFirstDateApiResponse = /** status 201  */ FirstDateResponseDto;
export type CreateFirstDateApiArg = {
  /** Retry key for this command (8-128 safe ASCII characters). Reusing it with another payload returns 409. */
  'Idempotency-Key'?: string;
  createFirstDateDto: CreateFirstDateDto;
};
export type FindMyFirstDateApiResponse = /** status 200  */ FirstDateResponseDto;
export type FindMyFirstDateApiArg = void;
export type UpdateFirstDateApiResponse = /** status 200  */ FirstDateResponseDto;
export type UpdateFirstDateApiArg = {
  /** Current resource version. Omit for backward-compatible last-write-wins behavior. */
  'If-Match'?: string;
  updateFirstDateDto: UpdateFirstDateDto;
};
export type RemoveFirstDateApiResponse = unknown;
export type RemoveFirstDateApiArg = void;
export type ProjectApiResponse = /** status 200  */ CalendarProjectionResponseDto;
export type ProjectApiArg = {
  /** Inclusive date in the family timezone */
  dateFrom: string;
  /** Exclusive date in the family timezone */
  dateTo: string;
};
export type Create14ApiResponse = /** status 201  */ WellbeingCheckInResponseDto;
export type Create14ApiArg = {
  createWellbeingCheckInDto: CreateWellbeingCheckInDto;
};
export type List14ApiResponse = /** status 200  */ WellbeingCheckInResponseDto[];
export type List14ApiArg = void;
export type DeleteAllApiResponse = unknown;
export type DeleteAllApiArg = void;
export type FindOneApiResponse = /** status 200  */ WellbeingCheckInResponseDto;
export type FindOneApiArg = {
  id: string;
};
export type Remove4ApiResponse = unknown;
export type Remove4ApiArg = {
  id: string;
};
export type GrantConsentApiResponse = /** status 201  */ WellbeingConsentResponseDto;
export type GrantConsentApiArg = {
  createWellbeingConsentDto: CreateWellbeingConsentDto;
};
export type ListConsentsApiResponse = /** status 200  */ WellbeingConsentResponseDto[];
export type ListConsentsApiArg = void;
export type RevokeConsentApiResponse = unknown;
export type RevokeConsentApiArg = {
  id: string;
};
export type SharedWithMeApiResponse = /** status 200  */ WellbeingCheckInResponseDto[];
export type SharedWithMeApiArg = void;
export type CreateAssessmentApiResponse = /** status 201  */ WellbeingAssessmentResponseDto;
export type CreateAssessmentApiArg = {
  createWellbeingAssessmentDto: CreateWellbeingAssessmentDto;
};
export type ListAssessmentsApiResponse = /** status 200  */ WellbeingAssessmentResponseDto[];
export type ListAssessmentsApiArg = void;
export type TrendsApiResponse = /** status 200  */ object;
export type TrendsApiArg = void;
export type ExportDataApiResponse = /** status 200  */ object;
export type ExportDataApiArg = void;
export type CreateGratitudeApiResponse = /** status 201  */ WellbeingGratitudeResponseDto;
export type CreateGratitudeApiArg = {
  createWellbeingGratitudeDto: CreateWellbeingGratitudeDto;
};
export type ListGratitudesApiResponse = /** status 200  */ WellbeingGratitudeResponseDto[];
export type ListGratitudesApiArg = void;
export type RemoveGratitudeApiResponse = unknown;
export type RemoveGratitudeApiArg = {
  id: string;
};
export type CreateSupportRequestApiResponse = /** status 201  */ WellbeingSupportRequestResponseDto;
export type CreateSupportRequestApiArg = {
  createWellbeingSupportRequestDto: CreateWellbeingSupportRequestDto;
};
export type ListSupportRequestsApiResponse =
  /** status 200  */ WellbeingSupportRequestResponseDto[];
export type ListSupportRequestsApiArg = void;
export type UpdateSupportRequestApiResponse = /** status 200  */ WellbeingSupportRequestResponseDto;
export type UpdateSupportRequestApiArg = {
  id: string;
  updateWellbeingSupportRequestDto: UpdateWellbeingSupportRequestDto;
};
export type CreateRitualApiResponse = /** status 201  */ WellbeingRitualResponseDto;
export type CreateRitualApiArg = {
  createWellbeingRitualDto: CreateWellbeingRitualDto;
};
export type ListRitualsApiResponse = /** status 200  */ WellbeingRitualResponseDto[];
export type ListRitualsApiArg = void;
export type UpdateRitualApiResponse = /** status 200  */ WellbeingRitualResponseDto;
export type UpdateRitualApiArg = {
  id: string;
  updateWellbeingRitualDto: UpdateWellbeingRitualDto;
};
export type RemoveRitualApiResponse = unknown;
export type RemoveRitualApiArg = {
  id: string;
};
export type CreateCoupleMeetingApiResponse = /** status 201  */ WellbeingCoupleMeetingResponseDto;
export type CreateCoupleMeetingApiArg = {
  createWellbeingCoupleMeetingDto: CreateWellbeingCoupleMeetingDto;
};
export type ListCoupleMeetingsApiResponse = /** status 200  */ WellbeingCoupleMeetingResponseDto[];
export type ListCoupleMeetingsApiArg = void;
export type UpdateCoupleMeetingApiResponse = /** status 200  */ WellbeingCoupleMeetingResponseDto;
export type UpdateCoupleMeetingApiArg = {
  id: string;
  updateWellbeingCoupleMeetingDto: UpdateWellbeingCoupleMeetingDto;
};
export type RespondToCoupleMeetingApiResponse =
  /** status 200  */ WellbeingCoupleMeetingResponseDto;
export type RespondToCoupleMeetingApiArg = {
  id: string;
  wellbeingCoupleMeetingResponseInputDto: WellbeingCoupleMeetingResponseInputDto;
};
export type PublishCoupleMeetingApiResponse = /** status 200  */ WellbeingCoupleMeetingResponseDto;
export type PublishCoupleMeetingApiArg = {
  id: string;
};
export type SetCoupleMeetingDecisionApiResponse =
  /** status 200  */ WellbeingCoupleMeetingResponseDto;
export type SetCoupleMeetingDecisionApiArg = {
  id: string;
  wellbeingCoupleMeetingDecisionDto: WellbeingCoupleMeetingDecisionDto;
};
export type CheckHealthApiResponse = /** status 200  */ any;
export type CheckHealthApiArg = void;
export type TaskResponseDto = {
  id: string;
  familyId: string;
  createdById: string;
  assignedToId?: object | null;
  childId?: object | null;
  completedById?: object | null;
  title: string;
  description?: object | null;
  dueAt?: string | null;
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  status: 'OPEN' | 'COMPLETED' | 'ARCHIVED';
  version: number;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};
export type CreateTaskDto = {
  title: string;
  description?: string;
  dueAt?: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH';
  assignedToId?: string | null;
  childId?: string | null;
};
export type UpdateTaskDto = {
  title?: string;
  description?: string;
  dueAt?: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH';
  assignedToId?: string | null;
  childId?: string | null;
};
export type TaskRoutineResponseDto = {
  id: string;
  familyId: string;
  createdById: string;
  assignedToId?: object | null;
  childId?: object | null;
  title: string;
  description?: object | null;
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  frequency: 'DAILY' | 'WEEKLY';
  interval: number;
  nextRunAt: string;
  active: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
};
export type CreateTaskRoutineDto = {
  title: string;
  description?: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH';
  frequency: 'DAILY' | 'WEEKLY';
  interval: number;
  nextRunAt: string;
  assignedToId?: string | null;
  childId?: string | null;
};
export type UpdateTaskRoutineDto = {
  title?: string;
  description?: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH';
  frequency?: 'DAILY' | 'WEEKLY';
  interval?: number;
  nextRunAt?: string;
  assignedToId?: string | null;
  childId?: string | null;
};
export type WalletResponseDto = {
  id: string;
  familyId: string;
  ownerId?: object | null;
  createdById: string;
  type: 'PERSONAL' | 'FAMILY';
  visibility: 'PRIVATE' | 'PARTNER' | 'FAMILY';
  name: string;
  currency: string;
  version: number;
  archivedAt?: object | null;
  createdAt: string;
  updatedAt: string;
};
export type CreateWalletDto = {
  type: 'PERSONAL' | 'FAMILY';
  name: string;
  visibility?: 'PRIVATE' | 'PARTNER' | 'FAMILY';
  currency?: string;
};
export type UpdateWalletDto = {
  name?: string;
  visibility?: 'PRIVATE' | 'PARTNER' | 'FAMILY';
};
export type LedgerEntryResponseDto = {
  id: string;
  walletId?: object | null;
  /** Signed amount in minor currency units. */
  amountMinor: string;
  createdAt: string;
};
export type LedgerTransactionResponseDto = {
  id: string;
  familyId: string;
  createdById: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'REVERSAL';
  currency: string;
  occurredAt: string;
  note?: object | null;
  reversesId?: object | null;
  categoryId?: object | null;
  createdAt: string;
  entries: LedgerEntryResponseDto[];
};
export type PaginatedLedgerTransactionsResponseDto = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: LedgerTransactionResponseDto[];
};
export type CreateLedgerCommandDto = {
  walletId: string;
  /** Family category for this income or expense. */
  categoryId?: string;
  /** Positive amount in minor currency units. JSON numbers are not accepted. */
  amountMinor: string;
  occurredAt?: string;
  note?: string;
};
export type CreateTransferCommandDto = {
  fromWalletId: string;
  toWalletId: string;
  /** Positive amount in minor currency units. JSON numbers are not accepted. */
  amountMinor: string;
  occurredAt?: string;
  note?: string;
};
export type ReverseLedgerTransactionDto = {
  occurredAt?: string;
  note?: string;
};
export type FinancialCategoryResponseDto = {
  id: string;
  familyId: string;
  createdById: string;
  kind: 'INCOME' | 'EXPENSE';
  name: string;
  version: number;
  createdAt: string;
  updatedAt: string;
};
export type CreateFinancialCategoryDto = {
  name: string;
  kind: 'INCOME' | 'EXPENSE';
};
export type UpdateFinancialCategoryDto = {
  name?: string;
};
export type BudgetResponseDto = {
  id: string;
  familyId: string;
  categoryId: string;
  createdById: string;
  periodStart: string;
  limitMinor: string;
  version: number;
  createdAt: string;
  updatedAt: string;
};
export type CreateBudgetDto = {
  categoryId: string;
  /** First calendar day of the budget month. */
  periodStart: string;
  /** Positive limit in minor currency units. */
  limitMinor: string;
};
export type UpdateBudgetDto = {
  /** Positive limit in minor currency units. */
  limitMinor: string;
};
export type RecurringPaymentResponseDto = {};
export type CreateRecurringPaymentDto = {
  walletId: string;
  type: 'INCOME' | 'EXPENSE';
  title: string;
  amountMinor: string;
  frequency: 'WEEKLY' | 'MONTHLY';
  nextDueAt: string;
  categoryId?: string;
  note?: string;
  interval?: number;
  reminderOffsetMinutes?: number;
  /** Defaults to the creator. */
  reminderRecipientIds?: string[];
};
export type RecurringPaymentForecastResponseDto = {};
export type UpdateRecurringPaymentDto = {
  title?: string;
  note?: string;
  amountMinor?: string;
  frequency?: 'WEEKLY' | 'MONTHLY';
  interval?: number;
  nextDueAt?: string;
  categoryId?: string | null;
  reminderOffsetMinutes?: number | null;
  reminderRecipientIds?: string[];
  active?: boolean;
};
export type FinancialAmountByCurrencyResponseDto = {
  currency: string;
  /** Absolute amount in minor currency units. */
  amountMinor: string;
};
export type FinancialSummaryBudgetResponseDto = {
  id: string;
  /** Planned limit in the family default currency. */
  limitMinor: string;
  /** Actual expense in the family default currency. */
  actualMinor: string;
  /** Limit minus actual; may be negative. */
  remainingMinor: string;
  version: number;
};
export type FinancialSummaryCategoryResponseDto = {
  id: string;
  name: string;
  kind: 'INCOME' | 'EXPENSE';
  archived: boolean;
  actual: FinancialAmountByCurrencyResponseDto[];
  budget?: FinancialSummaryBudgetResponseDto | null;
};
export type FinancialSummaryResponseDto = {
  periodStart: string;
  defaultCurrency: string;
  categories: FinancialSummaryCategoryResponseDto[];
};
export type FinancialGoalResponseDto = {};
export type CreateFinancialGoalDto = {
  title: string;
  targetAmountMinor: string;
  /** Creates a dedicated goal envelope wallet. */
  type: 'PERSONAL' | 'FAMILY';
  visibility?: 'PRIVATE' | 'PARTNER' | 'FAMILY';
  currency?: string;
  /** Optional target calendar date. */
  targetDate?: string;
};
export type UpdateFinancialGoalDto = {
  title?: string;
  targetAmountMinor?: string;
  targetDate?: object | null;
};
export type FinancialGoalContributionResponseDto = {};
export type CreateFinancialGoalContributionDto = {
  fromWalletId: string;
  amountMinor: string;
  occurredAt?: string;
  note?: string;
};
export type FinancialCashFlowCurrencyResponseDto = {
  currency: string;
  /** Minor units. */
  incomeMinor: string;
  /** Minor units. */
  expenseMinor: string;
  /** Income minus expense in minor units. */
  netMinor: string;
};
export type FinancialCashFlowMonthResponseDto = {
  periodStart: string;
  actual: FinancialCashFlowCurrencyResponseDto[];
  mandatory: FinancialCashFlowCurrencyResponseDto[];
};
export type FinancialBalanceForecastResponseDto = {
  currency: string;
  /** Visible balance at the forecast start. */
  currentBalanceMinor: string;
  plannedIncomeMinor: string;
  plannedExpenseMinor: string;
  projectedBalanceMinor: string;
};
export type FinancialAnalyticsResponseDto = {
  periodStart: string;
  months: number;
  cashFlow: FinancialCashFlowMonthResponseDto[];
  forecastAsOf: string;
  forecastThrough: string;
  balanceForecast: FinancialBalanceForecastResponseDto[];
};
export type FinancialMeetingResponseDto = {};
export type CreateFinancialMeetingDto = {
  title: string;
  scheduledAt: string;
  notes?: string;
};
export type UpdateFinancialMeetingDto = {
  title?: string;
  scheduledAt?: string;
  notes?: object | null;
};
export type FinancialDecisionResponseDto = {};
export type CreateFinancialDecisionDto = {
  title: string;
  description?: string;
};
export type RespondFinancialDecisionDto = {
  status: 'AGREED' | 'REJECTED';
};
export type ExpenseStatisticsAmountDto = {
  currency: string;
  /** Minor units. */
  amountMinor: string;
};
export type ExpenseStatisticsCategoryDto = {
  categoryId?: object | null;
  name: string;
  totals: ExpenseStatisticsAmountDto[];
};
export type ExpenseStatisticsMemberDto = {
  userId: string;
  firstName: string;
  lastName: string;
  totals: ExpenseStatisticsAmountDto[];
  categories: ExpenseStatisticsCategoryDto[];
};
export type ExpenseStatisticsResponseDto = {
  dateFrom?: object | null;
  dateTo?: object | null;
  totals: ExpenseStatisticsAmountDto[];
  members: ExpenseStatisticsMemberDto[];
};
export type ShoppingItemResponseDto = {
  id: string;
  listId: string;
  name: string;
  quantity?: object | null;
  checked: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
};
export type ShoppingListResponseDto = {
  id: string;
  familyId: string;
  name: string;
  archived: boolean;
  version: number;
  items: ShoppingItemResponseDto[];
  createdAt: string;
  updatedAt: string;
};
export type CreateShoppingListDto = {
  name: string;
};
export type CreateShoppingItemDto = {
  name: string;
  quantity?: string;
};
export type RecipeIngredientResponseDto = {
  name: string;
  quantity?: string;
  id: string;
};
export type RecipeDietaryLabelResponseDto = {
  id: string;
  label: string;
};
export type RecipeResponseDto = {
  id: string;
  familyId: string;
  createdById: string;
  name: string;
  instructions?: object | null;
  archived: boolean;
  version: number;
  ingredients: RecipeIngredientResponseDto[];
  dietaryLabels: RecipeDietaryLabelResponseDto[];
  createdAt: string;
  updatedAt: string;
};
export type RecipeIngredientDto = {
  name: string;
  quantity?: string;
};
export type CreateRecipeDto = {
  name: string;
  instructions?: string;
  ingredients: RecipeIngredientDto[];
  dietaryLabels?: string[];
};
export type UpdateRecipeDto = {
  name?: string;
  instructions?: object | null;
  ingredients?: RecipeIngredientDto[];
  dietaryLabels?: string[];
};
export type MealPlanResponseDto = {
  id: string;
  familyId: string;
  createdById: string;
  recipeId: string;
  plannedFor: string;
  mealSlot: string;
  servings: number;
  version: number;
  recipe: RecipeResponseDto;
  createdAt: string;
  updatedAt: string;
};
export type CreateMealPlanDto = {
  plannedFor: string;
  mealSlot: string;
  recipeId: string;
  servings?: number;
};
export type UpdateMealPlanDto = {
  plannedFor?: string;
  mealSlot?: string;
  recipeId?: string;
  servings?: number;
};
export type GenerateShoppingDto = {
  listId: string;
};
export type NotificationPreferencesResponseDto = {
  inAppEnabled: boolean;
  emailEnabled: boolean;
  telegramEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: object | null;
  quietHoursEnd?: object | null;
};
export type UpdateNotificationPreferencesDto = {
  inAppEnabled?: boolean;
  emailEnabled?: boolean;
  telegramEnabled?: boolean;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
};
export type NotificationResponseDto = {
  id: string;
  userId: string;
  familyId?: object | null;
  type: string;
  title: string;
  body?: object | null;
  readAt?: string | null;
  createdAt: string;
};
export type PaginatedNotificationsResponseDto = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: NotificationResponseDto[];
};
export type TaskReminderResponseDto = {
  id: string;
  taskId: string;
  userId: string;
  remindAt: string;
  sentAt: string | null;
  createdAt: string;
};
export type CreateTaskReminderDto = {
  remindAt: string;
};
export type UserResponseDto = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'NOT_SPECIFIED';
  description?: string | null;
  birthDate: string;
  phone?: string | null;
  locale: string;
  timeZone: string;
  version: number;
  createdAt: string;
};
export type AuthResponseDto = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponseDto;
};
export type RegisterDto = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'NOT_SPECIFIED';
  description?: string;
  birthDate: string;
  phone?: string;
};
export type LoginDto = {
  email: string;
  password: string;
};
export type PasswordResetRequestResponseDto = {
  message: string;
};
export type RequestPasswordResetDto = {
  email: string;
};
export type ResetPasswordDto = {
  /** One-time token from the password reset link */
  token: string;
  newPassword: string;
};
export type RequestEmailChangeDto = {
  email: string;
  currentPassword: string;
};
export type ConfirmEmailChangeDto = {
  /** One-time email change token */
  token: string;
};
export type AccountDeletionRequestResponseDto = {
  scheduledFor: string;
};
export type RequestAccountDeletionDto = {
  currentPassword: string;
};
export type CancelAccountDeletionDto = {
  /** One-time account recovery token */
  token: string;
};
export type AuthSessionResponseDto = {
  id: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  lastSeenAt: string;
  expiresAt: string;
  createdAt: string;
  isCurrent: boolean;
};
export type ChangePasswordDto = {
  currentPassword: string;
  newPassword: string;
};
export type UpdateCurrentUserDto = {
  firstName?: string;
  lastName?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'NOT_SPECIFIED';
  description?: string | null;
  phone?: string | null;
  locale?: string;
  timeZone?: string;
};
export type ExportMemberDto = {
  id: string;
  role: string;
  joinedAt: string;
  userId: string;
};
export type ExportFamilyDto = {
  id: string;
  status: string;
  timeZone: string;
  locale: string;
  defaultCurrency: string;
  members: ExportMemberDto[];
  events: object[];
  firstDate: object | null;
};
export type AccountExportResponseDto = {
  format: string;
  exportedAt: string;
  profile: object;
  families: ExportFamilyDto[];
  invitations: object[];
};
export type PublicUserResponseDto = {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'NOT_SPECIFIED';
  description?: string | null;
  email: string;
  /** Whether the user already belongs to a family */
  hasFamily: boolean;
};
export type PaginatedUsersResponseDto = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: PublicUserResponseDto[];
};
export type TelegramLinkTokenResponseDto = {
  token: string;
  expiresAt: string;
};
export type TelegramConnectionResponseDto = {
  id: string;
  telegramUserId: string;
  status: string;
  linkedAt: string;
  revokedAt?: object | null;
};
export type TelegramLinkExchangeResponseDto = {
  linked: boolean;
  connectionId: string;
};
export type ExchangeTelegramLinkDto = {
  token: string;
  telegramUserId: string;
  chatId: string;
};
export type TelegramIntegrationConnectionResponseDto = {
  status: string;
  linkedAt: string;
  revokedAt?: object | null;
};
export type FamilyMemberResponseDto = {
  id: string;
  role: 'PARTNER' | 'CHILD';
  joinedAt: string;
  user: UserResponseDto;
};
export type FamilyResponseDto = {
  id: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DISSOLVED';
  timeZone: string;
  locale: string;
  defaultCurrency: string;
  createdAt: string;
  members: FamilyMemberResponseDto[];
};
export type FamilyDashboardEventDto = {
  id: string;
  name: string;
  scheduledAt: string;
};
export type FamilyDashboardResponseDto = {
  openTasks: number;
  overdueTasks: number;
  uncheckedShoppingItems: number;
  unreadNotifications: number;
  upcomingEvents: number;
  nextEvents: FamilyDashboardEventDto[];
  generatedAt: string;
};
export type AuditEventResponseDto = {
  id: string;
  actorId?: object | null;
  familyId: string;
  action: string;
  resourceType: string;
  resourceId?: object | null;
  metadata?: object | null;
  createdAt: string;
};
export type PaginatedAuditEventsResponseDto = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: AuditEventResponseDto[];
};
export type DissolutionResponseDto = {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  familyId: string;
  requestedById: string;
  confirmedById?: object | null;
  requestedAt: string;
  confirmedAt?: object | null;
};
export type FamilyInvitationResponseDto = {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';
  sender: PublicUserResponseDto;
  recipient: PublicUserResponseDto;
  expiresAt: string;
  respondedAt?: string | null;
  createdAt: string;
};
export type CreateFamilyInvitationDto = {
  recipientId: string;
};
export type CreatedPrivateFamilyInvitationResponseDto = {
  id: string;
  recipientEmail: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';
  expiresAt: string;
  respondedAt?: string | null;
  createdAt: string;
  /** Shown only in the create response. Share it directly with the intended partner. */
  inviteUrl: string;
};
export type CreatePrivateFamilyInvitationDto = {
  recipientEmail: string;
};
export type PrivateFamilyInvitationResponseDto = {
  id: string;
  recipientEmail: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';
  expiresAt: string;
  respondedAt?: string | null;
  createdAt: string;
};
export type AcceptPrivateFamilyInvitationDto = {
  /** One-time token from the invitation link */
  token: string;
};
export type ChildProfileResponseDto = {
  id: string;
  familyId: string;
  firstName: string;
  lastName?: object;
  birthDate: string;
  avatarUrl?: object;
  createdAt: string;
  updatedAt: string;
};
export type CreateChildProfileDto = {
  firstName: string;
  lastName?: string;
  birthDate: string;
  avatarUrl?: string;
};
export type ChildProfileExportDto = {
  profile: ChildProfileResponseDto;
  tasks: object[];
  events: object[];
};
export type UpdateChildProfileDto = {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  avatarUrl?: string;
};
export type FamilyEventResponseDto = {
  id: string;
  familyId: string;
  childId?: object | null;
  name: string;
  description?: string | null;
  scheduledAt: string;
  location: string;
  reminderOffsetMinutes?: object | null;
  reminderRecipientIds: string[];
  repeatReminderAt?: string | null;
  status: 'PROPOSED' | 'CONFIRMED' | 'REJECTED' | 'EVENT_DAY' | 'COMPLETED';
  proposedBy: UserResponseDto;
  respondedBy?: UserResponseDto | null;
  respondedAt?: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
};
export type CreateFamilyEventDto = {
  /** Optional child profile this event concerns */
  childId?: object | null;
  name: string;
  description?: string;
  /** Event date and time in ISO 8601 format */
  scheduledAt: string;
  location: string;
  /** Send the first reminder this many minutes before the event */
  reminderOffsetMinutes?: object | null;
  /** Family member IDs that receive both configured reminders */
  reminderRecipientIds?: string[] | null;
  /** Optional second reminder time in ISO 8601 format */
  repeatReminderAt?: object | null;
};
export type PaginatedFamilyEventsResponseDto = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: FamilyEventResponseDto[];
};
export type UpdateFamilyEventDto = {
  /** Optional child profile this event concerns */
  childId?: object | null;
  name?: string;
  description?: string;
  /** Event date and time in ISO 8601 format */
  scheduledAt?: string;
  location?: string;
  /** Send the first reminder this many minutes before the event */
  reminderOffsetMinutes?: object | null;
  /** Family member IDs that receive both configured reminders */
  reminderRecipientIds?: string[] | null;
  /** Optional second reminder time in ISO 8601 format */
  repeatReminderAt?: object | null;
};
export type FirstDateResponseDto = {
  id: string;
  familyId: string;
  name: string;
  date: string;
  description?: string | null;
  version: number;
  createdBy: UserResponseDto;
  createdAt: string;
  updatedAt: string;
};
export type CreateFirstDateDto = {
  name: string;
  date: string;
  description?: string;
};
export type UpdateFirstDateDto = {
  name?: string;
  date?: string;
  description?: string;
};
export type CalendarEntryResponseDto = {
  id: string;
  sourceId: string;
  kind: 'FAMILY_EVENT' | 'TASK' | 'TASK_REMINDER';
  title: string;
  startsAt: string;
  status: string;
  assignedToId?: object | null;
  childId?: object | null;
};
export type CalendarProjectionResponseDto = {
  dateFrom: string;
  dateTo: string;
  timeZone: string;
  data: CalendarEntryResponseDto[];
  /** True when more than 500 matching entries exist */
  truncated: boolean;
};
export type WellbeingCheckInResponseDto = {
  id: string;
  ownerId: string;
  mood: number;
  energy: number;
  stress: number;
  note?: object | null;
  supportRequest: boolean;
  createdAt: string;
  updatedAt: string;
};
export type CreateWellbeingCheckInDto = {
  mood: number;
  energy: number;
  stress: number;
  note?: string;
  supportRequest?: boolean;
};
export type WellbeingConsentResponseDto = {
  id: string;
  recipientId: string;
  scopes: ('mood' | 'energy' | 'stress' | 'supportRequest')[];
  expiresAt?: object | null;
  revokedAt?: object | null;
};
export type CreateWellbeingConsentDto = {
  recipientId: string;
  scopes: ('mood' | 'energy' | 'stress' | 'supportRequest')[];
  expiresAt?: string | null;
};
export type WellbeingAssessmentResponseDto = {
  id: string;
  answers: number[];
  score: number;
  createdAt: string;
};
export type CreateWellbeingAssessmentDto = {
  answers: number[];
};
export type WellbeingGratitudeResponseDto = {
  id: string;
  authorId: string;
  recipientId: string;
  message: string;
  createdAt: string;
};
export type CreateWellbeingGratitudeDto = {
  recipientId: string;
  message: string;
};
export type WellbeingSupportRequestResponseDto = {
  id: string;
  requesterId: string;
  recipientId: string;
  message?: object;
  status: 'OPEN' | 'ACKNOWLEDGED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
};
export type CreateWellbeingSupportRequestDto = {
  recipientId: string;
  message?: string;
};
export type UpdateWellbeingSupportRequestDto = {
  status: 'OPEN' | 'ACKNOWLEDGED' | 'CLOSED';
};
export type WellbeingRitualResponseDto = {
  id: string;
  familyId: string;
  createdById: string;
  title: string;
  description?: object;
  cadence: string;
  nextAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
export type CreateWellbeingRitualDto = {
  title: string;
  description?: string;
  cadence: string;
  nextAt: string;
};
export type UpdateWellbeingRitualDto = {
  title?: string;
  description?: string;
  cadence?: string;
  nextAt?: string;
  isActive?: boolean;
};
export type WellbeingCoupleMeetingResponseDto = {};
export type CreateWellbeingCoupleMeetingDto = {
  title: string;
  scheduledAt: string;
  sections: string[];
};
export type UpdateWellbeingCoupleMeetingDto = {
  title?: string;
  scheduledAt?: string;
  sections?: string[];
};
export type WellbeingCoupleMeetingResponseInputDto = {
  response: string;
};
export type WellbeingCoupleMeetingDecisionDto = {
  decision: string;
};
export const {
  useCreateMutation,
  useListQuery,
  useUpdateMutation,
  useArchiveMutation,
  useCompleteMutation,
  useReopenMutation,
  useCreate2Mutation,
  useList2Query,
  useListArchivedQuery,
  useUpdate2Mutation,
  useArchive2Mutation,
  useGenerateMutation,
  useRestoreMutation,
  useCreate3Mutation,
  useList3Query,
  useArchivedQuery,
  useGetApiV1FamiliesMeWalletsByIdQuery,
  useUpdate3Mutation,
  useArchive3Mutation,
  useRestore2Mutation,
  useList4Query,
  useGet2Query,
  useIncomeMutation,
  useExpenseMutation,
  useTransferMutation,
  useReverseMutation,
  useCreate4Mutation,
  useList5Query,
  useArchived2Query,
  useUpdate4Mutation,
  useArchive4Mutation,
  useRestore3Mutation,
  useCreate5Mutation,
  useList6Query,
  useUpdate5Mutation,
  useRemoveMutation,
  useCreate6Mutation,
  useList7Query,
  useArchived3Query,
  useForecastsQuery,
  useUpdate6Mutation,
  useArchive5Mutation,
  useRestore4Mutation,
  useGet3Query,
  useCreate7Mutation,
  useList8Query,
  useArchived4Query,
  useUpdate7Mutation,
  useArchive6Mutation,
  useContributeMutation,
  useRestore5Mutation,
  useGet4Query,
  useCreate8Mutation,
  useList9Query,
  useUpdate8Mutation,
  useCancelMutation,
  useComplete2Mutation,
  useCreateDecisionMutation,
  useRespondMutation,
  useGet5Query,
  useListsQuery,
  useCreate9Mutation,
  useArchived5Query,
  useAddMutation,
  useCheckMutation,
  useUncheckMutation,
  useArchive7Mutation,
  useRestore6Mutation,
  useList10Query,
  useCreate10Mutation,
  useListArchived2Query,
  useUpdate9Mutation,
  useArchive8Mutation,
  useRestore7Mutation,
  useCreatePlanMutation,
  useListPlansQuery,
  useUpdatePlanMutation,
  useDeletePlanMutation,
  useGenerateShoppingMutation,
  usePreferencesGetQuery,
  usePreferencesUpdateMutation,
  useListPaginatedQuery,
  useList11Query,
  useReadMutation,
  useReadAllMutation,
  useCreate11Mutation,
  useList12Query,
  useRemove2Mutation,
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useRequestEmailChangeMutation,
  useConfirmEmailChangeMutation,
  useRequestAccountDeletionMutation,
  useCancelAccountDeletionMutation,
  useListSessionsQuery,
  useRevokeOtherSessionsMutation,
  useRevokeSessionMutation,
  useChangePasswordMutation,
  useFindCurrentUserQuery,
  useUpdateCurrentUserMutation,
  useExportCurrentUserQuery,
  useFindUsersQuery,
  useFindUserByIdQuery,
  useCreate12Mutation,
  useStatusQuery,
  useUnlinkMutation,
  useExchangeMutation,
  useIntegrationStatusQuery,
  useIntegrationUnlinkMutation,
  useIntegrationNotificationsQuery,
  useFindMyFamilyQuery,
  useDashboardQuery,
  useListAuditEventsQuery,
  useLeaveFamilyMutation,
  useArchiveFamilyMutation,
  useRestoreFamilyMutation,
  useRequestDissolutionMutation,
  useConfirmDissolutionMutation,
  useCancelDissolutionMutation,
  useCreateFamilyInvitationMutation,
  useCreatePrivateFamilyInvitationMutation,
  useFindOutgoingPrivateFamilyInvitationsQuery,
  useAcceptPrivateFamilyInvitationMutation,
  useRevokePrivateFamilyInvitationMutation,
  useFindIncomingInvitationsQuery,
  useFindOutgoingInvitationsQuery,
  useAcceptFamilyInvitationMutation,
  useRejectFamilyInvitationMutation,
  useCancelFamilyInvitationMutation,
  useCreate13Mutation,
  useList13Query,
  useGetApiV1FamiliesMeChildrenByIdExportQuery,
  useUpdate10Mutation,
  useRemove3Mutation,
  useCreateFamilyEventMutation,
  useFindFamilyEventsQuery,
  useFindFamilyEventByIdQuery,
  useUpdateFamilyEventMutation,
  useRemoveFamilyEventMutation,
  useConfirmFamilyEventMutation,
  useRejectFamilyEventMutation,
  useCreateFirstDateMutation,
  useFindMyFirstDateQuery,
  useUpdateFirstDateMutation,
  useRemoveFirstDateMutation,
  useProjectQuery,
  useCreate14Mutation,
  useList14Query,
  useDeleteAllMutation,
  useFindOneQuery,
  useRemove4Mutation,
  useGrantConsentMutation,
  useListConsentsQuery,
  useRevokeConsentMutation,
  useSharedWithMeQuery,
  useCreateAssessmentMutation,
  useListAssessmentsQuery,
  useTrendsQuery,
  useExportDataQuery,
  useCreateGratitudeMutation,
  useListGratitudesQuery,
  useRemoveGratitudeMutation,
  useCreateSupportRequestMutation,
  useListSupportRequestsQuery,
  useUpdateSupportRequestMutation,
  useCreateRitualMutation,
  useListRitualsQuery,
  useUpdateRitualMutation,
  useRemoveRitualMutation,
  useCreateCoupleMeetingMutation,
  useListCoupleMeetingsQuery,
  useUpdateCoupleMeetingMutation,
  useRespondToCoupleMeetingMutation,
  usePublishCoupleMeetingMutation,
  useSetCoupleMeetingDecisionMutation,
  useCheckHealthQuery,
} = injectedRtkApi;
