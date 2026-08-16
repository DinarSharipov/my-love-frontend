import { Outlet } from 'react-router-dom';

import { AppBackground } from '@/shared/ui';

export const GuestRouteLayout = () => (
  <AppBackground useDefaultImage>
    <Outlet />
  </AppBackground>
);
