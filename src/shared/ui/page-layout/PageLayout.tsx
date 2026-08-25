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
  <main className={`h-full min-h-0 overflow-hidden ${className}`}>
    <div
      className={`h-full min-h-0 w-full min-w-0 max-w-full overflow-auto p-5 ${contentClassName}`}
    >
      <div className="flex min-h-full w-full min-w-0 max-w-full flex-col gap-gap">{children}</div>
    </div>
  </main>
);
