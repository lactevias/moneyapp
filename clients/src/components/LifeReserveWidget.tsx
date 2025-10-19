import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, TrendingDown } from "lucide-react";
import type { Transaction } from "@/types";
import { calculateMultiCurrencyTotal } from "@/lib/currency";

interface LifeReserveWidgetProps {
  totalBalance: number;
  transactions: Transaction[];
  targetMonths?: number; // Default is 6 months
}

const formatCurrency = (amount: number, currency: string = 'RUB') => {
  const symbols: Record<string, string> = {
    RUB: '₽',
    GEL: '₾',
    USD: '$',
    KZT: '₸',
    USDT: '₮',
  };
  return `${amount.toFixed(0)} ${symbols[currency] || currency}`;
};

export default function LifeReserveWidget({ 
  totalBalance, 
  transactions,
  targetMonths = 6 
}: LifeReserveWidgetProps) {
  const analysis = useMemo(() => {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    
    // Get expenses from last 3 months
    const recentExpenses = transactions
      .filter(t => t.type === 'expense' && t.date >= threeMonthsAgo)
      .map(t => ({ amount: t.amount, currency: t.currency }));
    
    // Calculate total expenses and average monthly
    const totalExpenses = calculateMultiCurrencyTotal(recentExpenses);
    const monthlyAverage = totalExpenses / 3;
    
    // Calculate months of reserve
    const monthsOfReserve = monthlyAverage > 0 ? totalBalance / monthlyAverage : 0;
    
    // Target reserve amount
    const targetReserve = monthlyAverage * targetMonths;
    const reserveProgress = targetReserve > 0 ? (totalBalance / targetReserve) * 100 : 0;
    
    // Status
    const isGood = monthsOfReserve >= targetMonths;
    const isMedium = monthsOfReserve >= targetMonths / 2;
    const isLow = monthsOfReserve < targetMonths / 2;
    
    return {
      monthlyAverage,
      monthsOfReserve,
      targetReserve,
      reserveProgress: Math.min(reserveProgress, 100),
      shortage: Math.max(0, targetReserve - totalBalance),
      isGood,
      isMedium,
      isLow
    };
  }, [totalBalance, transactions, targetMonths]);

  return (
    <Card data-testid="life-reserve-widget">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Резерв на жизнь</CardTitle>
            <CardDescription>Финансовая подушка безопасности</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Months of Reserve */}
        <div className={`p-4 rounded-lg border ${
          analysis.isGood 
            ? 'bg-green-500/10 border-green-500/20' 
            : analysis.isMedium 
              ? 'bg-yellow-500/10 border-yellow-500/20' 
              : 'bg-destructive/10 border-destructive/20'
        }`}>
          <div className="text-xs text-muted-foreground mb-1">Хватит на</div>
          <div className={`text-2xl font-bold ${
            analysis.isGood 
              ? 'text-green-600 dark:text-green-400' 
              : analysis.isMedium 
                ? 'text-yellow-600 dark:text-yellow-400' 
                : 'text-destructive'
          }`}>
            {analysis.monthsOfReserve.toFixed(1)} мес.
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Цель: {targetMonths} месяцев
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Прогресс</span>
            <span className="font-medium">{analysis.reserveProgress.toFixed(0)}%</span>
          </div>
          <Progress 
            value={analysis.reserveProgress} 
            className={
              analysis.isGood 
                ? 'bg-muted [&>*]:bg-green-500' 
                : analysis.isMedium 
                  ? 'bg-muted [&>*]:bg-yellow-500' 
                  : 'bg-muted [&>*]:bg-destructive'
            }
          />
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm border-t border-border pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Средний расход/мес</span>
            </div>
            <span className="font-medium">{formatCurrency(analysis.monthlyAverage)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Текущий баланс</span>
            <span className="font-medium">{formatCurrency(totalBalance)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Целевой резерв</span>
            <span className="font-medium text-primary">{formatCurrency(analysis.targetReserve)}</span>
          </div>
          {analysis.shortage > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Не хватает</span>
              <span className="font-medium text-destructive">{formatCurrency(analysis.shortage)}</span>
            </div>
          )}
        </div>

        {/* Status Message */}
        {analysis.isGood && (
          <div className="text-xs text-green-600 dark:text-green-400">
            ✓ Отличный резерв! Вы защищены на {analysis.monthsOfReserve.toFixed(1)} месяцев
          </div>
        )}
        {analysis.isMedium && !analysis.isGood && (
          <div className="text-xs text-yellow-600 dark:text-yellow-400">
            ⚡ Резерв есть, но стоит увеличить до {targetMonths} месяцев
          </div>
        )}
        {analysis.isLow && (
          <div className="text-xs text-destructive">
            ⚠️ Низкий резерв. Рекомендуем накопить на {targetMonths} месяцев расходов
          </div>
        )}
      </CardContent>
    </Card>
  );
}
