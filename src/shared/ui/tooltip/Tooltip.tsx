import type { ReactNode } from 'react';

type TooltipProps = {
  children: ReactNode;
  content: ReactNode;
  disabled?: boolean;
};

export const Tooltip = ({ children, content, disabled = false }: TooltipProps) => (
  <span className="group/tooltip relative inline-flex min-w-0">
    {children}
    {!disabled && (
      <span
        className="pointer-events-none absolute bottom-full left-1/2 z-[1100] mb-2 w-max max-w-64 -translate-x-1/2 translate-y-1 rounded-lg border border-primary-neon/50 bg-elevated px-2.5 py-1.5 text-xs text-text opacity-0 shadow-[0_0_18px_color-mix(in_srgb,var(--color-primary-neon)_25%,transparent)] transition-[opacity,transform] duration-150 group-hover/tooltip:translate-y-0 group-hover/tooltip:opacity-100"
        role="tooltip"
      >
        {content}
      </span>
    )}
  </span>
);
