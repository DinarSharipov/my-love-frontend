import { PageLayout } from '@/shared/ui';
import { FamilyCalendar } from '@/widgets/family-calendar';

export const FamilyCalendarPage = () => (
  <PageLayout
    className="flex min-h-0 flex-col"
    childrenClassName="min-h-0 flex-1"
    contentClassName="flex min-h-0 flex-col overflow-hidden"
  >
    <FamilyCalendar />
  </PageLayout>
);
