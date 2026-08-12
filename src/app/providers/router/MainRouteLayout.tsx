import { House, LogOut, UserRound, UsersIcon, DogIcon } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';

import { clearCredentials } from '@/entities/user';
import { useLogoutMutation } from '@/features/auth';
import { baseApi } from '@/shared/api';
import { MainLayout } from '@/shared/ui';
import type { MenuItem } from '@/shared/ui';
import { ProtectedRoute } from '@/app/providers/router/ProtectedRoute';
import type { AppDispatch } from '@/app/providers/store';

export const MainRouteLayout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();

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
        children: [{ callback: handleLogout, icon: LogOut, label: 'Выйти' }],
        icon: UserRound,
        label: 'Личный кабинет',
        to: '/main/profile',
      },
      {
        label: 'Поиск партнера',
        icon: UsersIcon,
        to: '/all_users',
      },
      {
        label: 'Моя семья',
        icon: DogIcon,
        to: '/my_family',
      },
    ],
    [handleLogout],
  );

  return (
    <ProtectedRoute>
      <MainLayout footerItems={footerItems}>
        <Outlet />
      </MainLayout>
    </ProtectedRoute>
  );
};
