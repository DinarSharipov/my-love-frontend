import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import type { MenuItem } from '@/shared/ui/footer';

type SidebarProps = { items: readonly MenuItem[] };

export const Sidebar = ({ items }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className={`border-border bg-surface/75 hidden shrink-0 border-r backdrop-blur-xl transition-[width] duration-300 lg:block ${collapsed ? 'w-20' : 'w-64'}`}>
      <nav aria-label="Основная навигация" className="flex h-full flex-col gap-2 p-4">
        <button aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'} className="text-muted-text hover:text-text mb-4 flex items-center justify-end rounded-xl p-2 transition-colors focus-visible:outline-2 focus-visible:outline-cyber-cyan" onClick={() => setCollapsed((value) => !value)} type="button">
          {collapsed ? <ChevronRight className="size-5" /> : <ChevronLeft className="size-5" />}
        </button>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div className="group relative" key={`${item.to ?? 'callback'}-${item.label}`}>
              {item.to ? (
                <NavLink aria-label={item.label} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-cyber-cyan ${isActive ? 'bg-primary-neon/15 text-primary-neon' : 'text-muted-text hover:bg-elevated hover:text-text'}`} end to={item.to}>
                  <Icon className="size-5 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && Boolean(item.badgeCount) && <span className="bg-neon-pink text-text ml-auto rounded-full px-1.5 text-[10px]">{item.badgeCount}</span>}
                </NavLink>
              ) : (
                <button aria-label={item.label} className="text-muted-text hover:text-text flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm" onClick={item.callback} type="button"><Icon className="size-5 shrink-0" />{!collapsed && item.label}</button>
              )}
              {!collapsed && item.children && <div className="border-border/70 ml-5 mt-1 space-y-1 border-l pl-3">{item.children.map((child) => { const ChildIcon = child.icon; return child.to ? <NavLink className="text-muted-text hover:text-text flex items-center gap-2 rounded-lg px-2 py-2 text-xs" key={child.label} to={child.to}><ChildIcon className="size-4" />{child.label}</NavLink> : <button className="text-muted-text hover:text-text flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs" key={child.label} onClick={child.callback} type="button"><ChildIcon className="size-4" />{child.label}</button>; })}</div>}
            </div>
          );
        })}
        <div className="mt-auto flex items-center gap-2 px-3 py-3 text-xs text-muted-text"><LogOut className="size-4" />{!collapsed && 'Сессия защищена'}</div>
      </nav>
    </aside>
  );
};
