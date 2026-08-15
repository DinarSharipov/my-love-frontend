import { CalendarDays, Heart, ListChecks } from 'lucide-react';
import type { ReactNode } from 'react';

import { AnimatedPanel } from '@/shared/ui';
import { FamilyCalendar } from '@/widgets/family-calendar';
import { FirstDateTracker } from '@/widgets/first-date-tracker';
import { FamilyTasks } from '@/widgets/family-tasks';

const DashboardCard = ({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Heart;
  title: string;
  children: ReactNode;
}) => (
  <AnimatedPanel className="min-h-0">
    <div className="mb-4 flex items-center gap-3">
      <Icon aria-hidden="true" className="text-cyber-cyan" size={20} />
      <h2 className="text-text text-lg font-semibold">{title}</h2>
    </div>
    {children}
  </AnimatedPanel>
);

export const MainPage = () => (
  <main className="text-text flex min-h-0 flex-1 flex-col gap-4 overflow-auto lg:grid lg:grid-cols-[minmax(18rem,0.7fr)_minmax(0,1.5fr)] lg:overflow-hidden">
    <section className="flex min-h-0 flex-col gap-4 lg:-m-2 lg:overflow-auto lg:p-2">
      <DashboardCard icon={Heart} title="Наша история">
        <FirstDateTracker />
      </DashboardCard>

      <DashboardCard icon={ListChecks} title="Семейные дела">
        <FamilyTasks />
      </DashboardCard>
    </section>

    <section className="min-h-0 lg:-m-2 lg:overflow-auto lg:p-2">
      <DashboardCard icon={CalendarDays} title="Ближайшие события">
        <FamilyCalendar />
      </DashboardCard>
    </section>
  </main>
);
