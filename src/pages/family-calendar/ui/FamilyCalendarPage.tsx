import { PageLayout } from '@/shared/ui';
import { FamilyCalendar } from '@/widgets/family-calendar';

export const FamilyCalendarPage = () => (
  <PageLayout className="overflow-auto" contentClassName="min-h-full">
    <FamilyCalendar />
  </PageLayout>
);
