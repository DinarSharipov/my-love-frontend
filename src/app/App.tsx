import { RouterProvider } from 'react-router-dom';

import { router } from '@/app/providers/router';
import { AppStoreProvider } from '@/app/providers/store';
import { MediaPlayer, MediaPlayerProvider } from '@/features/media-player';
import { MessengerRealtimeProvider } from '@/app/providers/messenger';

export const App = () => (
  <AppStoreProvider>
    <MessengerRealtimeProvider>
      <MediaPlayerProvider>
        <RouterProvider router={router} />
        <MediaPlayer />
      </MediaPlayerProvider>
    </MessengerRealtimeProvider>
  </AppStoreProvider>
);
