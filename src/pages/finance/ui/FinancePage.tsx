import { useState } from 'react';
import { HeaderPanel, PageLayout, Tabs } from '@/shared/ui';
import { AnalyticsTab } from './tabs/AnalyticsTab';
import { BudgetsTab } from './tabs/BudgetsTab';
import { GoalsTab } from './tabs/GoalsTab';
import { HistoryTab } from './tabs/HistoryTab';
import { MeetingsTab } from './tabs/MeetingsTab';
import { OperationTab } from './tabs/OperationTab';
import { RecurringTab } from './tabs/RecurringTab';
import { WalletsTab } from './tabs/WalletsTab';

export const FinancePage = () => {
  const [activeTab, setActiveTab] = useState('wallets');
  return (
    <PageLayout>
      <HeaderPanel
        left={
          <>
            <p className="text-cyber-cyan text-xs font-semibold uppercase tracking-[0.2em]">
              Семейные финансы
            </p>
            <h1 className="text-text mt-1 text-2xl font-semibold sm:text-3xl">Финансы</h1>
            <p className="text-muted-text mt-1 text-sm">Кошельки, операции и вклад участников.</p>
          </>
        }
      />
      <Tabs
        activeId={activeTab}
        onChange={setActiveTab}
        items={[
          { id: 'wallets', label: 'Кошельки', component: <WalletsTab /> },
          { id: 'goals', label: 'Цели', component: <GoalsTab /> },
          { id: 'budgets', label: 'Бюджеты', component: <BudgetsTab /> },
          { id: 'recurring', label: 'Регулярные платежи', component: <RecurringTab /> },
          { id: 'analytics', label: 'Аналитика', component: <AnalyticsTab /> },
          { id: 'meetings', label: 'Финансовые встречи', component: <MeetingsTab /> },
          { id: 'operation', label: 'Новая операция', component: <OperationTab /> },
          { id: 'history', label: 'История операций', component: <HistoryTab /> },
        ]}
      />
    </PageLayout>
  );
};
