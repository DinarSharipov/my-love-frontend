import {
  CalendarDays,
  House,
  LogOut,
  ListChecks,
  Repeat2,
  ShoppingBasket,
  MailCheck,
  Music2,
  Settings,
  UsersIcon,
} from 'lucide-react';
import { useCallback, useMemo } from 'react';
import type { ComponentProps } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';

import { clearCredentials } from '@/entities/user';
import type { Notification } from '@/entities/notification';
import { useLogoutMutation } from '@/features/auth';
import { baseApi, useList11Query } from '@/shared/api';
import { AppBackground, MainLayout } from '@/shared/ui';
import { LogoIcon } from '@/shared/ui/logo/LogoIcon';
import type { MenuItem } from '@/shared/ui';
import { ProtectedRoute } from '@/app/providers/router/ProtectedRoute';
import type { AppDispatch } from '@/app/providers/store';

const SettingsMenuIcon = ({ className, ...props }: ComponentProps<typeof Settings>) => (
  <Settings
    {...props}
    className={`${className ?? ''} transition-transform duration-500 ease-out group-hover:rotate-180`}
  />
);

export const MainRouteLayout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();
  const notifications = useList11Query();
  const unreadNotifications = ((notifications.data as Notification[] | undefined) ?? []).filter(
    (notification) => !notification.readAt,
  ).length;

  const handleLogout = useCallback(async () => {
    try {
      await logout().unwrap();
    } catch {
      // Local logout must still complete when the session has already expired.
    } finally {
      dispatch(clearCredentials());
      dispatch(baseApi.util.resetApiState());
      navigate('/', { replace: true });
    }
  }, [dispatch, logout, navigate]);

  const footerItems = useMemo<readonly MenuItem[]>(
    () => [
      { icon: House, label: 'Главная', to: '/main' },
      {
        badgeCount: unreadNotifications,
        icon: SettingsMenuIcon,
        label: 'Настройки',
        to: '/settings',
        children: [{ callback: handleLogout, icon: LogOut, label: 'Выйти' }],
      },
      {
        label: 'Поиск партнера',
        icon: UsersIcon,
        to: '/all_users',
      },
      { icon: Music2, label: 'Медиа', to: '/media' },
      {
        children: [
          { icon: CalendarDays, label: 'Календарь', to: '/my_family/calendar' },
          { icon: ListChecks, label: 'Задачи', to: '/my_family/tasks' },
          { icon: Repeat2, label: 'Регулярные задачи', to: '/my_family/task-routines' },
          { icon: ShoppingBasket, label: 'Покупки', to: '/my_family/shopping-lists' },
          { icon: MailCheck, label: 'Приглашения', to: '/my_family/family-invitations' },
        ],
        label: 'Моя семья',
        icon: LogoIcon,
        to: '/my_family',
      },
    ],
    [handleLogout, unreadNotifications],
  );

  return (
    <ProtectedRoute>
      <AppBackground>
        <MainLayout footerItems={footerItems}>
          <Outlet />
        </MainLayout>
      </AppBackground>
    </ProtectedRoute>
  );
};
