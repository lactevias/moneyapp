import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, TrendingDown, AlertCircle } from "lucide-react";
import { PlannedPayment } from "./PaymentCalendar";
import { Budget } from "./BudgetCard";
import { formatCurrency, calculateMultiCurrencyTotal, convertToRUB, convertFromRUB } from "@/lib/currency";

interface UpcomingPaymentsBudgetsProps {
  payments: PlannedPayment[];
  budgets: Budget[];
}

export default function UpcomingPaymentsBudgets({ payments, budgets }: UpcomingPaymentsBudgetsProps) {
  // Get upcoming payments for this month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const upcomingPayments = payments.filter(payment => {
    const paymentDate = new Date(payment.date);
    return paymentDate.getMonth() === currentMonth && 
           paymentDate.getFullYear() === currentYear &&
           paymentDate >= now;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate total upcoming payments (converted to RUB)
  const totalUpcoming = calculateMultiCurrencyTotal(
    upcomingPayments.map(p => ({ amount: p.amount, currency: p.currency }))
  );

  // Group payments by category and calculate budget impact
  const budgetImpact = budgets.map(budget => {
    const budgetCurrency = budget.currency || 'RUB';
    const relatedPayments = upcomingPayments.filter(p => p.category === budget.category);
    
    // Convert all values to RUB for accurate comparison
    const plannedAmountRUB = calculateMultiCurrencyTotal(
      relatedPayments.map(p => ({ amount: p.amount, currency: p.currency }))
    );
    
    // Convert budget spent and limit to RUB for calculations
    const budgetSpentRUB = convertToRUB(budget.spent, budgetCurrency);
    const budgetLimitRUB = convertToRUB(budget.limit, budgetCurrency);
    
    // Calculate projected values in RUB
    const projectedSpentRUB = budgetSpentRUB + plannedAmountRUB;
    const projectedProgress = (projectedSpentRUB / budgetLimitRUB) * 100;
    
    // Convert values back to budget's native currency for display
    const plannedAmountNative = convertFromRUB(plannedAmountRUB, budgetCurrency);
    const projectedSpentNative = convertFromRUB(projectedSpentRUB, budgetCurrency);
    
    return {
      ...budget,
      plannedAmount: plannedAmountNative,
      projectedSpent: projectedSpentNative,
      projectedProgress,
      relatedPayments
    };
  }).filter(b => b.plannedAmount > 0); // Only show budgets with upcoming payments

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Upcoming Payments */}
      <Card className="shadow-glow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Запланированные платежи</CardTitle>
            </div>
            <Badge variant="secondary" className="text-base">
              {formatCurrency(totalUpcoming, 'RUB')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingPayments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Запланированных платежей нет
              </p>
            ) : (
              upcomingPayments.slice(0, 5).map((payment) => (
                <div
                  key={payment.id}
                  data-testid={`upcoming-payment-${payment.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover-elevate"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm text-foreground">
                      {payment.title}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      {new Date(payment.date).toLocaleDateString('ru-RU', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                      <span>•</span>
                      <span>{payment.category}</span>
                    </div>
                  </div>
                  <div className="font-semibold text-sm text-foreground">
                    {formatCurrency(payment.amount, payment.currency)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Budget Impact */}
      <Card className="shadow-glow">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-primary" />
            <CardTitle>Влияние на бюджеты</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetImpact.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Нет запланированных расходов в бюджетах
              </p>
            ) : (
              budgetImpact.map((budget) => {
                const budgetCurrency = budget.currency || 'RUB';
                const isOverBudget = budget.projectedProgress > 100;
                const currentProgress = (budget.spent / budget.limit) * 100;

                return (
                  <div
                    key={budget.id}
                    data-testid={`budget-impact-${budget.id}`}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{budget.category}</span>
                        {isOverBudget && (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        +{formatCurrency(budget.plannedAmount, budgetCurrency)} запланировано
                      </div>
                    </div>
                    
                    <div className="relative">
                      <Progress 
                        value={Math.min(currentProgress, 100)} 
                        className="h-2" 
                      />
                      {/* Overlay showing projected spending */}
                      <div 
                        className={`absolute top-0 left-0 h-2 rounded-full opacity-50 ${
                          isOverBudget ? 'bg-destructive' : 'bg-accent'
                        }`}
                        style={{ width: `${Math.min(budget.projectedProgress, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {formatCurrency(budget.spent, budgetCurrency)} → {formatCurrency(budget.projectedSpent, budgetCurrency)}
                      </span>
                      <span className={isOverBudget ? 'text-destructive font-semibold' : ''}>
                        {budget.projectedProgress.toFixed(0)}% от {formatCurrency(budget.limit, budgetCurrency)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
