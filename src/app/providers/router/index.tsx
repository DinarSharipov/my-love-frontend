import { createBrowserRouter, Outlet } from 'react-router-dom';

import { HomePage } from '@/pages/home';
import { AppBackground } from '@/shared/ui';

export const router = createBrowserRouter([
  {
    element: (
      <AppBackground>
        <Outlet />
      </AppBackground>
    ),
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
    ],
  },
]);
