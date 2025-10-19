import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle, ArrowDownCircle, Calendar } from "lucide-react";
import type { Transaction } from "@/types";

interface AccountTransactionsProps {
  accountName: string;
  accountCurrency: string;
  transactions: Transaction[];
  onClose?: () => void;
}

const formatCurrency = (amount: number, currency: string) => {
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

export default function AccountTransactions({ 
  accountName, 
  accountCurrency,
  transactions,
  onClose 
}: AccountTransactionsProps) {
  // Filter and sort transactions for this account
  const accountTransactions = transactions
    .filter(t => t.account === accountName)
    .sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateB.getTime() - dateA.getTime(); // Newest first
    });

  // Calculate totals
  const totalIncome = accountTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = accountTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <Card data-testid="account-transactions-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Транзакции: {accountName}</CardTitle>
            <CardDescription>
              {accountTransactions.length} {accountTransactions.length === 1 ? 'транзакция' : 'транзакций'}
            </CardDescription>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              onClick={onClose}
              data-testid="button-close-account-transactions"
            >
              Закрыть
            </Button>
          )}
        </div>
        
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <ArrowUpCircle className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-xs text-muted-foreground">Доходы</p>
              <p className="text-sm font-semibold text-green-400">
                {formatCurrency(totalIncome, accountCurrency)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <ArrowDownCircle className="h-5 w-5 text-red-400" />
            <div>
              <p className="text-xs text-muted-foreground">Расходы</p>
              <p className="text-sm font-semibold text-red-400">
                {formatCurrency(totalExpense, accountCurrency)}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {accountTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Транзакций по этому счёту пока нет</p>
          </div>
        ) : (
          <div className="space-y-2">
            {accountTransactions.map((transaction) => {
              const displayDate = transaction.date instanceof Date 
                ? transaction.date 
                : new Date(transaction.date);
              
              return (
                <div
                  key={transaction.id}
                  data-testid={`account-transaction-${transaction.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-card-border hover-elevate"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={transaction.type === 'income' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {transaction.type === 'income' ? 'Доход' : 'Расход'}
                      </Badge>
                      <span className="font-medium text-foreground">
                        {transaction.category}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {displayDate.toLocaleDateString('ru-RU', { 
                        day: 'numeric', 
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                    {transaction.description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {transaction.description}
                      </div>
                    )}
                  </div>
                  
                  <div className={`text-lg font-semibold ${
                    transaction.type === 'income' ? 'text-green-400' : 'text-foreground'
                  }`}>
                    {transaction.type === 'income' && '+'}
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
