import { clearCredentials, setCredentials } from '@/entities/user';
import type { AuthResponseDto, LoginDto, RegisterDto } from '@/shared/api';
import { generatedApi } from '@/shared/api';

export type LoginRequest = LoginDto;
export type RegisterRequest = RegisterDto;

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

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
} = authApi;
