import { isRejectedWithValue, type Middleware } from '@reduxjs/toolkit';

import {
  clearCredentials,
  removeStoredAccessToken,
  setCredentials,
  storeAccessToken,
} from '@/entities/user';

type StateWithAccessToken = {
  user?: {
    accessToken?: string | null;
  };
};

const isUnauthorizedRequest = (action: unknown) => {
  if (!isRejectedWithValue(action)) {
    return false;
  }

  const { payload } = action;

  if (typeof payload !== 'object' || payload === null) {
    return false;
  }

  const status = 'status' in payload ? payload.status : undefined;
  const originalStatus = 'originalStatus' in payload ? payload.originalStatus : undefined;

  return status === 401 || originalStatus === 401;
};

export const authMiddleware: Middleware = (api) => (next) => (action) => {
  const result = next(action);

  if (setCredentials.match(action)) {
    storeAccessToken(action.payload.accessToken);
  }

  if (clearCredentials.match(action)) {
    removeStoredAccessToken();
  }

  if (isUnauthorizedRequest(action)) {
    const accessToken = (api.getState() as StateWithAccessToken).user?.accessToken;

    removeStoredAccessToken();

    if (accessToken) {
      api.dispatch(clearCredentials());

      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.replace('/');
      }
    }
  }

  return result;
};
