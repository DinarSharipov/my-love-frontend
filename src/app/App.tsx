import { RouterProvider } from 'react-router-dom';

import { router } from '@/app/providers/router';
import { AppStoreProvider } from '@/app/providers/store';

export const App = () => (
  <AppStoreProvider>
    <RouterProvider router={router} />
  </AppStoreProvider>
);
