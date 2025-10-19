import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Target, TrendingUp, Plus } from "lucide-react";
import { Account } from "./AccountCard";
import { Goal } from "./GoalCard";

interface EnhancedSavingsProps {
  savingsAccounts: Account[];
  goals: Goal[];
  regularAccounts: Account[];
  onReplenish?: (goalId: string, amount: number, fromAccountId: string) => void;
}

const formatCurrency = (amount: number, currency: string = 'RUB') => {
  const symbols: Record<string, string> = {
    RUB: '₽',
    GEL: '₾',
    USD: '$',
    KZT: '₸',
  };
  return `${amount.toFixed(0)} ${symbols[currency] || currency}`;
};

export default function EnhancedSavings({ 
  savingsAccounts, 
  goals, 
  regularAccounts,
  onReplenish 
}: EnhancedSavingsProps) {
  const [selectedGoal, setSelectedGoal] = useState<string>("");
  const [replenishAmount, setReplenishAmount] = useState<string>("");
  const [fromAccount, setFromAccount] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const totalSavings = savingsAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalGoalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalGoalCurrent = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const overallProgress = totalGoalTarget > 0 ? (totalGoalCurrent / totalGoalTarget) * 100 : 0;

  const handleReplenish = () => {
    if (selectedGoal && replenishAmount && fromAccount && onReplenish) {
      onReplenish(selectedGoal, parseFloat(replenishAmount), fromAccount);
      setIsDialogOpen(false);
      setReplenishAmount("");
      setSelectedGoal("");
      setFromAccount("");
    }
  };

  return (
    <div className="space-y-6" data-testid="enhanced-savings">
      {/* Header with energy theme */}
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">
          Накопление энергии
        </h2>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-glow bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">На счетах</div>
            <div className="text-3xl font-bold text-primary">{formatCurrency(totalSavings)}</div>
          </CardContent>
        </Card>

        <Card className="shadow-glow bg-gradient-to-br from-accent/10 to-transparent border-accent/30">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">В целях</div>
            <div className="text-3xl font-bold text-accent">{formatCurrency(totalGoalCurrent)}</div>
          </CardContent>
        </Card>

        <Card className="shadow-glow bg-gradient-to-br from-chart-2/10 to-transparent border-chart-2/30">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Общий прогресс</div>
            <div className="text-3xl font-bold text-chart-2">{overallProgress.toFixed(0)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Accounts */}
      <Card className="shadow-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Накопительные счета
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savingsAccounts.map((account) => (
              <div
                key={account.id}
                data-testid={`savings-account-${account.id}`}
                className="p-4 rounded-lg border border-primary/30 bg-primary/5 hover-elevate"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-foreground">{account.name}</h4>
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    {account.currency}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(account.balance, account.currency)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Goals with Replenishment */}
      <Card className="shadow-glow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Финансовые цели</CardTitle>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-replenish-goal" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Пополнить
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Пополнить цель</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Цель</label>
                    <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                      <SelectTrigger data-testid="select-goal">
                        <SelectValue placeholder="Выберите цель" />
                      </SelectTrigger>
                      <SelectContent>
                        {goals.map((goal) => (
                          <SelectItem key={goal.id} value={goal.id}>
                            {goal.name} - {formatCurrency(goal.currentAmount, goal.currency)} / {formatCurrency(goal.targetAmount, goal.currency)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Сумма</label>
                    <Input
                      data-testid="input-replenish-amount"
                      type="number"
                      placeholder="10000"
                      value={replenishAmount}
                      onChange={(e) => setReplenishAmount(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Со счёта</label>
                    <Select value={fromAccount} onValueChange={setFromAccount}>
                      <SelectTrigger data-testid="select-from-account">
                        <SelectValue placeholder="Выберите счёт" />
                      </SelectTrigger>
                      <SelectContent>
                        {regularAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name} - {formatCurrency(account.balance, account.currency)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    data-testid="button-confirm-replenish"
                    onClick={handleReplenish}
                    disabled={!selectedGoal || !replenishAmount || !fromAccount}
                  >
                    Подтвердить
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {goals.map((goal) => {
              const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              const remaining = goal.targetAmount - goal.currentAmount;

              return (
                <div
                  key={goal.id}
                  data-testid={`enhanced-goal-${goal.id}`}
                  className="p-4 rounded-lg border border-accent/30 bg-accent/5 hover-elevate"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-lg text-foreground">{goal.name}</h4>
                    <Badge variant="default" className="text-base">
                      {progress.toFixed(1)}%
                    </Badge>
                  </div>

                  <Progress value={progress} className="h-3 mb-3" />

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">Накоплено</div>
                      <div className="font-semibold text-foreground">
                        {formatCurrency(goal.currentAmount, goal.currency)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Осталось</div>
                      <div className="font-semibold text-accent">
                        {formatCurrency(remaining, goal.currency)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
