import {
  CalendarDays,
  Baby,
  ChefHat,
  HeartPulse,
  Images,
  ListChecks,
  MailCheck,
  MessageCircleMore,
  Repeat2,
  ShoppingBasket,
  WalletCards,
} from 'lucide-react';
import { Outlet } from 'react-router-dom';

import { Sidebar, type SidebarMenuGroup } from '@/shared/ui';
import { LogoIcon } from '@/shared/ui/logo/LogoIcon';

const familyMenuGroups: readonly SidebarMenuGroup[] = [
  {
    icon: LogoIcon,
    id: 'overview',
    items: [{ icon: LogoIcon, label: 'Обзор семьи', to: '/my_family' }],
    label: 'Обзор',
  },
  {
    icon: CalendarDays,
    id: 'planning',
    items: [
      { icon: CalendarDays, label: 'Календарь', to: '/my_family/calendar' },
      {
        children: [{ icon: Repeat2, label: 'Регулярные задачи', to: '/my_family/task-routines' }],
        icon: ListChecks,
        label: 'Задачи',
        to: '/my_family/tasks',
      },
    ],
    label: 'Планирование',
  },
  {
    icon: ShoppingBasket,
    id: 'household',
    items: [
      { icon: ShoppingBasket, label: 'Покупки', to: '/my_family/shopping-lists' },
      { icon: ChefHat, label: 'Питание', to: '/my_family/meals' },
    ],
    label: 'Быт',
  },
  {
    icon: HeartPulse,
    id: 'family',
    items: [
      { icon: Baby, label: 'Дети', to: '/my_family/children' },
      { icon: HeartPulse, label: 'Благополучие', to: '/my_family/wellbeing' },
      { icon: MessageCircleMore, label: 'Сообщения', to: '/my_family/messenger' },
      { icon: Images, label: 'Наши моменты', to: '/my_family/media' },
    ],
    label: 'Семья',
  },
  {
    icon: WalletCards,
    id: 'finance',
    items: [{ icon: WalletCards, label: 'Финансы', to: '/my_family/finance' }],
    label: 'Финансы',
  },
  {
    icon: MailCheck,
    id: 'management',
    items: [{ icon: MailCheck, label: 'Приглашения', to: '/my_family/family-invitations' }],
    label: 'Управление',
  },
];

export const FamilySectionLayout = () => (
  <div className="flex h-full min-h-0 min-w-0 max-w-full gap-gap">
    <Sidebar groups={familyMenuGroups} />
    <div className="h-full min-h-0 min-w-0 flex-1 overflow-visible">
      <Outlet />
    </div>
  </div>
);
