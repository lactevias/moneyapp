import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, AlertCircle } from "lucide-react";
import type { PlannedPayment } from "@/types";
import { calculateMultiCurrencyTotal } from "@/lib/currency";

interface FreeFundsWidgetProps {
  totalBalance: number;
  plannedPayments: PlannedPayment[];
}

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

export default function FreeFundsWidget({ totalBalance, plannedPayments }: FreeFundsWidgetProps) {
  const analysis = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Get upcoming required payments
    const upcomingRequired = plannedPayments
      .filter(p => p.isRequired && p.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Calculate total of upcoming required payments (converted to RUB)
    const requiredPaymentsData = upcomingRequired.map(p => ({
      amount: p.amount,
      currency: p.currency
    }));
    const totalRequired = calculateMultiCurrencyTotal(requiredPaymentsData);
    
    // Free funds = total balance - required payments
    const freeFunds = totalBalance - totalRequired;
    
    // Find nearest required payment
    const nearestPayment = upcomingRequired[0];
    
    // Days until nearest payment
    const daysUntilNearest = nearestPayment 
      ? Math.ceil((nearestPayment.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : null;
    
    return {
      freeFunds,
      totalRequired,
      requiredPaymentsCount: upcomingRequired.length,
      nearestPayment,
      daysUntilNearest,
      isLow: freeFunds < totalRequired * 0.2, // Less than 20% buffer
      isNegative: freeFunds < 0
    };
  }, [totalBalance, plannedPayments]);

  return (
    <Card data-testid="free-funds-widget">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Свободные средства</CardTitle>
              <CardDescription>Доступно до обязательных платежей</CardDescription>
            </div>
          </div>
          {analysis.isNegative && (
            <AlertCircle className="h-5 w-5 text-destructive" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Free Funds Amount */}
        <div className={`p-4 rounded-lg border ${
          analysis.isNegative 
            ? 'bg-destructive/10 border-destructive/20' 
            : analysis.isLow 
              ? 'bg-yellow-500/10 border-yellow-500/20' 
              : 'bg-green-500/10 border-green-500/20'
        }`}>
          <div className="text-xs text-muted-foreground mb-1">Свободно</div>
          <div className={`text-2xl font-bold ${
            analysis.isNegative 
              ? 'text-destructive' 
              : analysis.isLow 
                ? 'text-yellow-600 dark:text-yellow-400' 
                : 'text-green-600 dark:text-green-400'
          }`}>
            {formatCurrency(analysis.freeFunds)}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Всего средств</span>
            <span className="font-medium">{formatCurrency(totalBalance)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Обязательных платежей</span>
            <span className="font-medium text-destructive">-{formatCurrency(analysis.totalRequired)}</span>
          </div>
          {analysis.requiredPaymentsCount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Ближайшие платежи</span>
              <Badge variant="outline">
                {analysis.requiredPaymentsCount} шт.
              </Badge>
            </div>
          )}
        </div>

        {/* Nearest Payment */}
        {analysis.nearestPayment && (
          <div className="border-t border-border pt-3">
            <div className="text-xs text-muted-foreground mb-1">Ближайший обязательный платёж</div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-sm">{analysis.nearestPayment.title}</div>
                <div className="text-xs text-muted-foreground">
                  {analysis.nearestPayment.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                  {analysis.daysUntilNearest !== null && (
                    <span> • через {analysis.daysUntilNearest} {analysis.daysUntilNearest === 1 ? 'день' : 'дней'}</span>
                  )}
                </div>
              </div>
              <div className="text-sm font-semibold">
                {formatCurrency(analysis.nearestPayment.amount, analysis.nearestPayment.currency)}
              </div>
            </div>
          </div>
        )}

        {/* Warning Message */}
        {analysis.isNegative && (
          <div className="text-xs text-destructive">
            ⚠️ Недостаточно средств для покрытия обязательных платежей
          </div>
        )}
        {analysis.isLow && !analysis.isNegative && (
          <div className="text-xs text-yellow-600 dark:text-yellow-400">
            ⚡ Низкий запас свободных средств
          </div>
        )}
      </CardContent>
    </Card>
  );
}
