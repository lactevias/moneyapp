import StatCard from "./StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown, Target } from "lucide-react";

interface DashboardData {
  totalBalance: string;
  income: string;
  expenses: string;
  savings: string;
  incomeChange?: string;
  expensesChange?: string;
  goalsCount?: number;
}

interface FinanceDashboardProps {
  data: DashboardData;
}

export default function FinanceDashboard({ data }: FinanceDashboardProps) {
  return (
    <div className="space-y-6" data-testid="finance-dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Всего средств"
          value={data.totalBalance}
          icon={<Wallet className="h-4 w-4" />}
        />
        <StatCard
          title="Доходы"
          value={data.income}
          subtitle={data.incomeChange || "За текущий месяц"}
          icon={<TrendingUp className="h-4 w-4" />}
          trend="up"
        />
        <StatCard
          title="Расходы"
          value={data.expenses}
          subtitle={data.expensesChange || "За текущий месяц"}
          icon={<TrendingDown className="h-4 w-4" />}
          trend="neutral"
        />
        <StatCard
          title="Сбережения"
          value={data.savings}
          subtitle={data.goalsCount ? `${data.goalsCount} активные цели` : undefined}
          icon={<Target className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Расходы по категориям</CardTitle>
            <CardDescription>За последний месяц</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              График расходов
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Динамика накоплений</CardTitle>
            <CardDescription>Прогресс по целям</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              График накоплений
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
