import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

type StateWithAccessToken = {
  user?: {
    accessToken?: string | null;
  };
};

export const baseApi = createApi({
  reducerPath: 'api',
  tagTypes: [
    'finance-wallets',
    'finance-ledger',
    'finance-categories',
    'finance-summary',
    'finance-goals',
    'finance-budgets',
    'finance-recurring',
    'finance-meetings',
    'wellbeing',
    'child-profiles',
  ],
  baseQuery: fetchBaseQuery({
    baseUrl: '/',
    prepareHeaders: (headers, { getState }) => {
      const accessToken = (getState() as StateWithAccessToken).user?.accessToken;

      if (accessToken) {
        headers.set('authorization', `Bearer ${accessToken}`);
      }

      return headers;
    },
  }),
  endpoints: () => ({}),
});
