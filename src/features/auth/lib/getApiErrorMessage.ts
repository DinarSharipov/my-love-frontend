type ApiErrorData = {
  error?: string;
  message?: string | string[];
};

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (!error || typeof error !== 'object' || !('data' in error)) {
    return fallback;
  }

  const { data } = error as { data?: ApiErrorData | string };

  if (typeof data === 'string') {
    return data;
  }

  if (Array.isArray(data?.message)) {
    return data.message.join('. ');
  }

  return data?.message ?? data?.error ?? fallback;
};
