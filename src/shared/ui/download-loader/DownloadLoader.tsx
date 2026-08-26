import type { ButtonHTMLAttributes, CSSProperties } from 'react';

export type DownloadLoaderStatus = 'idle' | 'loading' | 'success';
export type DownloadLoaderSize = 's' | 'm' | 'l' | 'xl';

export type DownloadLoaderProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'onClick' | 'type'
> & {
  className?: string;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
  progress?: number;
  size?: DownloadLoaderSize;
  status?: DownloadLoaderStatus;
};

const RING_LENGTH = 2 * Math.PI * 36;
const sizeClassNames: Record<DownloadLoaderSize, string> = {
  l: 'download-loader--l',
  m: 'download-loader--m',
  s: 'download-loader--s',
  xl: 'download-loader--xl',
};

const clampProgress = (progress: number) => Math.min(100, Math.max(0, progress));

const DownloadIcon = ({ status }: { status: DownloadLoaderStatus }) => {
  if (status === 'success') {
    return (
      <svg aria-hidden="true" className="download-loader__check" viewBox="0 0 40 32">
        <path d="M4 17 15 28 36 5" />
      </svg>
    );
  }

  if (status === 'loading') {
    return (
      <svg aria-hidden="true" className="download-loader__wave" viewBox="0 0 80 16">
        <path d="M2 8h8c4 0 4-6 8-6s4 12 8 12 4-12 8-12 4 12 8 12 4-12 8-12 4 6 8 6h10" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="download-loader__download" viewBox="0 0 40 40">
      <path d="M20 3v23" />
      <path d="m11 18 9 9 9-9" />
      <path d="M7 34h26" />
    </svg>
  );
};

export const DownloadLoader = ({
  'aria-label': ariaLabel = 'Скачать',
  className = '',
  disabled = false,
  onClick,
  progress,
  size = 'm',
  status = 'idle',
  ...buttonProps
}: DownloadLoaderProps) => {
  const hasProgress = typeof progress === 'number';
  let normalizedProgress = 0;
  if (status === 'success') {
    normalizedProgress = 100;
  } else if (hasProgress) {
    normalizedProgress = clampProgress(progress);
  }
  const ringOffset = RING_LENGTH * (1 - normalizedProgress / 100);
  const isBusy = status === 'loading';
  const isDisabled = disabled || isBusy;
  const progressLabel = hasProgress ? `${Math.round(normalizedProgress)}%` : 'Загрузка';
  const style = {
    '--download-loader-ring-offset': `${ringOffset}px`,
  } as CSSProperties;

  return (
    <button
      {...buttonProps}
      aria-label={isBusy ? `${ariaLabel}: ${progressLabel}` : ariaLabel}
      aria-busy={isBusy || undefined}
      className={`download-loader ${sizeClassNames[size]} ${isBusy ? 'download-loader--loading' : ''} ${hasProgress ? 'download-loader--determinate' : ''} ${status === 'success' ? 'download-loader--success' : ''} ${className}`}
      disabled={isDisabled}
      onClick={onClick}
      style={style}
      type="button"
    >
      <svg aria-hidden="true" className="download-loader__ring" viewBox="0 0 76 76">
        <circle className="download-loader__ring-track" cx="38" cy="38" r="36" />
        <circle className="download-loader__ring-progress" cx="38" cy="38" r="36" />
      </svg>
      <span className="download-loader__icon">
        <DownloadIcon status={status} />
      </span>
      {isBusy && (
        <span className="download-loader__percent">{hasProgress ? progressLabel : '…'}</span>
      )}
    </button>
  );
};
