import { useSelector } from 'react-redux';

import { selectCurrentUser } from '@/entities/user';
import { AnimatedPanel, Calendar } from '@/shared/ui';

export const MainPage = () => {
  const user = useSelector(selectCurrentUser);

  return (
    <main className="flex-1 flex h-full min-h-0 gap-4 grid grid-cols-[.2fr_1fr]">
      <AnimatedPanel>
        <Calendar />
      </AnimatedPanel>
      <AnimatedPanel>
        <Calendar />
      </AnimatedPanel>
    </main>
  );
};
