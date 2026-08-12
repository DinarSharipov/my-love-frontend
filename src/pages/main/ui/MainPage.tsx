import { AnimatedPanel, Calendar } from '@/shared/ui';

export const MainPage = () => (
  <main className="flex-1 h-full min-h-0 gap-4 grid grid-cols-[.5fr_1fr]">
    <AnimatedPanel className="h-full! min-h-0!">
      <div className="flex flex-col gap-2 overflow-auto h-full min-h-0 scrollbar-none">
        {Array.from({ length: 100 }, (_, i) => (
          <span key={i}>{i}</span>
        ))}
      </div>
    </AnimatedPanel>
    <AnimatedPanel>
      <div className="flex items-center gap-2">
        <Calendar />
        <Calendar />
      </div>
    </AnimatedPanel>
  </main>
);
