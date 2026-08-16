import { CalendarDays, ListChecks, MailCheck, Repeat2, ShoppingBasket, UsersRound } from 'lucide-react';
import { Outlet } from 'react-router-dom';

import { Sidebar, type MenuItem } from '@/shared/ui';

const familyMenuItems: readonly MenuItem[] = [
  { icon: UsersRound, label: 'Общие', to: '/my_family' },
  { icon: CalendarDays, label: 'Календарь', to: '/my_family/calendar' },
  { icon: ListChecks, label: 'Задачи', to: '/my_family/tasks' },
  { icon: Repeat2, label: 'Регулярные задачи', to: '/my_family/task-routines' },
  { icon: ShoppingBasket, label: 'Покупки', to: '/my_family/shopping-lists' },
  { icon: MailCheck, label: 'Приглашения', to: '/my_family/family-invitations' },
];

export const FamilySectionLayout = () => (
  <div className="flex h-full min-h-0 gap-4">
    <Sidebar items={familyMenuItems} />
    <div className="min-w-0 flex-1">
      <Outlet />
    </div>
  </div>
);
