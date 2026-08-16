import type { ComponentProps } from 'react';

export const LogoIcon = ({ className, ...props }: ComponentProps<'img'>) => (
  <img alt="" aria-hidden="true" className={className} src="/assets/my-love-logo.png" {...props} />
);
