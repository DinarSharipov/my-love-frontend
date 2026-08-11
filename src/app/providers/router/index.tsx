import { createBrowserRouter, Outlet } from 'react-router-dom';

import { AuthPage } from '@/pages/auth';
import { HomePage } from '@/pages/home';
import { LoginPage } from '@/pages/login';
import { MainPage } from '@/pages/main';
import { RestorePage } from '@/pages/restore';
import { AppBackground } from '@/shared/ui';

export const router = createBrowserRouter([
  {
    path: '/main',
    element: <MainPage />,
  },
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
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/auth',
        element: <AuthPage />,
      },
      {
        path: '/restore',
        element: <RestorePage />,
      },
    ],
  },
]);
