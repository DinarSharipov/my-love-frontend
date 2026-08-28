import { isRejectedWithValue, type Middleware } from '@reduxjs/toolkit';

import { getApiErrorMessage } from '@/shared/api';
import { showNotification } from '@/shared/model/notifications';

type RejectedApiPayload = {
  originalStatus?: number | string;
  status?: number | string;
};

const getStatus = (payload: unknown) => {
  if (typeof payload !== 'object' || payload === null) return undefined;

  const { originalStatus, status } = payload as RejectedApiPayload;
  return typeof status === 'number' || typeof status === 'string' ? status : originalStatus;
};

const getNotificationDetails = (payload: unknown) => {
  const status = getStatus(payload);
  const message = getApiErrorMessage(payload, 'Повторите попытку позже.');

  if (status === 'FETCH_ERROR' || status === 'TIMEOUT_ERROR') {
    return {
      message: 'Проверьте подключение к интернету и повторите попытку.',
      title: 'Нет соединения',
      type: 'warning' as const,
    };
  }

  if (status === 401) {
    return { message, title: 'Требуется авторизация', type: 'warning' as const };
  }

  if (status === 403) {
    return { message, title: 'Недостаточно прав', type: 'warning' as const };
  }

  if (status === 429) {
    return { message, title: 'Слишком много запросов', type: 'warning' as const };
  }

  if (typeof status === 'number' && status >= 500) {
    return { message, title: 'Ошибка сервера', type: 'error' as const };
  }

  return { message, title: 'Не удалось выполнить запрос', type: 'error' as const };
};

export const apiErrorNotificationMiddleware: Middleware = (api) => (next) => (action) => {
  const result = next(action);

  if (isRejectedWithValue(action)) {
    api.dispatch(showNotification(getNotificationDetails(action.payload)));
  }

  return result;
};
