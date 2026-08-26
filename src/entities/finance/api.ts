import { baseApi } from '@/shared/api/baseApi';

export type Wallet = {
  id: string;
  name: string;
  type: 'PERSONAL' | 'FAMILY';
  visibility: string;
  currency: string;
  version: number;
  ownerId?: string | null;
};
export type LedgerEntry = {
  id: string;
  walletId: string | null;
  amountMinor: string;
  createdAt: string;
};
export type LedgerTransaction = {
  id: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'REVERSAL';
  currency: string;
  occurredAt: string;
  note: string | null;
  categoryId: string | null;
  entries: LedgerEntry[];
  createdById?: string;
};
export type FinancialCategory = {
  id: string;
  name: string;
  kind: 'INCOME' | 'EXPENSE';
  version: number;
};
export type FinancialSummary = {
  defaultCurrency: string;
  categories: Array<{
    id: string;
    name: string;
    kind: 'INCOME' | 'EXPENSE';
    actual: Array<{ currency: string; amountMinor: string }>;
  }>;
};
export type ExpenseStatistics = {
  dateFrom: string | null;
  dateTo: string | null;
  totals: Array<{ currency: string; amountMinor: string }>;
  members: Array<{
    userId: string;
    firstName: string;
    lastName: string;
    totals: Array<{ currency: string; amountMinor: string }>;
  }>;
};
export type LedgerPage = {
  data: LedgerTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
export type LedgerCommand = {
  walletId: string;
  amountMinor: string;
  occurredAt?: string;
  note?: string;
  categoryId?: string;
};
export type TransferCommand = {
  fromWalletId: string;
  toWalletId: string;
  amountMinor: string;
  occurredAt?: string;
  note?: string;
};

export type FinancialGoal = {
  id: string;
  title: string;
  targetAmountMinor: string;
  currentAmountMinor: string;
  remainingAmountMinor: string;
  currency: string;
  targetDate: string | null;
  achievedAt: string | null;
  archived: boolean;
  version: number;
  envelope: { walletId: string; type: 'PERSONAL' | 'FAMILY'; visibility: string };
};
export type FinancialBudget = {
  id: string;
  categoryId: string;
  periodStart: string;
  limitMinor: string;
  version: number;
};
export type RecurringPayment = {
  id: string;
  walletId: string;
  categoryId: string | null;
  type: 'INCOME' | 'EXPENSE';
  title: string;
  note: string | null;
  amountMinor: string;
  frequency: 'WEEKLY' | 'MONTHLY';
  interval: number;
  nextDueAt: string;
  reminderOffsetMinutes: number | null;
  reminderRecipientIds: string[];
  active: boolean;
  version: number;
};
export type RecurringPaymentForecast = {
  id: string;
  dueAt: string;
  reminderAt: string;
  reminderSentAt: string | null;
};
export type FinancialAnalytics = {
  periodStart: string;
  months: number;
  cashFlow: Array<{
    periodStart: string;
    actual: Array<{
      currency: string;
      incomeMinor: string;
      expenseMinor: string;
      netMinor: string;
    }>;
    mandatory: Array<{
      currency: string;
      incomeMinor: string;
      expenseMinor: string;
      netMinor: string;
    }>;
  }>;
  forecastAsOf: string;
  forecastThrough: string;
  balanceForecast: Array<{
    currency: string;
    currentBalanceMinor: string;
    plannedIncomeMinor: string;
    plannedExpenseMinor: string;
    projectedBalanceMinor: string;
  }>;
};
export type FinancialMeeting = {
  id: string;
  title: string;
  scheduledAt: string;
  notes: string | null;
  status: string;
  version: number;
  decisions: Array<{
    id: string;
    title: string;
    description: string | null;
    status: string;
    version: number;
  }>;
};

const financeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listFinanceWallets: build.query<Wallet[], void>({
      query: () => '/api/v1/families/me/wallets',
      providesTags: ['finance-wallets'],
    }),
    createFinanceWallet: build.mutation<
      Wallet,
      { name: string; type: 'PERSONAL' | 'FAMILY'; currency: string; visibility?: string }
    >({
      query: (body) => ({ url: '/api/v1/families/me/wallets', method: 'POST', body }),
      invalidatesTags: ['finance-wallets'],
    }),
    updateFinanceWallet: build.mutation<
      Wallet,
      { id: string; name?: string; visibility?: string; version?: number }
    >({
      query: ({ id, version, ...body }) => ({
        url: `/api/v1/families/me/wallets/${id}`,
        method: 'PATCH',
        body,
        headers: version ? { 'If-Match': String(version) } : undefined,
      }),
      invalidatesTags: ['finance-wallets'],
    }),
    archiveFinanceWallet: build.mutation<void, { id: string; version?: number }>({
      query: ({ id, version }) => ({
        url: `/api/v1/families/me/wallets/${id}`,
        method: 'DELETE',
        headers: version ? { 'If-Match': String(version) } : undefined,
      }),
      invalidatesTags: ['finance-wallets'],
    }),
    listArchivedFinanceWallets: build.query<Wallet[], void>({
      query: () => '/api/v1/families/me/wallets/archived',
      providesTags: ['finance-wallets'],
    }),
    restoreFinanceWallet: build.mutation<Wallet, { id: string; version?: number }>({
      query: ({ id, version }) => ({
        url: `/api/v1/families/me/wallets/${id}/restore`,
        method: 'POST',
        headers: version ? { 'If-Match': String(version) } : undefined,
      }),
      invalidatesTags: ['finance-wallets'],
    }),
    listLedger: build.query<LedgerPage, { page?: number; limit?: number; walletId?: string }>({
      query: ({ page = 1, limit = 20, walletId }) => ({
        url: '/api/v1/families/me/ledger',
        params: { page, limit, walletId },
      }),
      providesTags: ['finance-ledger'],
    }),
    createIncome: build.mutation<LedgerTransaction, { body: LedgerCommand; key: string }>({
      query: ({ body, key }) => ({
        url: '/api/v1/families/me/ledger/income',
        method: 'POST',
        body,
        headers: { 'Idempotency-Key': key },
      }),
      invalidatesTags: ['finance-ledger'],
    }),
    createExpense: build.mutation<LedgerTransaction, { body: LedgerCommand; key: string }>({
      query: ({ body, key }) => ({
        url: '/api/v1/families/me/ledger/expense',
        method: 'POST',
        body,
        headers: { 'Idempotency-Key': key },
      }),
      invalidatesTags: ['finance-ledger'],
    }),
    createTransfer: build.mutation<LedgerTransaction, { body: TransferCommand; key: string }>({
      query: ({ body, key }) => ({
        url: '/api/v1/families/me/ledger/transfer',
        method: 'POST',
        body,
        headers: { 'Idempotency-Key': key },
      }),
      invalidatesTags: ['finance-ledger'],
    }),
    reverseLedger: build.mutation<LedgerTransaction, { id: string; key: string; note?: string }>({
      query: ({ id, key, note }) => ({
        url: `/api/v1/families/me/ledger/${id}/reversal`,
        method: 'POST',
        body: note ? { note } : {},
        headers: { 'Idempotency-Key': key },
      }),
      invalidatesTags: ['finance-ledger'],
    }),
    listFinancialCategories: build.query<FinancialCategory[], 'INCOME' | 'EXPENSE' | void>({
      query: (kind) => ({
        url: '/api/v1/families/me/financial-categories',
        params: kind ? { kind } : undefined,
      }),
      providesTags: ['finance-categories'],
    }),
    createFinancialCategory: build.mutation<
      FinancialCategory,
      { name: string; kind: 'INCOME' | 'EXPENSE' }
    >({
      query: (body) => ({ url: '/api/v1/families/me/financial-categories', method: 'POST', body }),
      invalidatesTags: ['finance-categories', 'finance-summary'],
    }),
    listFinancialGoals: build.query<FinancialGoal[], void>({
      query: () => '/api/v1/families/me/financial-goals',
      providesTags: ['finance-goals'],
    }),
    createFinancialGoal: build.mutation<
      FinancialGoal,
      {
        title: string;
        targetAmountMinor: string;
        type: 'PERSONAL' | 'FAMILY';
        currency?: string;
        targetDate?: string;
      }
    >({
      query: (body) => ({ url: '/api/v1/families/me/financial-goals', method: 'POST', body }),
      invalidatesTags: ['finance-goals', 'finance-wallets'],
    }),
    contributeFinancialGoal: build.mutation<
      unknown,
      {
        id: string;
        fromWalletId: string;
        amountMinor: string;
        key: string;
        occurredAt?: string;
        note?: string;
      }
    >({
      query: ({ id, key, ...body }) => ({
        url: `/api/v1/families/me/financial-goals/${id}/contributions`,
        method: 'POST',
        body,
        headers: { 'Idempotency-Key': key },
      }),
      invalidatesTags: ['finance-goals', 'finance-wallets', 'finance-ledger'],
    }),
    updateFinancialGoal: build.mutation<
      FinancialGoal,
      {
        id: string;
        title?: string;
        targetAmountMinor?: string;
        targetDate?: string | null;
        version?: number;
      }
    >({
      query: ({ id, version, ...body }) => ({
        url: `/api/v1/families/me/financial-goals/${id}`,
        method: 'PATCH',
        body,
        headers: version ? { 'If-Match': String(version) } : undefined,
      }),
      invalidatesTags: ['finance-goals'],
    }),
    archiveFinancialGoal: build.mutation<void, { id: string; version?: number }>({
      query: ({ id, version }) => ({
        url: `/api/v1/families/me/financial-goals/${id}`,
        method: 'DELETE',
        headers: version ? { 'If-Match': String(version) } : undefined,
      }),
      invalidatesTags: ['finance-goals', 'finance-wallets'],
    }),
    listArchivedFinancialGoals: build.query<FinancialGoal[], void>({
      query: () => '/api/v1/families/me/financial-goals/archived',
      providesTags: ['finance-goals'],
    }),
    restoreFinancialGoal: build.mutation<FinancialGoal, { id: string; version?: number }>({
      query: ({ id, version }) => ({
        url: `/api/v1/families/me/financial-goals/${id}/restore`,
        method: 'POST',
        headers: version ? { 'If-Match': String(version) } : undefined,
      }),
      invalidatesTags: ['finance-goals', 'finance-wallets'],
    }),
    listFinancialBudgets: build.query<FinancialBudget[], string | void>({
      query: (periodStart) => ({
        url: '/api/v1/families/me/budgets',
        params: periodStart ? { periodStart } : undefined,
      }),
      providesTags: ['finance-budgets'],
    }),
    createFinancialBudget: build.mutation<
      FinancialBudget,
      { categoryId: string; periodStart: string; limitMinor: string }
    >({
      query: (body) => ({ url: '/api/v1/families/me/budgets', method: 'POST', body }),
      invalidatesTags: ['finance-budgets', 'finance-summary'],
    }),
    updateFinancialBudget: build.mutation<
      FinancialBudget,
      { id: string; limitMinor: string; version?: number }
    >({
      query: ({ id, version, ...body }) => ({
        url: `/api/v1/families/me/budgets/${id}`,
        method: 'PATCH',
        body,
        headers: version ? { 'If-Match': String(version) } : undefined,
      }),
      invalidatesTags: ['finance-budgets', 'finance-summary'],
    }),
    archiveFinancialBudget: build.mutation<void, { id: string; version?: number }>({
      query: ({ id, version }) => ({
        url: `/api/v1/families/me/budgets/${id}`,
        method: 'DELETE',
        headers: version ? { 'If-Match': String(version) } : undefined,
      }),
      invalidatesTags: ['finance-budgets', 'finance-summary'],
    }),
    listRecurringPayments: build.query<RecurringPayment[], void>({
      query: () => '/api/v1/families/me/recurring-payments',
      providesTags: ['finance-recurring'],
    }),
    createRecurringPayment: build.mutation<
      RecurringPayment,
      {
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
        reminderRecipientIds?: string[];
      }
    >({
      query: (body) => ({ url: '/api/v1/families/me/recurring-payments', method: 'POST', body }),
      invalidatesTags: ['finance-recurring', 'finance-summary'],
    }),
    archiveRecurringPayment: build.mutation<void, { id: string; version?: number }>({
      query: ({ id, version }) => ({
        url: `/api/v1/families/me/recurring-payments/${id}`,
        method: 'DELETE',
        headers: version ? { 'If-Match': String(version) } : undefined,
      }),
      invalidatesTags: ['finance-recurring', 'finance-summary'],
    }),
    listArchivedRecurringPayments: build.query<RecurringPayment[], void>({
      query: () => '/api/v1/families/me/recurring-payments/archived',
      providesTags: ['finance-recurring'],
    }),
    listRecurringPaymentForecasts: build.query<RecurringPaymentForecast[], string>({
      query: (id) => `/api/v1/families/me/recurring-payments/${id}/forecasts`,
      providesTags: ['finance-recurring'],
    }),
    restoreRecurringPayment: build.mutation<RecurringPayment, { id: string; version?: number }>({
      query: ({ id, version }) => ({
        url: `/api/v1/families/me/recurring-payments/${id}/restore`,
        method: 'POST',
        headers: version ? { 'If-Match': String(version) } : undefined,
      }),
      invalidatesTags: ['finance-recurring', 'finance-summary'],
    }),
    updateRecurringPayment: build.mutation<
      RecurringPayment,
      {
        id: string;
        title?: string;
        amountMinor?: string;
        frequency?: 'WEEKLY' | 'MONTHLY';
        interval?: number;
        nextDueAt?: string;
        categoryId?: string | null;
        note?: string | null;
        reminderOffsetMinutes?: number | null;
        reminderRecipientIds?: string[];
        active?: boolean;
        version?: number;
      }
    >({
      query: ({ id, version, ...body }) => ({
        url: `/api/v1/families/me/recurring-payments/${id}`,
        method: 'PATCH',
        body,
        headers: version ? { 'If-Match': String(version) } : undefined,
      }),
      invalidatesTags: ['finance-recurring', 'finance-summary'],
    }),
    getFinancialAnalytics: build.query<
      FinancialAnalytics,
      { periodStart?: string; months?: number; forecastDays?: number } | void
    >({
      query: (params) => ({
        url: '/api/v1/families/me/finance/analytics',
        params: params ?? undefined,
      }),
      providesTags: ['finance-summary'],
    }),
    listFinancialMeetings: build.query<FinancialMeeting[], void>({
      query: () => '/api/v1/families/me/financial-meetings',
      providesTags: ['finance-meetings'],
    }),
    createFinancialMeeting: build.mutation<
      FinancialMeeting,
      { title: string; scheduledAt: string; notes?: string }
    >({
      query: (body) => ({ url: '/api/v1/families/me/financial-meetings', method: 'POST', body }),
      invalidatesTags: ['finance-meetings'],
    }),
    completeFinancialMeeting: build.mutation<FinancialMeeting, { id: string; version?: number }>({
      query: ({ id, version }) => ({
        url: `/api/v1/families/me/financial-meetings/${id}/complete`,
        method: 'POST',
        headers: version ? { 'If-Match': String(version) } : undefined,
      }),
      invalidatesTags: ['finance-meetings'],
    }),
    updateFinancialMeeting: build.mutation<
      FinancialMeeting,
      { id: string; title?: string; scheduledAt?: string; notes?: string | null; version?: number }
    >({
      query: ({ id, version, ...body }) => ({
        url: `/api/v1/families/me/financial-meetings/${id}`,
        method: 'PATCH',
        body,
        headers: version ? { 'If-Match': String(version) } : undefined,
      }),
      invalidatesTags: ['finance-meetings'],
    }),
    cancelFinancialMeeting: build.mutation<void, { id: string; version?: number }>({
      query: ({ id, version }) => ({
        url: `/api/v1/families/me/financial-meetings/${id}`,
        method: 'DELETE',
        headers: version ? { 'If-Match': String(version) } : undefined,
      }),
      invalidatesTags: ['finance-meetings'],
    }),
    createFinancialDecision: build.mutation<
      unknown,
      { meetingId: string; title: string; description?: string }
    >({
      query: ({ meetingId, ...body }) => ({
        url: `/api/v1/families/me/financial-meetings/${meetingId}/decisions`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['finance-meetings'],
    }),
    respondFinancialDecision: build.mutation<
      unknown,
      { meetingId: string; decisionId: string; status: 'AGREED' | 'REJECTED'; version?: number }
    >({
      query: ({ meetingId, decisionId, status, version }) => ({
        url: `/api/v1/families/me/financial-meetings/${meetingId}/decisions/${decisionId}/respond`,
        method: 'POST',
        body: { status },
        headers: version ? { 'If-Match': String(version) } : undefined,
      }),
      invalidatesTags: ['finance-meetings'],
    }),
    getFinancialSummary: build.query<FinancialSummary, string | void>({
      query: (periodStart) => ({
        url: '/api/v1/families/me/finance/summary',
        params: periodStart ? { periodStart } : undefined,
      }),
      providesTags: ['finance-summary'],
    }),
    getExpenseStatistics: build.query<
      ExpenseStatistics,
      { dateFrom?: string; dateTo?: string } | void
    >({
      query: (params) => ({
        url: '/api/v1/families/me/finance/expense-statistics',
        params: params ?? undefined,
      }),
      providesTags: ['finance-summary'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListFinanceWalletsQuery,
  useCreateFinanceWalletMutation,
  useUpdateFinanceWalletMutation,
  useArchiveFinanceWalletMutation,
  useListArchivedFinanceWalletsQuery,
  useRestoreFinanceWalletMutation,
  useListLedgerQuery,
  useCreateIncomeMutation,
  useCreateExpenseMutation,
  useCreateTransferMutation,
  useReverseLedgerMutation,
  useListFinancialCategoriesQuery,
  useCreateFinancialCategoryMutation,
  useListFinancialGoalsQuery,
  useCreateFinancialGoalMutation,
  useContributeFinancialGoalMutation,
  useUpdateFinancialGoalMutation,
  useArchiveFinancialGoalMutation,
  useListArchivedFinancialGoalsQuery,
  useRestoreFinancialGoalMutation,
  useListFinancialBudgetsQuery,
  useCreateFinancialBudgetMutation,
  useUpdateFinancialBudgetMutation,
  useArchiveFinancialBudgetMutation,
  useListRecurringPaymentsQuery,
  useCreateRecurringPaymentMutation,
  useArchiveRecurringPaymentMutation,
  useListArchivedRecurringPaymentsQuery,
  useListRecurringPaymentForecastsQuery,
  useRestoreRecurringPaymentMutation,
  useUpdateRecurringPaymentMutation,
  useGetFinancialAnalyticsQuery,
  useListFinancialMeetingsQuery,
  useCreateFinancialMeetingMutation,
  useCompleteFinancialMeetingMutation,
  useUpdateFinancialMeetingMutation,
  useCancelFinancialMeetingMutation,
  useCreateFinancialDecisionMutation,
  useRespondFinancialDecisionMutation,
  useGetFinancialSummaryQuery,
  useGetExpenseStatisticsQuery,
} = financeApi;
