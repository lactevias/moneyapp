import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  currency: string;
  account: string;
  date: Date;
  description?: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onAdd?: () => void;
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

export default function TransactionList({ transactions, onDelete, onEdit, onAdd }: TransactionListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <div>
          <CardTitle>Транзакции</CardTitle>
          <CardDescription>История операций</CardDescription>
        </div>
        {onAdd && (
          <Button
            data-testid="button-add-transaction"
            onClick={onAdd}
            size="sm"
          >
            Добавить
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Транзакций пока нет
            </p>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                data-testid={`transaction-${transaction.id}`}
                className="flex items-center justify-between p-4 rounded-lg border border-card-border hover-elevate"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant={transaction.type === 'income' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {transaction.type === 'income' ? 'Доход' : 'Расход'}
                    </Badge>
                    <span className="font-medium text-foreground">{transaction.category}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {transaction.account} • {transaction.date.toLocaleDateString('ru-RU')}
                  </div>
                  {transaction.description && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {transaction.description}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className={`text-lg font-semibold ${
                    transaction.type === 'income' ? 'text-green-400' : 'text-foreground'
                  }`}>
                    {transaction.type === 'income' && '+'}
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </div>
                  <div className="flex items-center gap-1">
                    {onEdit && (
                      <Button
                        data-testid={`button-edit-transaction-${transaction.id}`}
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(transaction.id)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        data-testid={`button-delete-transaction-${transaction.id}`}
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(transaction.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
