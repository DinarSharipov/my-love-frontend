import type { FC, ReactNode } from 'react';

import { Footer } from '@/shared/ui/footer';

export const MainLayout: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="bg-background text-text flex h-dvh min-h-0 w-full flex-col overflow-hidden">
    <div className="min-h-0 w-full flex-1 overflow-auto p-4">{children}</div>
    <Footer />
  </div>
);
