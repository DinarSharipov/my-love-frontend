import type { ReactNode } from 'react';

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
  const activeComponent = items.find((item) => item.id === activeId)?.component;
  const content = children ?? activeComponent;

  return (
    <div className="flex min-w-0 flex-col gap-gap">
      <div
        aria-label="Разделы"
        className="border-border bg-elevated/35 flex gap-gap overflow-x-auto rounded-2xl border p-1"
        role="tablist"
      >
        {items.map((item) => (
          <button
            aria-selected={activeId === item.id}
            className={`relative inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan ${activeId === item.id ? 'bg-primary-neon/20 text-primary-neon shadow-[0_0_18px_rgba(176,38,255,0.2)]' : 'text-muted-text hover:bg-elevated hover:text-text'}`}
            disabled={item.disabled}
            id={`tab-${item.id}`}
            key={item.id}
            onClick={() => onChange(item.id)}
            role="tab"
            tabIndex={activeId === item.id ? 0 : -1}
            type="button"
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
      {content && (
        <div aria-labelledby={`tab-${activeId}`} role="tabpanel">
          {content}
        </div>
      )}
    </div>
  );
};
