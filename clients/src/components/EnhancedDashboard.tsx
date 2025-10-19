import StatCard from "./StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, TrendingDown, Target, Sparkles } from "lucide-react";
import type { PlannedPayment, Transaction } from "@/types";
import { Budget } from "./BudgetCard";
import UpcomingPaymentsBudgets from "./UpcomingPaymentsBudgets";
import FreeFundsWidget from "./FreeFundsWidget";
import LifeReserveWidget from "./LifeReserveWidget";
import ExpenseTrendsAnalyzer from "./ExpenseTrendsAnalyzer";
import { calculateMultiCurrencyTotal, formatCurrency, groupByCurrency } from "@/lib/currency";

interface EnhancedDashboardProps {
  totalBalance: number;
  totalBalanceByCurrency: Record<string, number>;
  income: number;
  expenses: number;
  savings: number;
  transactions: Transaction[];
  goalsCount?: number;
  payments?: PlannedPayment[];
  budgets?: Budget[];
  currentSpace?: 'personal' | 'business';
}

export default function EnhancedDashboard({ 
  totalBalance,
  totalBalanceByCurrency,
  income, 
  expenses, 
  savings,
  transactions,
  goalsCount,
  payments = [],
  budgets = [],
  currentSpace = 'personal'
}: EnhancedDashboardProps) {
  // Calculate category totals (converted to RUB for comparison, filtered by current space)
  const categoryTotals = transactions
    .filter(t => t.type === 'expense' && t.space === currentSpace)
    .reduce((acc, t) => {
      const rubAmount = calculateMultiCurrencyTotal([{ amount: t.amount, currency: t.currency }]);
      acc[t.category] = (acc[t.category] || 0) + rubAmount;
      return acc;
    }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const totalExpenses = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

  return (
    <div className="space-y-6" data-testid="enhanced-dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="stat-card-total-balance" className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Всего средств
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-2">
              {formatCurrency(totalBalance, 'RUB')}
            </div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(totalBalanceByCurrency).map(([currency, amount]) => (
                <Badge key={currency} variant="secondary" className="text-xs">
                  {formatCurrency(amount, currency)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <StatCard
          title="Доходы"
          value={formatCurrency(income, 'RUB')}
          subtitle="За текущий месяц"
          icon={<TrendingUp className="h-4 w-4" />}
          trend="up"
        />
        <StatCard
          title="Расходы"
          value={formatCurrency(expenses, 'RUB')}
          subtitle="За текущий месяц"
          icon={<TrendingDown className="h-4 w-4" />}
          trend="neutral"
        />
        <StatCard
          title="Сбережения"
          value={formatCurrency(savings, 'RUB')}
          subtitle={goalsCount ? `${goalsCount} активных целей` : undefined}
          icon={<Target className="h-4 w-4" />}
        />
      </div>

      {/* Financial Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FreeFundsWidget 
          totalBalance={totalBalance}
          plannedPayments={payments}
        />
        <LifeReserveWidget 
          totalBalance={totalBalance}
          transactions={transactions}
          targetMonths={6}
        />
      </div>

      {/* Expense Trends and Category Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card className="shadow-glow">
          <CardHeader>
            <CardTitle>Расходы по категориям</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCategories.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Расходов пока нет
                </p>
              ) : (
                topCategories.map(([category, amount]) => {
                  const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{category}</span>
                        <span className="text-muted-foreground">
                          {formatCurrency(amount, 'RUB')} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expense Trends Analyzer */}
        <ExpenseTrendsAnalyzer 
          transactions={transactions}
          currentSpace={currentSpace}
        />
      </div>

      {/* Upcoming Payments and Budget Impact */}
      <UpcomingPaymentsBudgets payments={payments} budgets={budgets} />
    </div>
  );
}
