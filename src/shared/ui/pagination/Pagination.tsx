import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export type PaginationProps = {
  disabled?: boolean;
  onChange: (page: number) => void;
  page: number;
  totalPages: number;
};

type PaginationItem = number | 'left-ellipsis' | 'right-ellipsis';

const getPaginationItems = (page: number, totalPages: number): PaginationItem[] => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const middleStart = Math.max(2, Math.min(page - 1, totalPages - 3));
  const middleEnd = Math.min(totalPages - 1, middleStart + 2);
  const items: PaginationItem[] = [1];

  if (middleStart > 2) items.push('left-ellipsis');
  for (let current = middleStart; current <= middleEnd; current += 1) items.push(current);
  if (middleEnd < totalPages - 1) items.push('right-ellipsis');

  items.push(totalPages);
  return items;
};

export const Pagination = ({ disabled = false, onChange, page, totalPages }: PaginationProps) => {
  const safeTotalPages = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(1, page), safeTotalPages);
  const items = getPaginationItems(safePage, safeTotalPages);

  return (
    <nav aria-label="Пагинация" className="flex items-center justify-center gap-1.5">
      <motion.button
        aria-label="Предыдущая страница"
        className="border-border bg-elevated/80 text-muted-text hover:border-primary-neon/60 hover:text-text grid h-9 w-9 place-items-center rounded-xl border outline-none transition-colors focus-visible:border-cyber-cyan disabled:cursor-not-allowed disabled:opacity-35"
        disabled={disabled || safePage === 1}
        onClick={() => onChange(safePage - 1)}
        type="button"
        whileTap={{ scale: 0.9 }}
      >
        <ChevronLeft aria-hidden="true" className="h-4 w-4" />
      </motion.button>

      {items.map((item) =>
        typeof item === 'number' ? (
          <motion.button
            aria-current={item === safePage ? 'page' : undefined}
            aria-label={`Страница ${item}`}
            className={`hidden h-9 min-w-9 rounded-xl border px-2 text-sm font-medium outline-none transition-colors first:inline-grid last:inline-grid sm:inline-grid sm:place-items-center ${
              item === safePage
                ? 'border-primary-neon/80 bg-primary-neon/15 text-text shadow-[0_0_18px_rgba(176,38,255,0.28)]'
                : 'border-border bg-elevated/70 text-muted-text hover:border-primary-neon/55 hover:text-text focus-visible:border-cyber-cyan'
            }`}
            disabled={disabled || item === safePage}
            key={item}
            onClick={() => onChange(item)}
            type="button"
            whileTap={{ scale: 0.9 }}
          >
            {item}
          </motion.button>
        ) : (
          <span className="text-muted-text hidden w-7 text-center text-sm sm:block" key={item}>
            …
          </span>
        ),
      )}

      <span className="text-muted-text px-2 text-xs tabular-nums sm:hidden">
        {safePage} / {safeTotalPages}
      </span>

      <motion.button
        aria-label="Следующая страница"
        className="border-border bg-elevated/80 text-muted-text hover:border-primary-neon/60 hover:text-text grid h-9 w-9 place-items-center rounded-xl border outline-none transition-colors focus-visible:border-cyber-cyan disabled:cursor-not-allowed disabled:opacity-35"
        disabled={disabled || safePage === safeTotalPages}
        onClick={() => onChange(safePage + 1)}
        type="button"
        whileTap={{ scale: 0.9 }}
      >
        <ChevronRight aria-hidden="true" className="h-4 w-4" />
      </motion.button>
    </nav>
  );
};
