import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingDown, Trash2 } from "lucide-react";

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  currency?: string;
  period?: string;
}

interface BudgetCardProps {
  budget: Budget;
  onDelete?: (id: string) => void;
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

export default function BudgetCard({ budget, onDelete }: BudgetCardProps) {
  const progress = Math.min((budget.spent / budget.limit) * 100, 100);
  const remaining = budget.limit - budget.spent;
  const isOverBudget = budget.spent > budget.limit;

  return (
    <Card data-testid={`budget-card-${budget.id}`} className={`hover-elevate ${isOverBudget ? 'border-destructive' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-semibold">{budget.category}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {budget.period && (
            <Badge variant="outline" className="text-xs">
              {budget.period}
            </Badge>
          )}
          {onDelete && (
            <Button
              data-testid={`button-delete-budget-${budget.id}`}
              variant="ghost"
              size="icon"
              onClick={() => onDelete(budget.id)}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Потрачено:</span>
          <span className={`font-semibold ${isOverBudget ? 'text-destructive' : 'text-foreground'}`}>
            {formatCurrency(budget.spent, budget.currency)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Лимит:</span>
          <span className="font-semibold text-foreground">
            {formatCurrency(budget.limit, budget.currency)}
          </span>
        </div>
        <div className="space-y-2">
          <Progress 
            value={progress} 
            className={`h-2 ${isOverBudget ? '[&>div]:bg-destructive' : ''}`}
          />
          <div className="flex justify-between text-xs">
            <span className={`font-medium ${isOverBudget ? 'text-destructive' : 'text-primary'}`}>
              {progress.toFixed(1)}%
            </span>
            <span className={isOverBudget ? 'text-destructive' : 'text-muted-foreground'}>
              {isOverBudget ? 'Превышен на ' : 'Осталось: '}
              {formatCurrency(Math.abs(remaining), budget.currency)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
