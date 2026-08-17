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
  useListLedgerQuery,
  useCreateIncomeMutation,
  useCreateExpenseMutation,
  useCreateTransferMutation,
  useReverseLedgerMutation,
  useListFinancialCategoriesQuery,
  useCreateFinancialCategoryMutation,
  useGetFinancialSummaryQuery,
  useGetExpenseStatisticsQuery,
} = financeApi;
