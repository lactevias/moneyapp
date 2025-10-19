import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target, Trash2 } from "lucide-react";

export interface Goal {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  currency?: string;
}

interface GoalCardProps {
  goal: Goal;
  onDelete?: (id: string) => void;
  onAddFunds?: (id: string) => void;
}

const formatCurrency = (amount: number, currency: string = 'RUB') => {
  if (currency === 'USDT') {
    return `${amount.toFixed(2)} USDT`;
  }
  try {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'RUB' ? 0 : 2,
      maximumFractionDigits: currency === 'RUB' ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
};

export default function GoalCard({ goal, onDelete, onAddFunds }: GoalCardProps) {
  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const remaining = goal.targetAmount - goal.currentAmount;

  return (
    <Card data-testid={`goal-card-${goal.id}`} className="hover-elevate">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-semibold">{goal.name}</CardTitle>
        </div>
        {onDelete && (
          <Button
            data-testid={`button-delete-goal-${goal.id}`}
            variant="ghost"
            size="icon"
            onClick={() => onDelete(goal.id)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Накоплено:</span>
          <span className="font-semibold text-foreground">
            {formatCurrency(goal.currentAmount, goal.currency)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Цель:</span>
          <span className="font-semibold text-foreground">
            {formatCurrency(goal.targetAmount, goal.currency)}
          </span>
        </div>
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs">
            <span className="text-primary font-medium">{progress.toFixed(1)}%</span>
            <span className="text-muted-foreground">
              Осталось: {formatCurrency(remaining, goal.currency)}
            </span>
          </div>
        </div>
        {onAddFunds && (
          <Button
            data-testid={`button-add-funds-${goal.id}`}
            onClick={() => onAddFunds(goal.id)}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Пополнить
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
