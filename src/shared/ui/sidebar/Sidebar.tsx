import { ChevronDown, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import type { MenuItem } from '@/shared/ui/footer';
import { LogoIcon } from '@/shared/ui/logo/LogoIcon';
import { AnimatedPanel } from '../animated-panel';

export type SidebarMenuGroup = {
  featured?: boolean;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  id: string;
  items?: readonly MenuItem[];
  label: string;
  to?: string;
};

type SidebarProps = { groups: readonly SidebarMenuGroup[] };

const isItemActive = (item: MenuItem, pathname: string): boolean =>
  item.to === pathname || Boolean(item.children?.some((child) => isItemActive(child, pathname)));

const isGroupActive = (group: SidebarMenuGroup, pathname: string): boolean =>
  group.to === pathname || Boolean(group.items?.some((item) => isItemActive(item, pathname)));

const getItemToneClassName = (featured: boolean | undefined, isActive: boolean) => {
  if (featured) {
    return isActive
      ? 'border-neon-pink/80 bg-gradient-to-r from-primary-neon/35 via-neon-pink/25 to-cyber-cyan/15 text-text shadow-[0_0_26px_rgba(255,43,214,0.38),inset_0_0_16px_rgba(176,38,255,0.16)]'
      : 'border-primary-neon/45 bg-gradient-to-r from-primary-neon/20 via-neon-pink/15 to-cyber-cyan/10 text-text shadow-[0_0_20px_rgba(176,38,255,0.26)] hover:border-neon-pink/80 hover:shadow-[0_0_30px_rgba(255,43,214,0.38)]';
  }

  return isActive
    ? 'border-primary-neon/35 bg-primary-neon/15 text-primary-neon shadow-[0_0_22px_rgb(176_38_255_/_16%)]'
    : 'border-transparent text-muted-text hover:border-border hover:bg-elevated/70 hover:text-text';
};

export const Sidebar = ({ groups }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      groups.map((group) => [
        group.id,
        isGroupActive(group, pathname) || Boolean(group.items?.some((item) => item.featured)),
      ]),
    ),
  );

  useEffect(() => {
    setExpandedGroups((current) => {
      const activeGroups = groups.filter((group) => isGroupActive(group, pathname));

      if (activeGroups.every((group) => current[group.id])) return current;

      return {
        ...current,
        ...Object.fromEntries(activeGroups.map((group) => [group.id, true])),
      };
    });
  }, [groups, pathname]);

  return (
    <aside
      className={`min-h-0 min-w-16 shrink-0 overflow-visible transition-[width] duration-300 lg:block ${collapsed ? 'w-16' : 'w-72'}`}
    >
      <AnimatedPanel className={`h-full min-w-0 ${collapsed ? '!p-1.5' : ''}`}>
        <nav
          aria-label="Основная навигация"
          className={`flex h-full min-w-0 flex-col gap-gap overflow-x-hidden overflow-y-auto ${collapsed ? '!p-0.5' : 'p-page'}`}
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
          {groups.map((group) => {
            const GroupIcon = group.icon;

            if (group.to) {
              const directClassName = getItemToneClassName(group.featured, group.to === pathname);

              return (
                <NavLink
                  aria-label={group.label}
                  className={() =>
                    `flex min-w-0 items-center border text-sm transition-[color,background-color,border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-cyber-cyan ${collapsed ? 'mx-auto h-10 w-10 justify-center rounded-full p-0' : 'gap-gap rounded-[var(--radius-panel)] px-2 py-2'} ${directClassName}`
                  }
                  key={group.id}
                  to={group.to}
                >
                  <GroupIcon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span className="truncate">{group.label}</span>}
                </NavLink>
              );
            }

            const groupIsOpen = collapsed || expandedGroups[group.id];

            return (
              <section className="flex flex-col gap-1" key={group.id}>
                {!collapsed && (
                  <button
                    aria-controls={`sidebar-group-${group.id}`}
                    aria-expanded={groupIsOpen}
                    className="text-muted-text hover:border-primary-neon/35 hover:bg-primary-neon/10 hover:text-text flex min-w-0 cursor-pointer items-center justify-between rounded-[var(--radius-panel)] border border-transparent px-2.5 py-2 text-left text-xs font-medium uppercase tracking-[0.12em] transition-colors focus-visible:outline-2 focus-visible:outline-cyber-cyan"
                    onClick={() =>
                      setExpandedGroups((current) => ({
                        ...current,
                        [group.id]: !current[group.id],
                      }))
                    }
                    type="button"
                  >
                    <span className="flex min-w-0 items-center gap-1.5 truncate">
                      <GroupIcon
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0"
                        strokeWidth={1.8}
                      />
                      <span className="truncate">{group.label}</span>
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className={`h-4 w-4 shrink-0 transition-transform ${groupIsOpen ? '' : '-rotate-90'}`}
                    />
                  </button>
                )}
                {groupIsOpen && (
                  <div
                    className={`flex flex-col gap-1 ${collapsed ? '' : 'pl-5'}`}
                    id={`sidebar-group-${group.id}`}
                  >
                    {(group.items ?? []).map((item) => {
                      const Icon = item.icon;
                      const itemIsActive = isItemActive(item, pathname);
                      const featuredClassName = getItemToneClassName(item.featured, itemIsActive);

                      return (
                        <div
                          className="group relative"
                          key={`${item.to ?? 'callback'}-${item.label}`}
                        >
                          {item.to ? (
                            <NavLink
                              aria-label={item.label}
                              className={() =>
                                `flex min-w-0 items-center ${collapsed ? 'mx-auto h-10 w-10 justify-center rounded-full p-0' : 'gap-gap rounded-[var(--radius-panel)] px-2 py-2'} border text-sm transition-[color,background-color,border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-cyber-cyan ${featuredClassName}`
                              }
                              end={!item.children?.length}
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
                              className={`text-muted-text hover:text-text flex min-w-0 w-full items-center rounded-xl py-2 text-sm ${collapsed ? 'justify-center px-0' : 'gap-gap px-2'}`}
                              onClick={item.callback}
                              type="button"
                            >
                              <Icon className="h-5 w-5 shrink-0" />
                              {!collapsed && item.label}
                            </button>
                          )}
                          {!collapsed && item.children && (
                            <div className="border-border/70 ml-4 mt-0.5 space-y-0.5 border-l pl-2">
                              {item.children.map((child) => {
                                const ChildIcon = child.icon;
                                const childIsActive = isItemActive(child, pathname);
                                const childClassName = `flex items-center gap-gap rounded-lg px-1.5 py-1.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-cyber-cyan ${childIsActive ? 'bg-primary-neon/10 text-primary-neon' : 'text-muted-text hover:text-text'}`;

                                return child.to ? (
                                  <NavLink
                                    className={childClassName}
                                    key={child.label}
                                    to={child.to}
                                  >
                                    <ChildIcon className="h-4 w-4 shrink-0" />
                                    {child.label}
                                  </NavLink>
                                ) : (
                                  <button
                                    className={`${childClassName} w-full`}
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
                  </div>
                )}
              </section>
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
