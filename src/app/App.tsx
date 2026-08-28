import { RouterProvider } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';

import { router } from '@/app/providers/router';
import { AppStoreProvider, type AppDispatch, type RootState } from '@/app/providers/store';
import { MediaPlayer, MediaPlayerProvider } from '@/features/media-player';
import { MessengerRealtimeProvider } from '@/app/providers/messenger';
import { dismissNotification } from '@/shared/model/notifications';
import { Notifications } from '@/shared/ui';

const AppContent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector((state: RootState) => state.notifications.items);
  const handleDismiss = useCallback((id: string) => dispatch(dismissNotification(id)), [dispatch]);

  return (
    <MessengerRealtimeProvider>
      <MediaPlayerProvider>
        <RouterProvider router={router} />
        <MediaPlayer />
        <Notifications items={notifications} onDismiss={handleDismiss} />
      </MediaPlayerProvider>
    </MessengerRealtimeProvider>
  );
};

export const App = () => (
  <AppStoreProvider>
    <AppContent />
  </AppStoreProvider>
);
