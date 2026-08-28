import { useState } from 'react';

import { NotificationsPage } from '@/pages/notifications';
import { ProfilePage } from '@/pages/profile';
import { HeaderPanel, Tabs } from '@/shared/ui';
import { ThemeSettingsPanel } from './ThemeSettingsPanel';

type SettingsTab = 'notifications' | 'profile' | 'theme';

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const content = (() => {
    if (activeTab === 'profile') return <ProfilePage />;
    if (activeTab === 'notifications') return <NotificationsPage />;
    return <ThemeSettingsPanel />;
  })();

  return (
    <main className="h-full min-h-0 overflow-hidden">
      <div className="flex h-full min-h-0 w-full flex-col gap-gap p-5">
        <HeaderPanel
          left={
            <>
              <p className="text-cyber-cyan text-xs font-semibold uppercase tracking-[0.2em]">
                Центр управления
              </p>
              <h1 className="text-text mt-1 text-2xl font-semibold sm:text-3xl">Настройки</h1>
              <p className="text-muted-text mt-1 text-sm">
                Профиль, уведомления и подключённые каналы.
              </p>
            </>
          }
        />
        <div className="shrink-0">
          <Tabs
            activeId={activeTab}
            items={[
              { id: 'profile', label: 'Личный кабинет' },
              { id: 'notifications', label: 'Уведомления' },
              { id: 'theme', label: 'Темизация' },
            ]}
            onChange={(id) => setActiveTab(id as SettingsTab)}
          />
        </div>
        <div
          className={`min-h-0 flex-1 ${activeTab === 'notifications' ? 'overflow-hidden' : 'overflow-y-auto'}`}
        >
          {content}
        </div>
      </div>
    </main>
  );
};
