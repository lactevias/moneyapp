import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, DollarSign, FileText, TrendingUp, AlertCircle } from "lucide-react";
import StatCard from "./StatCard";

interface Contract {
  id: string;
  client: string;
  amount: number;
  currency: string;
  status: 'active' | 'pending' | 'completed';
  deadline?: Date;
}

interface BusinessDashboardProps {
  totalRevenue: string;
  taxProvision: string;
  activeContracts: number;
  pendingInvoices: number;
  contracts?: Contract[];
}

export default function BusinessDashboard({
  totalRevenue,
  taxProvision,
  activeContracts,
  pendingInvoices,
  contracts = [],
}: BusinessDashboardProps) {
  const statusColors = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  const statusLabels = {
    active: 'Активный',
    pending: 'Ожидание',
    completed: 'Завершён',
  };

  return (
    <div className="space-y-6" data-testid="business-dashboard">
      {/* Welcome message */}
      <div className="flex items-center gap-2 mb-2">
        <Briefcase className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">
          Бизнес-энергия, Нина
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Выручка"
          value={totalRevenue}
          icon={<DollarSign className="h-4 w-4" />}
          trend="up"
        />
        <StatCard
          title="Резерв на налоги"
          value={taxProvision}
          subtitle="6% от дохода"
          icon={<AlertCircle className="h-4 w-4" />}
        />
        <StatCard
          title="Активные контракты"
          value={activeContracts.toString()}
          icon={<FileText className="h-4 w-4" />}
        />
        <StatCard
          title="Ожидают оплаты"
          value={pendingInvoices.toString()}
          subtitle="Счета на оплату"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      {/* Contracts and Income Streams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Contracts */}
        <Card className="shadow-glow">
          <CardHeader>
            <CardTitle>Текущие контракты</CardTitle>
            <CardDescription>Образовательные проекты</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contracts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Контрактов пока нет
                </p>
              ) : (
                contracts.map((contract) => (
                  <div
                    key={contract.id}
                    data-testid={`contract-${contract.id}`}
                    className="p-3 rounded-lg border border-border hover-elevate"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{contract.client}</h4>
                        {contract.deadline && (
                          <p className="text-xs text-muted-foreground mt-1">
                            До {contract.deadline.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                          </p>
                        )}
                      </div>
                      <Badge className={statusColors[contract.status]}>
                        {statusLabels[contract.status]}
                      </Badge>
                    </div>
                    <div className="text-lg font-bold text-primary">
                      {contract.amount.toFixed(0)} {contract.currency === 'RUB' ? '₽' : contract.currency}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Income Streams */}
        <Card className="shadow-glow">
          <CardHeader>
            <CardTitle>Потоки дохода</CardTitle>
            <CardDescription>Источники энергии</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">Фриланс</span>
                  <span className="text-xs text-muted-foreground">60%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '60%' }} />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">Контракты</span>
                  <span className="text-xs text-muted-foreground">30%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: '30%' }} />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-chart-2/10 border border-chart-2/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">Консультации</span>
                  <span className="text-xs text-muted-foreground">10%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-chart-2 rounded-full" style={{ width: '10%' }} />
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-card border border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Средний чек</span>
                <span className="font-semibold text-foreground">45 000 ₽</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
