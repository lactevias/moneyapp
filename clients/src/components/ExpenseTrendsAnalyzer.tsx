import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import type { Transaction, Space } from "@/types";
import { calculateMultiCurrencyTotal } from "@/lib/currency";

interface ExpenseTrendsAnalyzerProps {
  transactions: Transaction[];
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
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Filter expenses for current month (normalize dates defensively)
    const currentMonthExpenses = transactions.filter(t => {
      const tDate = t.date instanceof Date ? t.date : new Date(t.date);
      return t.type === 'expense' && 
        tDate >= currentMonthStart &&
        tDate < nextMonthStart &&
        t.space === currentSpace;
    });

    // Filter expenses for previous month (normalize dates defensively)
    const previousMonthExpenses = transactions.filter(t => {
      const tDate = t.date instanceof Date ? t.date : new Date(t.date);
      return t.type === 'expense' && 
        tDate >= previousMonthStart && 
        tDate < currentMonthStart &&
        t.space === currentSpace;
    });

    // Group by category
    const categoriesMap = new Map<string, CategoryTrend>();

    // Calculate current month totals
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

    // Calculate previous month totals
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

    // Calculate trends
    const trendsArray: CategoryTrend[] = [];
    categoriesMap.forEach((trend) => {
      if (trend.previousMonth > 0) {
        trend.change = ((trend.currentMonth - trend.previousMonth) / trend.previousMonth) * 100;
      } else if (trend.currentMonth > 0) {
        trend.change = 100; // New category this month
      }
      
      trend.changeAmount = trend.currentMonth - trend.previousMonth;
      
      if (Math.abs(trend.change) < 5) {
        trend.trend = 'stable';
      } else if (trend.change > 0) {
        trend.trend = 'up';
      } else {
        trend.trend = 'down';
      }

      // Only include categories with expenses
      if (trend.currentMonth > 0 || trend.previousMonth > 0) {
        trendsArray.push(trend);
      }
    });

    // Sort by absolute change amount
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
            <CardTitle>Анализ трендов расходов</CardTitle>
            <CardDescription>Сравнение с прошлым месяцем</CardDescription>
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
                  Растущие категории ({risingCategories.length})
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
                  Снижающиеся категории ({fallingCategories.length})
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
                  Стабильные категории ({stableCategories.length})
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
                    +{stableCategories.length - 3} ещё
                  </div>
                )}
              </div>
            </div>
          )}

          {trends.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Недостаточно данных для анализа трендов</p>
              <p className="text-xs mt-1">Добавьте транзакции за текущий и прошлый месяц</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
