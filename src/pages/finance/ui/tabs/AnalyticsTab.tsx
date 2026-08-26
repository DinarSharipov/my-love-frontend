import type { FinancialAnalytics } from '@/entities/finance';
import { useGetFinancialAnalyticsQuery } from '@/entities/finance';
import { AnimatedPanel, AsyncState } from '@/shared/ui';

const formatMinor = (amountMinor: string, currency: string) => {
  const amount = Number(amountMinor) / 100;
  if (!Number.isFinite(amount) || !currency)
    return currency ? `${amountMinor} ${currency}` : amountMinor;

  return new Intl.NumberFormat('ru-RU', {
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: 'currency',
  }).format(amount);
};

const getChartMax = (cashFlow: FinancialAnalytics['cashFlow']) =>
  Math.max(
    1,
    ...cashFlow.flatMap((month) =>
      month.actual.flatMap((item) => [Number(item.incomeMinor), Number(item.expenseMinor)]),
    ),
  );

export const AnalyticsTab = () => {
  const query = useGetFinancialAnalyticsQuery({ months: 6, forecastDays: 30 });
  const cashFlow = query.data?.cashFlow ?? [];
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
        {cashFlow.length ? (
          <div className="space-y-3">
            <div className="text-muted-text flex flex-wrap items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <span className="bg-cyber-cyan size-2 rounded-full" /> Доходы
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="bg-primary-neon size-2 rounded-full" /> Расходы
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {cashFlow.map((month) => {
                const item = month.actual[0];
                const income = Number(item?.incomeMinor ?? 0);
                const expense = Number(item?.expenseMinor ?? 0);
                const chartMax = getChartMax(cashFlow);
                const monthLabel = new Date(month.periodStart).toLocaleDateString('ru-RU', {
                  month: 'short',
                  year: 'numeric',
                });
                return (
                  <div className="bg-surface rounded-panel p-3" key={month.periodStart}>
                    <div className="text-muted-text text-sm capitalize">{monthLabel}</div>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-text w-14 text-xs">Доходы</span>
                        <div className="bg-border h-2 min-w-0 flex-1 overflow-hidden rounded-full">
                          <div
                            className="bg-cyber-cyan h-full rounded-full"
                            style={{ width: `${Math.min(100, (income / chartMax) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-text w-14 text-xs">Расходы</span>
                        <div className="bg-border h-2 min-w-0 flex-1 overflow-hidden rounded-full">
                          <div
                            className="bg-primary-neon h-full rounded-full"
                            style={{ width: `${Math.min(100, (expense / chartMax) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-muted-text mt-3 text-xs">
                      {formatMinor(String(income), item?.currency ?? '')} ·{' '}
                      {formatMinor(String(expense), item?.currency ?? '')}
                    </div>
                    <div className="text-cyber-cyan mt-1 text-sm font-semibold">
                      Итог: {formatMinor(item?.netMinor ?? '0', item?.currency ?? '')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-muted-text">Данных за период пока нет.</p>
        )}
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {(query.data?.balanceForecast ?? []).map((forecast) => (
            <div className="border-border rounded-panel border p-3" key={forecast.currency}>
              <div className="text-text font-semibold">Прогноз баланса · {forecast.currency}</div>
              <div className="text-muted-text text-sm">
                Сейчас {formatMinor(forecast.currentBalanceMinor, forecast.currency)} →{' '}
                {formatMinor(forecast.projectedBalanceMinor, forecast.currency)}
              </div>
            </div>
          ))}
        </div>
      </AnimatedPanel>
    </AsyncState>
  );
};
