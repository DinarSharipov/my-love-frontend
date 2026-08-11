import type { AuthSession, Gender } from '@/entities/user';
import { setCredentials } from '@/entities/user';
import { baseApi } from '@/shared/api';

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = LoginRequest & {
  birthDate: string;
  firstName: string;
  gender: Gender;
  lastName: string;
  phone?: string;
};

export type RestoreRequest = {
  email: string;
};

type RestoreResponse = {
  message: string;
};

const saveSession = async (
  queryFulfilled: Promise<{ data: AuthSession }>,
  dispatch: (action: ReturnType<typeof setCredentials>) => unknown,
) => {
  try {
    const { data } = await queryFulfilled;
    dispatch(setCredentials(data));
  } catch {
    // RTK Query exposes the request error to the form via unwrap().
  }
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthSession, LoginRequest>({
      query: (body) => ({ body, method: 'POST', url: 'v1/auth/login' }),
      onQueryStarted: (_, { dispatch, queryFulfilled }) => saveSession(queryFulfilled, dispatch),
    }),
    register: builder.mutation<AuthSession, RegisterRequest>({
      query: (body) => ({ body, method: 'POST', url: 'v1/auth/register' }),
      onQueryStarted: (_, { dispatch, queryFulfilled }) => saveSession(queryFulfilled, dispatch),
    }),
    restorePassword: builder.mutation<RestoreResponse, RestoreRequest>({
      query: (body) => ({ body, method: 'POST', url: 'v1/auth/restore' }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useRestorePasswordMutation } = authApi;
