import { createBrowserRouter, Outlet } from 'react-router-dom';

import { AuthPage } from '@/pages/auth';
import { HomePage } from '@/pages/home';
import { LoginPage } from '@/pages/login';
import { MainPage } from '@/pages/main';
import { RestorePage } from '@/pages/restore';
import { AppBackground, MainLayout } from '@/shared/ui';
import { ProtectedRoute } from '@/app/providers/router/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/main',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <Outlet />
        </MainLayout>
      </ProtectedRoute>
    ),
    children: [
      {
        path: '',
        element: <MainPage />,
      },
    ],
  },
  {
    element: (
      <ProtectedRoute mode="guest">
        <AppBackground>
          <Outlet />
        </AppBackground>
      </ProtectedRoute>
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
