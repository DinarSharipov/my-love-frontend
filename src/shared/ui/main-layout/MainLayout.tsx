import type { FC, ReactNode } from 'react';

import { Footer } from '@/shared/ui/footer';
import type { MenuItem } from '@/shared/ui/footer';

type MainLayoutProps = {
  children: ReactNode;
  footerItems: readonly MenuItem[];
};

export const MainLayout: FC<MainLayoutProps> = ({ children, footerItems }) => (
  <div className="bg-background text-text relative flex h-dvh min-h-0 w-full flex-col overflow-hidden">
    <div className="min-h-0 w-full flex-1 overflow-auto p-4">{children}</div>
    <Footer items={footerItems} />
  </div>
);
