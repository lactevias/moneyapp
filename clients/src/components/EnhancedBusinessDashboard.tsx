import StatCard from "./StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown, FileText, Briefcase } from "lucide-react";
import type { Transaction, TaxPayment } from "@/types";
import { formatCurrency, calculateMultiCurrencyTotal } from "@/lib/currency";
// import TaxPaymentWidget from "./TaxPaymentWidget"; // <-- ИЗМЕНЕНИЕ 1: УДАЛЕНО
import BusinessCalculators from "./BusinessCalculators";
import ExpenseTrendsAnalyzer from "./ExpenseTrendsAnalyzer";
import MoneyFlow from "./MoneyFlow";

interface EnhancedBusinessDashboardProps {
  totalBalance?: number;
  totalBalanceByCurrency?: Record<string, number>;
  income?: number;
  expenses?: number;
  netProfit?: number;
  transactions: Transaction[];
  taxPayments?: TaxPayment[];
  currentSpace?: 'personal' | 'business';
}

export default function EnhancedBusinessDashboard({
  totalBalance = 0,
  totalBalanceByCurrency = {},
  income = 0,
  expenses = 0,
  netProfit = 0,
  transactions = [],
  taxPayments = [],
  currentSpace = 'business'
}: EnhancedBusinessDashboardProps) {

  // Calculate expense categories (converted to RUB for comparison)
  const categoryTotals = (transactions || [])
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
    <div className="space-y-6" data-testid="enhanced-business-dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Business Funds"
          value={formatCurrency(totalBalance, 'RUB')}
          icon={<Briefcase className="h-4 w-4" />}
        />
        <StatCard
          title="Income"
          value={formatCurrency(income, 'RUB')}
          subtitle="This month"
          icon={<TrendingUp className="h-4 w-4" />}
          trend="up"
        />
        <StatCard
          title="Operating Expenses"
          value={formatCurrency(expenses, 'RUB')}
          subtitle="This month"
  S        icon={<TrendingDown className="h-4 w-4" />}
          trend="neutral"
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(netProfit, 'RUB')}
          subtitle="This month"
          icon={<FileText className="h-4 w-4" />}
        />
      </div>

      {/* Money Flow and Expense Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MoneyFlow 
          income={income}
          expenses={expenses}
        />
        <ExpenseTrendsAnalyzer 
          transactions={transactions}
          currentSpace={currentSpace}
        />
      </div>

      {/* Tax and Calculators Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* <TaxPaymentWidget taxPayments={taxPayments} /> */} {/* <-- ИЗМЕНЕНИЕ 2: Закомментировано */}
        <BusinessCalculators />
      </div>
    </div>
  );
}
