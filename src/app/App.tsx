import { RouterProvider } from 'react-router-dom';

import { router } from '@/app/providers/router';
import { AppStoreProvider } from '@/app/providers/store';
import { MediaPlayer, MediaPlayerProvider } from '@/features/media-player';

export const App = () => (
  <AppStoreProvider>
    <MediaPlayerProvider>
      <RouterProvider router={router} />
      <MediaPlayer />
    </MediaPlayerProvider>
  </AppStoreProvider>
);
