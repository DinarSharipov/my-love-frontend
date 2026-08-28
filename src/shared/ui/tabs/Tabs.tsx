import { useId, useRef } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react';
import type { KeyboardEvent, ReactNode } from 'react';

export type TabItem = {
  component?: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  id: string;
  label: string;
};

type TabsProps = {
  activeId: string;
  children?: ReactNode;
  items: readonly TabItem[];
  onChange: (id: string) => void;
};

export const Tabs = ({ activeId, children, items, onChange }: TabsProps) => {
  const layoutId = useId();
  const prefersReducedMotion = useReducedMotion();
  const activeIndex = Math.max(
    items.findIndex((item) => item.id === activeId),
    0,
  );
  const previousIndex = useRef(activeIndex);
  const direction = activeIndex >= previousIndex.current ? 1 : -1;
  const activeComponent = items.find((item) => item.id === activeId)?.component;
  const content = children ?? activeComponent;

  const selectTab = (id: string) => {
    previousIndex.current = Math.max(
      items.findIndex((item) => item.id === activeId),
      0,
    );
    onChange(id);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const enabledItems = items.filter((item) => !item.disabled);
    const currentIndex = enabledItems.findIndex((item) => item.id === items[index]?.id);
    const nextBy = (offset: number) =>
      enabledItems[(currentIndex + offset + enabledItems.length) % enabledItems.length];

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      selectTab(nextBy(1).id);
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      selectTab(nextBy(-1).id);
    }

    if (event.key === 'Home') {
      event.preventDefault();
      selectTab(enabledItems[0].id);
    }

    if (event.key === 'End') {
      event.preventDefault();
      selectTab(enabledItems[enabledItems.length - 1].id);
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-gap">
      <LayoutGroup id={`tabs-${layoutId}`}>
        <div
          aria-label="Разделы"
          className="border-border bg-elevated/35 flex gap-gap overflow-x-auto rounded-2xl border p-1"
          role="tablist"
        >
          {items.map((item, index) => {
            const isActive = activeId === item.id;

            return (
              <button
                aria-controls={`tabpanel-${item.id}`}
                aria-selected={isActive}
                className={`relative inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan ${isActive ? 'text-text' : 'text-muted-text hover:text-text'}`}
                disabled={item.disabled}
                id={`tab-${item.id}`}
                key={item.id}
                onClick={() => selectTab(item.id)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                role="tab"
                tabIndex={isActive ? 0 : -1}
                type="button"
              >
                {isActive && (
                  <motion.span
                    aria-hidden="true"
                    className="bg-primary-neon/20 absolute inset-0 rounded-xl border border-primary-neon/40 shadow-[0_0_18px_rgba(176,38,255,0.26)]"
                    layoutId="active-tab-indicator"
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { bounce: 0.18, duration: 0.34, type: 'spring' }
                    }
                  />
                )}
                <span className="relative z-10 inline-flex items-center gap-2">
                  {item.icon}
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>
      {content && (
        <AnimatePresence custom={direction} initial={false} mode="wait">
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            aria-labelledby={`tab-${activeId}`}
            custom={direction}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * -18 }}
            id={`tabpanel-${activeId}`}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * 18 }}
            key={activeId}
            role="tabpanel"
            transition={
              prefersReducedMotion ? { duration: 0.12 } : { duration: 0.22, ease: 'easeOut' }
            }
          >
            {content}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
