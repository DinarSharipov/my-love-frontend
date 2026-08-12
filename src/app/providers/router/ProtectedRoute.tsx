import type { PropsWithChildren } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

import { selectAccessToken } from '@/entities/user';

type ProtectedRouteProps = PropsWithChildren<{
  mode?: 'private' | 'guest';
}>;

export const ProtectedRoute = ({ children, mode = 'private' }: ProtectedRouteProps) => {
  const isAuthenticated = Boolean(useSelector(selectAccessToken));

  if (mode === 'private' && !isAuthenticated) {
    return <Navigate replace to="/" />;
  }

  if (mode === 'guest' && isAuthenticated) {
    return <Navigate replace to="/main" />;
  }

  return children;
};
