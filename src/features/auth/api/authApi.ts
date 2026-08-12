import { clearCredentials, setCredentials } from '@/entities/user';
import type { AuthResponseDto, LoginDto, RegisterDto } from '@/shared/api';
import { baseApi, generatedApi } from '@/shared/api';

export type LoginRequest = LoginDto;
export type RegisterRequest = RegisterDto;

export type RestoreRequest = {
  email: string;
};

type RestoreResponse = {
  message: string;
};

const saveSession = async (
  queryFulfilled: Promise<{ data: AuthResponseDto }>,
  dispatch: (action: ReturnType<typeof setCredentials>) => unknown,
) => {
  try {
    const { data } = await queryFulfilled;
    dispatch(setCredentials(data));
  } catch {
    // RTK Query exposes the request error to the form via unwrap().
  }
};

const clearSession = async (
  queryFulfilled: Promise<unknown>,
  dispatch: (action: ReturnType<typeof clearCredentials>) => unknown,
) => {
  try {
    await queryFulfilled;
    dispatch(clearCredentials());
  } catch {
    // RTK Query exposes the request error to the caller via unwrap().
  }
};

export const authApi = generatedApi.enhanceEndpoints({
  endpoints: {
    login: {
      onQueryStarted: (_, { dispatch, queryFulfilled }) => saveSession(queryFulfilled, dispatch),
    },
    logout: {
      onQueryStarted: (_, { dispatch, queryFulfilled }) => clearSession(queryFulfilled, dispatch),
    },
    register: {
      onQueryStarted: (_, { dispatch, queryFulfilled }) => saveSession(queryFulfilled, dispatch),
    },
  },
});

export const restoreApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    restorePassword: builder.mutation<RestoreResponse, RestoreRequest>({
      query: (body) => ({ body, method: 'POST', url: '/api/v1/auth/restore' }),
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useRegisterMutation } = authApi;
export const { useRestorePasswordMutation } = restoreApi;
