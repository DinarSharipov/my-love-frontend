import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { RouteLoading } from '@/shared/ui';
import { ProtectedRoute } from '@/app/providers/router/ProtectedRoute';

type LazyComponent = React.ComponentType<{ children?: React.ReactNode }>;

const lazyPage = (loader: () => Promise<{ [key: string]: LazyComponent }>, name: string) =>
  lazy(async () => ({ default: (await loader())[name] }));
const AuthPage = lazyPage(() => import('@/pages/auth'), 'AuthPage');
const FamilyInvitationsPage = lazyPage(
  () => import('@/pages/family-invitations'),
  'FamilyInvitationsPage',
);
const FamilyCalendarPage = lazyPage(() => import('@/pages/family-calendar'), 'FamilyCalendarPage');
const TasksPage = lazyPage(() => import('@/pages/tasks'), 'TasksPage');
const TaskRoutinesPage = lazyPage(() => import('@/pages/task-routines'), 'TaskRoutinesPage');
const ShoppingListsPage = lazyPage(() => import('@/pages/shopping-lists'), 'ShoppingListsPage');
const MealsPage = lazyPage(() => import('@/pages/meals'), 'MealsPage');
const FinancePage = lazyPage(() => import('@/pages/finance'), 'FinancePage');
const SettingsPage = lazyPage(() => import('@/pages/settings'), 'SettingsPage');
const HomePage = lazyPage(() => import('@/pages/home'), 'HomePage');
const LoginPage = lazyPage(() => import('@/pages/login'), 'LoginPage');
const JoinFamilyPage = lazyPage(() => import('@/pages/join-family'), 'JoinFamilyPage');
const MainPage = lazyPage(() => import('@/pages/main'), 'MainPage');
const AllUsersPage = lazyPage(() => import('@/pages/all-users'), 'AllUsersPage');
const MyFamilyPage = lazyPage(() => import('@/pages/my-family'), 'MyFamilyPage');
const WellbeingPage = lazyPage(() => import('@/pages/wellbeing'), 'WellbeingPage');
const ChildProfilesPage = lazyPage(() => import('@/pages/child-profiles'), 'ChildProfilesPage');
const MediaPage = lazyPage(() => import('@/pages/media'), 'MediaPage');
const MessengerPage = lazyPage(() => import('@/pages/messenger'), 'MessengerPage');
const MediaHubPage = lazyPage(() => import('@/pages/media'), 'MediaHubPage');
const RestorePage = lazyPage(() => import('@/pages/restore'), 'RestorePage');
const ResetPasswordPage = lazyPage(() => import('@/pages/reset-password'), 'ResetPasswordPage');
const MainRouteLayout = lazyPage(
  () => import('@/app/providers/router/MainRouteLayout'),
  'MainRouteLayout',
);
const FamilySectionLayout = lazyPage(
  () => import('@/app/providers/router/FamilySectionLayout'),
  'FamilySectionLayout',
);
const RouteTransition = lazyPage(
  () => import('@/app/providers/router/RouteTransition'),
  'RouteTransition',
);
const AppBackground = lazyPage(
  () => import('@/shared/ui/app-background'),
  'AppBackground',
) as React.ComponentType<React.PropsWithChildren<{ useDefaultImage?: boolean }>>;
const GuestRouteLayout = lazyPage(
  () => import('@/app/providers/router/GuestRouteLayout'),
  'GuestRouteLayout',
);
const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<RouteLoading />}>{element}</Suspense>
);

export const router = createBrowserRouter([
  {
    element: withSuspense(<RouteTransition />),
    children: [
      {
        element: withSuspense(<MainRouteLayout />),
        children: [
          {
            path: '/main',
            element: withSuspense(<MainPage />),
          },
          {
            path: '/all_users',
            element: withSuspense(<AllUsersPage />),
          },
          {
            path: '/media',
            element: withSuspense(<MediaHubPage />),
          },
          {
            path: '/my_family',
            element: withSuspense(<FamilySectionLayout />),
            children: [
              { index: true, element: withSuspense(<MyFamilyPage />) },
              { path: 'family-invitations', element: withSuspense(<FamilyInvitationsPage />) },
              { path: 'calendar', element: withSuspense(<FamilyCalendarPage />) },
              { path: 'tasks', element: withSuspense(<TasksPage />) },
              { path: 'task-routines', element: withSuspense(<TaskRoutinesPage />) },
              { path: 'shopping-lists', element: withSuspense(<ShoppingListsPage />) },
              { path: 'meals', element: withSuspense(<MealsPage />) },
              { path: 'finance', element: withSuspense(<FinancePage />) },
              { path: 'wellbeing', element: withSuspense(<WellbeingPage />) },
              { path: 'children', element: withSuspense(<ChildProfilesPage />) },
              { path: 'media', element: withSuspense(<MediaPage />) },
              { path: 'messenger', element: withSuspense(<MessengerPage />) },
            ],
          },
          { path: '/settings', element: withSuspense(<SettingsPage />) },
        ],
      },
      {
        path: '/join-family',
        element: <AppBackground>{withSuspense(<JoinFamilyPage />)}</AppBackground>,
      },
      {
        path: '/reset-password',
        element: <AppBackground>{withSuspense(<ResetPasswordPage />)}</AppBackground>,
      },
      {
        element: <ProtectedRoute mode="guest">{withSuspense(<GuestRouteLayout />)}</ProtectedRoute>,
        children: [
          {
            path: '/',
            element: withSuspense(<HomePage />),
          },
          {
            path: '/login',
            element: withSuspense(<LoginPage />),
          },
          {
            path: '/auth',
            element: withSuspense(<AuthPage />),
          },
          {
            path: '/restore',
            element: withSuspense(<RestorePage />),
          },
        ],
      },
    ],
  },
]);
