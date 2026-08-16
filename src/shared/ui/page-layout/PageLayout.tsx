import type { ReactNode } from 'react';

type PageLayoutProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

/** Consistent scroll container and spacing for authenticated route pages. */
export const PageLayout = ({
  children,
  className = '',
  contentClassName = '',
}: PageLayoutProps) => (
  <main className={`h-full min-h-0 overflow-auto ${className}`}>
    <div className={`flex w-full min-w-0 max-w-full flex-col gap-gap ${contentClassName}`}>
      {children}
    </div>
  </main>
);
