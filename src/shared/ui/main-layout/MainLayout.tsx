import { FC, ReactNode } from 'react';

export const MainLayout: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="w-full h-screen flex flex-col min-h-0 bg-background text-text">
    <div className="h-full w-full min-h-0 p-4">{children}</div>
    <div>footer</div>
  </div>
);
