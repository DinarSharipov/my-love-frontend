import { useState } from 'react';

import { NotificationsPage } from '@/pages/notifications';
import { ProfilePage } from '@/pages/profile';
import { Tabs } from '@/shared/ui';
import { ThemeSettingsPanel } from './ThemeSettingsPanel';

type SettingsTab = 'notifications' | 'profile' | 'theme';

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('notifications');
  const content = (() => {
    if (activeTab === 'notifications') return <NotificationsPage />;
    if (activeTab === 'profile') return <ProfilePage />;
    return <ThemeSettingsPanel />;
  })();

  return (
    <main className="h-full min-h-0 overflow-hidden">
      <div className="flex h-full min-h-0 w-full flex-col gap-gap">
        <header className="page-header shrink-0">
          <p className="text-cyber-cyan text-xs font-semibold uppercase tracking-[0.2em]">
            Центр управления
          </p>
          <h1 className="text-text mt-1 text-2xl font-semibold sm:text-3xl">Настройки</h1>
          <p className="text-muted-text mt-1 text-sm">
            Профиль, уведомления и подключённые каналы.
          </p>
        </header>
        <div className="shrink-0">
          <Tabs
            activeId={activeTab}
            items={[
              { id: 'notifications', label: 'Уведомления' },
              { id: 'profile', label: 'Личный кабинет' },
              { id: 'theme', label: 'Темизация' },
            ]}
            onChange={(id) => setActiveTab(id as SettingsTab)}
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{content}</div>
      </div>
    </main>
  );
};
