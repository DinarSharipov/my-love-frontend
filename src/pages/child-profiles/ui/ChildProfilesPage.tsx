import { Baby } from 'lucide-react';

import { ChildProfilesPanel } from '@/features/child-profiles';
import { PageLayout } from '@/shared/ui';

export const ChildProfilesPage = () => (
  <PageLayout>
    <header className="page-header">
      <p className="text-cyber-cyan text-xs font-semibold uppercase tracking-[0.2em]">
        Семейное пространство
      </p>
      <h1 className="text-text mt-1 text-2xl font-semibold sm:text-3xl">
        <Baby className="text-cyber-cyan mr-2 inline h-7 w-7" />
        Профили детей
      </h1>
      <p className="text-muted-text mt-1 text-sm">
        Зависимые профили без самостоятельного входа: данные остаются внутри вашей семьи.
      </p>
    </header>
    <ChildProfilesPanel />
  </PageLayout>
);
