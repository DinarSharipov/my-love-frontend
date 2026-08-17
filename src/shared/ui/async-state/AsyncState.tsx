import type { ReactNode } from 'react';

import { Button } from '@/shared/ui/button';

type AsyncStateProps = {
  isLoading?: boolean;
  error?: unknown;
  hasData?: boolean;
  onRetry?: () => void;
  loading?: ReactNode;
  children: ReactNode;
  empty?: ReactNode;
  errorMessage?: string;
};

export const AsyncState = ({
  isLoading = false,
  error,
  hasData = true,
  onRetry,
  loading,
  children,
  empty,
  errorMessage = 'Не удалось загрузить данные',
}: AsyncStateProps) => {
  if (isLoading && !hasData) return loading ?? null;

  if (error && !hasData) {
    return (
      <div className="grid min-h-40 place-items-center pb-4 text-center">
        <section className="border-neon-pink/30 bg-neon-pink/5 rounded-3xl border p-6">
          <p className="text-neon-pink text-sm">{errorMessage}</p>
          {onRetry && (
            <Button className="mt-4" onClick={onRetry} size="s">
              Повторить
            </Button>
          )}
        </section>
      </div>
    );
  }

  if (!isLoading && !error && !hasData && empty) return empty;

  return children;
};
