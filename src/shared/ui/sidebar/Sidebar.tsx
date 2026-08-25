import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import type { MenuItem } from '@/shared/ui/footer';
import { LogoIcon } from '@/shared/ui/logo/LogoIcon';
import { AnimatedPanel } from '../animated-panel';

type SidebarProps = { items: readonly MenuItem[] };

export const Sidebar = ({ items }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside
      className={`min-h-0 min-w-20 shrink-0 overflow-visible transition-[width] duration-300 lg:block ${collapsed ? 'w-20' : 'w-64'}`}
    >
      <AnimatedPanel className={`h-full min-w-0 ${collapsed ? '!p-2' : ''}`}>
        <nav
          aria-label="Основная навигация"
          className={`flex h-full min-w-0 flex-col gap-gap overflow-hidden ${collapsed ? '!p-1' : 'p-page'}`}
        >
          <button
            aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
            className={`text-muted-text hover:text-text mb-gap flex min-w-0 items-center rounded-[var(--radius-panel)] border border-transparent p-page transition-colors hover:border-border hover:bg-elevated/70 focus-visible:outline-2 focus-visible:outline-cyber-cyan ${collapsed ? 'w-full justify-center' : 'justify-between'}`}
            onClick={() => setCollapsed((value) => !value)}
            type="button"
          >
            {!collapsed && <LogoIcon className="size-6 shrink-0 rounded-md object-cover" />}
            {collapsed ? (
              <ChevronRight className="h-5 w-5 shrink-0" />
            ) : (
              <ChevronLeft className="h-5 w-5 shrink-0" />
            )}
          </button>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div className="group relative" key={`${item.to ?? 'callback'}-${item.label}`}>
                {item.to ? (
                  <NavLink
                    aria-label={item.label}
                    className={({ isActive }) =>
                      `flex min-w-0 items-center ${collapsed ? 'mx-auto h-14 w-14 justify-center rounded-full p-0' : 'gap-gap rounded-[var(--radius-panel)] px-3 py-3'} border text-sm transition-colors focus-visible:outline-2 focus-visible:outline-cyber-cyan ${isActive ? 'border-primary-neon/35 bg-primary-neon/15 text-primary-neon shadow-[0_0_22px_rgb(176_38_255_/_16%)]' : 'border-transparent text-muted-text hover:border-border hover:bg-elevated/70 hover:text-text'}`
                    }
                    end
                    to={item.to}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && Boolean(item.badgeCount) && (
                      <span className="bg-neon-pink text-text ml-auto rounded-full px-1.5 text-[10px]">
                        {item.badgeCount}
                      </span>
                    )}
                  </NavLink>
                ) : (
                  <button
                    aria-label={item.label}
                    className={`text-muted-text hover:text-text flex min-w-0 w-full items-center rounded-xl py-3 text-sm ${collapsed ? 'justify-center px-0' : 'gap-gap px-3'}`}
                    onClick={item.callback}
                    type="button"
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && item.label}
                  </button>
                )}
                {!collapsed && item.children && (
                  <div className="border-border/70 ml-5 mt-1 space-y-1 border-l pl-3">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      return child.to ? (
                        <NavLink
                          className="text-muted-text hover:text-text flex items-center gap-gap rounded-lg px-2 py-2 text-xs"
                          key={child.label}
                          to={child.to}
                        >
                          <ChildIcon className="h-4 w-4 shrink-0" />
                          {child.label}
                        </NavLink>
                      ) : (
                        <button
                          className="text-muted-text hover:text-text flex w-full items-center gap-gap rounded-lg px-2 py-2 text-xs"
                          key={child.label}
                          onClick={child.callback}
                          type="button"
                        >
                          <ChildIcon className="h-4 w-4 shrink-0" />
                          {child.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          <div className="mt-auto flex items-center gap-gap px-3 py-3 text-xs text-muted-text">
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && 'Сессия защищена'}
          </div>
        </nav>
      </AnimatedPanel>
    </aside>
  );
};
