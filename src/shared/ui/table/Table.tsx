import type { ReactNode } from 'react';

import { animatedPanelSurfaceStyle } from '@/shared/ui/animated-panel';
import { Pagination } from '@/shared/ui/pagination';
import type { PaginationProps } from '@/shared/ui/pagination';

export type TableColumn<T> = {
  className?: string;
  header: ReactNode;
  id: string;
  render: (item: T, index: number) => ReactNode;
};

type TableProps<T> = {
  ariaLabel?: string;
  columns: readonly TableColumn<T>[];
  data: readonly T[];
  emptyText?: string;
  getRowKey: (item: T) => string;
  isLoading?: boolean;
  pagination?: PaginationProps;
};

export const Table = <T,>({
  ariaLabel = 'Таблица данных',
  columns,
  data,
  emptyText = 'Данные не найдены',
  getRowKey,
  isLoading = false,
  pagination,
}: TableProps<T>) => (
  <div
    className="border-border flex h-full min-h-0 w-full flex-col overflow-hidden rounded-3xl border shadow-[0_0_45px_rgba(176,38,255,0.08)]"
    style={animatedPanelSurfaceStyle}
  >
    <div className="min-h-0 flex-1 overflow-auto h-full">
      <table
        aria-label={ariaLabel}
        className="w-full min-w-[720px] border-collapse text-left h-full"
      >
        <thead className="bg-elevated/95 sticky top-0 z-10 backdrop-blur-xl">
          <tr>
            {columns.map((column) => (
              <th
                aria-label={typeof column.header === 'string' ? column.header : column.id}
                className={`border-border text-muted-text border-b px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] ${column.className ?? ''}`}
                key={column.id}
                scope="col"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-border divide-y h-full">
          {isLoading &&
            Array.from({ length: 7 }, (_, rowIndex) => (
              <tr key={`skeleton-${rowIndex}`}>
                {columns.map((column, columnIndex) => (
                  <td aria-label="Загрузка" className="px-5 py-4" key={column.id}>
                    <span
                      className={`bg-elevated block h-4 animate-pulse rounded-full ${columnIndex === 0 ? 'w-36' : 'w-24'}`}
                    />
                  </td>
                ))}
              </tr>
            ))}

          {!isLoading &&
            data.map((item, index) => (
              <tr
                className="hover:bg-primary-neon/5 transition-colors duration-200"
                key={getRowKey(item)}
              >
                {columns.map((column) => (
                  <td
                    className={`text-text/90 px-5 py-4 text-sm ${column.className ?? ''}`}
                    key={column.id}
                  >
                    {column.render(item, index)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>

      {!isLoading && data.length === 0 && (
        <div className="text-muted-text grid min-h-52 place-items-center px-6 text-center text-sm">
          {emptyText}
        </div>
      )}
    </div>

    {pagination && (
      <div className="border-border bg-elevated/75 flex shrink-0 justify-end border-t px-4 py-3 backdrop-blur-xl">
        <Pagination {...pagination} />
      </div>
    )}
  </div>
);
