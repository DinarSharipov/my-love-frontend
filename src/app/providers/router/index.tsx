import { createBrowserRouter, Outlet } from 'react-router-dom';

import { AuthPage } from '@/pages/auth';
import { HomePage } from '@/pages/home';
import { LoginPage } from '@/pages/login';
import { MainPage } from '@/pages/main';
import { ProfilePage } from '@/pages/profile';
import { RestorePage } from '@/pages/restore';
import { AppBackground } from '@/shared/ui';
import { MainRouteLayout } from '@/app/providers/router/MainRouteLayout';
import { ProtectedRoute } from '@/app/providers/router/ProtectedRoute';
import { RouteTransition } from '@/app/providers/router/RouteTransition';

export const router = createBrowserRouter([
  {
    element: <RouteTransition />,
    children: [
      {
        path: '/main',
        element: <MainRouteLayout />,
        children: [
          {
            path: '',
            element: <MainPage />,
          },
          {
            path: 'profile',
            element: <ProfilePage />,
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
    ],
  },
]);
