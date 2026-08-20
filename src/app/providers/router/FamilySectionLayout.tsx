import {
  CalendarDays,
  Baby,
  HeartPulse,
  ListChecks,
  MailCheck,
  Repeat2,
  ShoppingBasket,
  WalletCards,
} from 'lucide-react';
import { Outlet } from 'react-router-dom';

import { Sidebar, type MenuItem } from '@/shared/ui';
import { LogoIcon } from '@/shared/ui/logo/LogoIcon';

const familyMenuItems: readonly MenuItem[] = [
  { icon: LogoIcon, label: 'Общие', to: '/my_family' },
  { icon: CalendarDays, label: 'Календарь', to: '/my_family/calendar' },
  { icon: ListChecks, label: 'Задачи', to: '/my_family/tasks' },
  { icon: Repeat2, label: 'Регулярные задачи', to: '/my_family/task-routines' },
  { icon: ShoppingBasket, label: 'Покупки', to: '/my_family/shopping-lists' },
  { icon: WalletCards, label: 'Финансы', to: '/my_family/finance' },
  { icon: HeartPulse, label: 'Благополучие', to: '/my_family/wellbeing' },
  { icon: Baby, label: 'Дети', to: '/my_family/children' },
  { icon: MailCheck, label: 'Приглашения', to: '/my_family/family-invitations' },
];

export const FamilySectionLayout = () => (
  <div className="flex h-full min-h-0 min-w-0 max-w-full gap-gap">
    <Sidebar items={familyMenuItems} />
    <div className="h-full min-h-0 min-w-0 flex-1 overflow-hidden">
      <Outlet />
    </div>
  </div>
);
