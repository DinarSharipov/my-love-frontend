import { createBrowserRouter, Outlet } from 'react-router-dom';

import { AuthPage } from '@/pages/auth';
import { FamilyInvitationsPage } from '@/pages/family-invitations';
import { FamilyCalendarPage } from '@/pages/family-calendar';
import { HomePage } from '@/pages/home';
import { LoginPage } from '@/pages/login';
import { JoinFamilyPage } from '@/pages/join-family';
import { MainPage } from '@/pages/main';
import { AllUsersPage } from '@/pages/all-users';
import { MyFamilyPage } from '@/pages/my-family';
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
        element: <MainRouteLayout />,
        children: [
          {
            path: '/main',
            element: <MainPage />,
          },
          {
            path: '/main/profile',
            element: <ProfilePage />,
          },
          {
            path: '/all_users',
            element: <AllUsersPage />,
          },
          {
            path: '/my_family',
            element: <MyFamilyPage />,
          },
          {
            path: '/family-invitations',
            element: <FamilyInvitationsPage />,
          },
          {
            path: '/family-calendar',
            element: <FamilyCalendarPage />,
          },
        ],
      },
      {
        path: '/join-family',
        element: (
          <AppBackground>
            <JoinFamilyPage />
          </AppBackground>
        ),
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
