import { useGetFinancialAnalyticsQuery } from '@/entities/finance';
import { AnimatedPanel, AsyncState } from '@/shared/ui';

export const AnalyticsTab = () => {
  const query = useGetFinancialAnalyticsQuery({ months: 6, forecastDays: 30 });
  return (
    <AsyncState
      error={query.error}
      errorMessage="Не удалось загрузить аналитику"
      hasData={Boolean(query.data)}
      isLoading={query.isLoading}
      onRetry={query.refetch}
    >
      <AnimatedPanel className="p-5">
        <h2 className="text-text mb-3 text-lg font-semibold">Аналитика</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {(query.data?.cashFlow ?? []).map((month) => {
            const item = month.actual[0];
            return (
              <div className="bg-surface rounded-panel p-3" key={month.periodStart}>
                <div className="text-muted-text text-sm">
                  {new Date(month.periodStart).toLocaleDateString('ru-RU', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
                <div className="text-text mt-1">
                  Доходы: {item?.incomeMinor ?? '0'} · Расходы: {item?.expenseMinor ?? '0'}
                </div>
                <div className="text-cyber-cyan text-sm">
                  Итог: {item?.netMinor ?? '0'} {item?.currency ?? ''}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {(query.data?.balanceForecast ?? []).map((forecast) => (
            <div className="border-border rounded-panel border p-3" key={forecast.currency}>
              <div className="text-text font-semibold">Прогноз баланса · {forecast.currency}</div>
              <div className="text-muted-text text-sm">
                Сейчас {forecast.currentBalanceMinor} → {forecast.projectedBalanceMinor}
              </div>
            </div>
          ))}
        </div>
      </AnimatedPanel>
    </AsyncState>
  );
};
