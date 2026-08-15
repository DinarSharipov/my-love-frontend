import { CalendarDays, Heart, ListChecks } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

import { AnimatedPanel } from '@/shared/ui';
import { FamilyCalendar } from '@/widgets/family-calendar';
import { FirstDateTracker } from '@/widgets/first-date-tracker';

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
    <section className="flex min-h-0 flex-col gap-4 lg:overflow-auto lg:pr-1">
      <DashboardCard icon={Heart} title="Наша история">
        <FirstDateTracker />
      </DashboardCard>

      <DashboardCard icon={ListChecks} title="Семейные дела">
        <p className="text-muted-text text-sm leading-6">
          Здесь появятся задачи, покупки и общие договорённости семьи.
        </p>
        <Link
          className="border-primary-neon text-text hover:bg-primary-neon/15 mt-4 inline-flex w-full items-center justify-center rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors"
          to="/family-calendar"
        >
          Открыть семейный календарь
        </Link>
      </DashboardCard>
    </section>

    <section className="min-h-0 lg:overflow-auto lg:pr-1">
      <DashboardCard icon={CalendarDays} title="Ближайшие события">
        <FamilyCalendar />
      </DashboardCard>
    </section>
  </main>
);
