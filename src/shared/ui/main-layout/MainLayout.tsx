import type { FC, ReactNode } from 'react';

import { Footer } from '@/shared/ui/footer';
import type { MenuItem } from '@/shared/ui/footer';

type MainLayoutProps = {
  children: ReactNode;
  footerItems: readonly MenuItem[];
};

export const MainLayout: FC<MainLayoutProps> = ({ children, footerItems }) => (
  <div className="bg-background/35 text-text relative flex h-dvh min-h-0 w-full overflow-hidden">
    <div className="min-h-0 w-full min-w-0 flex-1 overflow-hidden p-page">{children}</div>
    <Footer items={footerItems} />
  </div>
);
