import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, TrendingDown } from "lucide-react";
import type { Transaction } from "@/types";
import { calculateMultiCurrencyTotal } from "@/lib/currency";

interface LifeReserveWidgetProps {
  totalBalance?: number;
  transactions?: Transaction[] | null;
  targetMonths?: number;
}

// Helper function (let's keep it simple for now)
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
  totalBalance = 0,
  transactions, // No default empty array here
  targetMonths = 6
}: LifeReserveWidgetProps) {

  const analysis = useMemo(() => {
    // --- FIX: Check if transactions is actually an array ---
    if (!Array.isArray(transactions)) {
       return {
         monthlyAverage: 0,
         monthsOfReserve: 0,
         targetReserve: 0,
         reserveProgress: 0,
         shortage: 0,
         isGood: false,
         isMedium: false,
         isLow: true // Default to low if no data
       };
    }
    // --- End of FIX ---

    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());

    const recentExpenses = transactions
      .filter(t => t.type === 'expense' && t.date && (t.date instanceof Date ? t.date : new Date(t.date)) >= threeMonthsAgo)
      .map(t => ({ amount: t.amount, currency: t.currency }));

    const totalExpenses = calculateMultiCurrencyTotal(recentExpenses);
    const monthlyAverage = totalExpenses / 3;

    const monthsOfReserve = monthlyAverage > 0 ? totalBalance / monthlyAverage : Infinity;

    const targetReserve = monthlyAverage * targetMonths;
    const reserveProgress = targetReserve > 0 ? (totalBalance / targetReserve) * 100 : 100;

    const shortage = Math.max(0, targetReserve - totalBalance);
    const isGood = monthsOfReserve >= targetMonths;
    const isMedium = monthsOfReserve >= targetMonths / 2;
    const isLow = monthsOfReserve < targetMonths / 2;

    return {
      monthlyAverage,
      monthsOfReserve: monthsOfReserve === Infinity ? Infinity : monthsOfReserve,
      targetReserve,
      reserveProgress: Math.min(reserveProgress, 100),
      shortage,
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
            <CardTitle>Life Reserve</CardTitle>
            <CardDescription>Financial safety net</CardDescription>
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
          <div className="text-xs text-muted-foreground mb-1">Covers</div>
          <div className={`text-2xl font-bold ${
            analysis.isGood
              ? 'text-green-600 dark:text-green-400'
              : analysis.isMedium
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-destructive'
          }`}>
            {analysis.monthsOfReserve === Infinity ? '∞' : analysis.monthsOfReserve.toFixed(1)} months
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Target: {targetMonths} months
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
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
              <span className="text-muted-foreground">Avg. Monthly Expense</span>
            </div>
            <span className="font-medium">{formatCurrency(analysis.monthlyAverage)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Current Balance</span>
            <span className="font-medium">{formatCurrency(totalBalance)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Target Reserve</span>
            <span className="font-medium text-primary">{formatCurrency(analysis.targetReserve)}</span>
          </div>
          {analysis.shortage > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Shortage</span>
              <span className="font-medium text-destructive">{formatCurrency(analysis.shortage)}</span>
            </div>
          )}
        </div>

        {/* Status Message */}
        {analysis.isGood && (
          <div className="text-xs text-green-600 dark:text-green-400">
            ✓ Excellent reserve! You're covered for {analysis.monthsOfReserve === Infinity ? 'a very long time' : `${analysis.monthsOfReserve.toFixed(1)} months`}.
          </div>
        )}
        {analysis.isMedium && !analysis.isGood && (
          <div className="text-xs text-yellow-600 dark:text-yellow-400">
            ⚡ Reserve is okay, but aim for {targetMonths} months.
          </div>
        )}
        {analysis.isLow && (
          <div className="text-xs text-destructive">
            ⚠️ Low reserve. Recommended to save for {targetMonths} months of expenses.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
