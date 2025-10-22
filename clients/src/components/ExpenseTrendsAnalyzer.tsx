import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import type { Transaction, Space } from "@/types"; // Убедись, что импортируешь типы
import { calculateMultiCurrencyTotal } from "@/lib/currency";

interface ExpenseTrendsAnalyzerProps {
  transactions?: Transaction[] | null; // Сделаем опциональным и разрешим null
  currentSpace: Space;
}

interface CategoryTrend {
  category: string;
  currentMonth: number; // in RUB
  previousMonth: number; // in RUB
  change: number; // percentage
  changeAmount: number; // in RUB
  trend: 'up' | 'down' | 'stable';
}

export default function ExpenseTrendsAnalyzer({ transactions, currentSpace }: ExpenseTrendsAnalyzerProps) {
  const trends = useMemo(() => {
    // --- ИСПРАВЛЕНИЕ: Добавляем проверку, что transactions это массив ---
    if (!Array.isArray(transactions)) {
      return []; // Возвращаем пустой массив, если данных нет
    }
    // --- Конец ИСПРАВЛЕНИЯ ---


    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const currentMonthExpenses = transactions.filter(t => {
      const tDate = t.date instanceof Date ? t.date : new Date(t.date);
      return t.type === 'expense' &&
        tDate >= currentMonthStart &&
        tDate < nextMonthStart &&
        t.space === currentSpace;
    });

    const previousMonthExpenses = transactions.filter(t => {
      const tDate = t.date instanceof Date ? t.date : new Date(t.date);
      return t.type === 'expense' &&
        tDate >= previousMonthStart &&
        tDate < currentMonthStart &&
        t.space === currentSpace;
    });

    const categoriesMap = new Map<string, CategoryTrend>();

    currentMonthExpenses.forEach(t => {
      const existing = categoriesMap.get(t.category);
      const amountInRub = calculateMultiCurrencyTotal([{ amount: t.amount, currency: t.currency }]);

      if (existing) {
        existing.currentMonth += amountInRub;
      } else {
        categoriesMap.set(t.category, {
          category: t.category,
          currentMonth: amountInRub,
          previousMonth: 0,
          change: 0,
          changeAmount: 0,
          trend: 'stable'
        });
      }
    });

    previousMonthExpenses.forEach(t => {
      const existing = categoriesMap.get(t.category);
      const amountInRub = calculateMultiCurrencyTotal([{ amount: t.amount, currency: t.currency }]);

      if (existing) {
        existing.previousMonth += amountInRub;
      } else {
        categoriesMap.set(t.category, {
          category: t.category,
          currentMonth: 0,
          previousMonth: amountInRub,
          change: 0,
          changeAmount: 0,
          trend: 'stable'
        });
      }
    });

    const trendsArray: CategoryTrend[] = [];
    categoriesMap.forEach((trend) => {
      if (trend.previousMonth > 0) {
        trend.change = ((trend.currentMonth - trend.previousMonth) / trend.previousMonth) * 100;
      } else if (trend.currentMonth > 0) {
        trend.change = 100;
      } else {
        trend.change = 0; // Добавим случай, когда нет расходов в оба месяца
      }

      trend.changeAmount = trend.currentMonth - trend.previousMonth;

      if (Math.abs(trend.change) < 5) {
        trend.trend = 'stable';
      } else if (trend.change > 0) {
        trend.trend = 'up';
      } else {
        trend.trend = 'down';
      }

      if (trend.currentMonth > 0 || trend.previousMonth > 0) {
        trendsArray.push(trend);
      }
    });

    return trendsArray.sort((a, b) => Math.abs(b.changeAmount) - Math.abs(a.changeAmount));
  }, [transactions, currentSpace]);

  const risingCategories = trends.filter(t => t.trend === 'up');
  const fallingCategories = trends.filter(t => t.trend === 'down');
  const stableCategories = trends.filter(t => t.trend === 'stable');

  const formatCurrency = (amount: number) => {
    return `${Math.abs(amount).toFixed(0)} ₽`;
  };

  const formatPercentage = (value: number) => {
    return `${Math.abs(value).toFixed(0)}%`;
  };

  return (
    <Card data-testid="card-expense-trends" className="shadow-glow">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Expense Trends Analysis</CardTitle>
            <CardDescription>Comparison with last month</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Rising Trends */}
          {risingCategories.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-red-500" />
                <h4 className="text-sm font-semibold text-foreground">
                  Rising Categories ({risingCategories.length})
                </h4>
              </div>
              <div className="space-y-2">
                {risingCategories.map((trend) => (
                  <div
                    key={trend.category}
                    data-testid={`trend-rising-${trend.category}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover-elevate"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm text-foreground mb-1">
                        {trend.category}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatCurrency(trend.previousMonth)}</span>
                        <ArrowRight className="h-3 w-3" />
                        <span className="font-semibold text-red-600">
                          {formatCurrency(trend.currentMonth)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {formatPercentage(trend.change)}
                      </Badge>
                      <div className="text-xs font-medium text-red-600">
                        +{formatCurrency(trend.changeAmount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Falling Trends */}
          {fallingCategories.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="h-4 w-4 text-green-500" />
                <h4 className="text-sm font-semibold text-foreground">
                  Falling Categories ({fallingCategories.length})
                </h4>
              </div>
              <div className="space-y-2">
                {fallingCategories.map((trend) => (
                  <div
                    key={trend.category}
                    data-testid={`trend-falling-${trend.category}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover-elevate"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm text-foreground mb-1">
                        {trend.category}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatCurrency(trend.previousMonth)}</span>
                        <ArrowRight className="h-3 w-3" />
                        <span className="font-semibold text-green-600">
                          {formatCurrency(trend.currentMonth)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-700">
                        <TrendingDown className="h-3 w-3" />
                        {formatPercentage(trend.change)}
                      </Badge>
                      <div className="text-xs font-medium text-green-600">
                        −{formatCurrency(trend.changeAmount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stable Trends */}
          {stableCategories.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Minus className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-semibold text-foreground">
                  Stable Categories ({stableCategories.length})
                </h4>
              </div>
              <div className="space-y-2">
                {stableCategories.slice(0, 3).map((trend) => (
                  <div
                    key={trend.category}
                    data-testid={`trend-stable-${trend.category}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover-elevate"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm text-foreground mb-1">
                        {trend.category}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(trend.currentMonth)}
                      </div>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <Minus className="h-3 w-3" />
                      {formatPercentage(trend.change)}
                    </Badge>
                  </div>
                ))}
                {stableCategories.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center pt-1">
                    +{stableCategories.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )}

          {trends.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Not enough data for trend analysis</p>
              <p className="text-xs mt-1">Add transactions for the current and previous month</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
