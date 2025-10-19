import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Wallet,
  ArrowUpRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export default function SimplifiedBusinessDashboard() {
  const [monthlyGoal] = useState(300000);

  // Mock data - in real app this would come from props or API
  const totalRevenue = 250000;
  const expenses = 85000;
  const taxProvision = totalRevenue * 0.06;
  const assistantSalary = 45000;
  const personalWithdrawals = 80000;
  
  const netProfit = totalRevenue - expenses - taxProvision - assistantSalary;
  const availableForWithdrawal = Math.max(0, netProfit - personalWithdrawals);
  const businessHealth = ((totalRevenue - expenses) / totalRevenue) * 100;
  const goalProgress = (totalRevenue / monthlyGoal) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Wallet className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">Бизнес-дашборд</h2>
          <p className="text-muted-foreground">Ключевые показатели и финансовое здоровье</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-business-health" className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Здоровье бизнеса
            </CardTitle>
            {businessHealth >= 70 ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{businessHealth.toFixed(0)}%</div>
            <Progress value={businessHealth} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {businessHealth >= 70 ? 'Отличное состояние' : 'Требует внимания'}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-revenue" className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Доход</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(totalRevenue, 'RUB')}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Налог 6%: {formatCurrency(taxProvision, 'RUB')}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-expenses" className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Расходы</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(expenses, 'RUB')}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              +Ассистент: {formatCurrency(assistantSalary, 'RUB')}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-net-profit" className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Чистая прибыль</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(netProfit, 'RUB')}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              После всех расходов
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Goal Progress */}
      <Card data-testid="card-monthly-goal" className="hover-elevate border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-primary" />
            Прогресс к месячной цели
          </CardTitle>
          <CardDescription>Цель: {formatCurrency(monthlyGoal, 'RUB')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(totalRevenue, 'RUB')}
            </span>
            <Badge variant={goalProgress >= 100 ? "default" : "outline"} className="text-sm">
              {goalProgress.toFixed(0)}%
            </Badge>
          </div>
          <Progress value={Math.min(goalProgress, 100)} className="h-3" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {goalProgress >= 100 ? 'Цель достигнута! 🎉' : `Осталось: ${formatCurrency(monthlyGoal - totalRevenue, 'RUB')}`}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Cash Flow Summary */}
      <Card data-testid="card-cash-flow" className="hover-elevate">
        <CardHeader>
          <CardTitle>Денежный поток</CardTitle>
          <CardDescription>Детальная разбивка финансовых потоков</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Доход</span>
              <span className="font-semibold text-green-600">
                +{formatCurrency(totalRevenue, 'RUB')}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Расходы</span>
              <span className="font-semibold text-red-600">
                -{formatCurrency(expenses, 'RUB')}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Налог УСН 6%</span>
              <span className="font-semibold text-red-600">
                -{formatCurrency(taxProvision, 'RUB')}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Зарплата ассистента</span>
              <span className="font-semibold text-red-600">
                -{formatCurrency(assistantSalary, 'RUB')}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
              <span className="font-semibold text-foreground">Чистая прибыль</span>
              <span className="font-bold text-primary text-lg">
                {formatCurrency(netProfit, 'RUB')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Withdrawals */}
      <Card data-testid="card-personal-withdrawals" className="hover-elevate">
        <CardHeader>
          <CardTitle>Личные выводы средств</CardTitle>
          <CardDescription>Доступно для личных нужд</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Чистая прибыль</span>
            <span className="font-semibold">{formatCurrency(netProfit, 'RUB')}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Уже выведено</span>
            <span className="font-semibold text-red-600">
              -{formatCurrency(personalWithdrawals, 'RUB')}
            </span>
          </div>
          <div className="flex justify-between items-center p-4 bg-accent/10 rounded-lg border-2 border-accent/20">
            <span className="font-semibold text-foreground">Доступно для вывода</span>
            <span className="font-bold text-accent text-lg">
              {formatCurrency(availableForWithdrawal, 'RUB')}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
