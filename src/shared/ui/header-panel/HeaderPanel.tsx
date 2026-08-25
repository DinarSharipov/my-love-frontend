import type { ReactNode } from 'react';

import { AnimatedPanel } from '@/shared/ui/animated-panel';

type HeaderPanelProps = {
  className?: string;
  left: ReactNode;
  right?: ReactNode;
};

/** Page header with a natural height and responsive left/right content slots. */
export const HeaderPanel = ({ className = '', left, right }: HeaderPanelProps) => (
  <AnimatedPanel
    className={`page-header !h-auto flex w-full! shrink-0 flex-wrap items-end justify-between gap-gap ${className}`}
  >
    <div className="flex items-center justify-between w-full">
      <div className="min-w-0">{left}</div>
      {right && (
        <div className="flex w-full items-center gap-gap sm:ml-auto sm:w-auto">{right}</div>
      )}
    </div>
  </AnimatedPanel>
);
