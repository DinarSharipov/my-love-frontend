const ACCESS_TOKEN_KEY = 'my-love-access-token';

const canUseLocalStorage = () => typeof window !== 'undefined';

export const getStoredAccessToken = () => {
  if (!canUseLocalStorage()) {
    return null;
  }

  try {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const removeStoredAccessToken = () => {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
};

export const storeAccessToken = (accessToken: string) => {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  } catch {
    // Authentication still works in memory when persistent storage is unavailable.
  }
};
