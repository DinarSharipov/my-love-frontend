import { generatedApi } from '@/shared/api';

export type TelegramLinkToken = { token: string; expiresAt: string };
export type TelegramConnection = {
  id: string;
  telegramUserId: string;
  status: string;
  linkedAt: string;
  revokedAt: string | null;
};

export const telegramApi = generatedApi.injectEndpoints({
  endpoints: (build) => ({
    createTelegramLinkToken: build.mutation<TelegramLinkToken, void>({
      query: () => ({ method: 'POST', url: '/api/v1/telegram/link-token' }),
    }),
    getTelegramConnection: build.query<TelegramConnection | null, void>({
      query: () => '/api/v1/telegram/connection',
      providesTags: ['notifications'],
    }),
    deleteTelegramConnection: build.mutation<void, void>({
      query: () => ({ method: 'DELETE', url: '/api/v1/telegram/connection' }),
      invalidatesTags: ['notifications'],
    }),
  }),
});

export const {
  useCreateTelegramLinkTokenMutation,
  useDeleteTelegramConnectionMutation,
  useGetTelegramConnectionQuery,
} = telegramApi;
