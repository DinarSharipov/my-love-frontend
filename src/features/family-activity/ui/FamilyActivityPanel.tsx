import { Download, History, RefreshCw } from 'lucide-react';
import { useState } from 'react';

import {
  getApiErrorMessage,
  useExportCurrentUserQuery,
  useListAuditEventsQuery,
} from '@/shared/api';
import { formatDateTime } from '@/shared/lib/date';
import { AnimatedPanel, AsyncState, Button } from '@/shared/ui';

export const FamilyActivityPanel = () => {
  const audit = useListAuditEventsQuery({ page: 1, limit: 8 });
  const [exportError, setExportError] = useState<string | null>(null);
  const exportData = useExportCurrentUserQuery(undefined, { skip: true });

  const handleExport = async () => {
    setExportError(null);
    try {
      const result = await exportData.refetch();
      if (result.error || !result.data) throw result.error ?? new Error('Empty export');
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `my-love-export-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setExportError(getApiErrorMessage(error, 'Не удалось выгрузить данные'));
    }
  };

  return (
    <AnimatedPanel className="mt-5 p-5 sm:p-6">
      <header className="mb-5 flex items-start justify-between gap-gap">
        <div>
          <h2 className="text-text flex items-center gap-gap text-lg font-semibold">
            <History aria-hidden="true" className="text-cyber-cyan h-5 w-5" />
            История семейных действий
          </h2>
          <p className="text-muted-text mt-1 text-sm">
            Последние изменения доступны всем участникам семьи.
          </p>
        </div>
        <Button aria-label="Обновить историю" onClick={() => audit.refetch()} size="s">
          <RefreshCw aria-hidden="true" className="h-4 w-4" />
        </Button>
      </header>
      <AsyncState
        error={audit.error}
        errorMessage="Не удалось загрузить историю"
        hasData={Boolean(audit.data)}
        isLoading={audit.isLoading}
        loading={<p className="text-muted-text text-sm">Загружаем историю…</p>}
        onRetry={audit.refetch}
      >
        <div className="space-y-2">
          {audit.data?.data.map((event) => (
            <div className="border-border bg-surface/50 rounded-xl border p-3" key={event.id}>
              <p className="text-text text-sm">{event.action}</p>
              <p className="text-muted-text mt-1 text-xs">
                {event.resourceType} · {formatDateTime(event.createdAt)}
              </p>
            </div>
          ))}
          {!audit.data?.data.length && (
            <p className="text-muted-text text-sm">История пока пуста.</p>
          )}
        </div>
      </AsyncState>
      <div className="border-border mt-5 flex flex-wrap items-center justify-between gap-gap border-t pt-4">
        <p className="text-muted-text text-xs">
          Скачайте копию профиля, семейных данных и событий.
        </p>
        <Button disabled={exportData.isFetching} onClick={handleExport} size="s">
          <Download aria-hidden="true" className="h-4 w-4" />
          {exportData.isFetching ? 'Готовим…' : 'Экспортировать данные'}
        </Button>
      </div>
      {exportError && <p className="text-neon-pink mt-2 text-xs">{exportError}</p>}
    </AnimatedPanel>
  );
};
