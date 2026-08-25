import { HeartPulse } from 'lucide-react';
import { AnimatedPanel, PageLayout } from '@/shared/ui';
import {
  WellbeingAdvancedPanel,
  WellbeingPanel,
  WellbeingRitualsMeetingsPanel,
} from '@/features/wellbeing';

export const WellbeingPage = () => (
  <PageLayout>
    <AnimatedPanel className="page-header">
      <p className="text-primary-neon text-xs font-semibold uppercase tracking-[0.2em]">
        Семейное пространство
      </p>
      <h1 className="text-text mt-1 text-2xl font-semibold sm:text-3xl">
        <HeartPulse className="text-primary-neon mr-2 inline h-7 w-7" />
        Благополучие
      </h1>
      <p className="text-muted-text mt-1 text-sm">
        Мягкая ежедневная проверка состояния и безопасный обмен поддержкой.
      </p>
    </AnimatedPanel>
    <WellbeingPanel />
    <WellbeingAdvancedPanel />
    <WellbeingRitualsMeetingsPanel />
  </PageLayout>
);
