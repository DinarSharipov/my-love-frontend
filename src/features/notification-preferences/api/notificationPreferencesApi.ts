import type {
  NotificationPreferences,
  UpdateNotificationPreferences,
} from '@/entities/notification';
import { generatedApi } from '@/shared/api';

export const notificationPreferencesApi = generatedApi.injectEndpoints({
  endpoints: (build) => ({
    getNotificationPreferences: build.query<NotificationPreferences, void>({
      query: () => '/api/v1/notifications/preferences',
      providesTags: ['notifications'],
    }),
    updateNotificationPreferences: build.mutation<
      NotificationPreferences,
      UpdateNotificationPreferences
    >({
      query: (body) => ({
        body,
        method: 'PATCH',
        url: '/api/v1/notifications/preferences',
      }),
      invalidatesTags: ['notifications'],
    }),
  }),
});

export const { useGetNotificationPreferencesQuery, useUpdateNotificationPreferencesMutation } =
  notificationPreferencesApi;
