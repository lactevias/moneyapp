import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Pencil, Trash2, Wallet, History } from "lucide-react";
import AccountTransactions from "./AccountTransactions";
import type { Transaction } from "@/types";

export interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
  type: 'regular' | 'crypto' | 'savings';
}

interface AccountCardProps {
  account: Account;
  transactions?: Transaction[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
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

const typeLabels = {
  regular: 'Обычный',
  crypto: 'Криптовалюта',
  savings: 'Накопительный',
};

export default function AccountCard({ account, transactions = [], onEdit, onDelete }: AccountCardProps) {
  const [showTransactions, setShowTransactions] = useState(false);

  return (
    <>
      <Card data-testid={`account-card-${account.id}`} className="hover-elevate">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold">{account.name}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {transactions && transactions.length > 0 && (
              <Button
                data-testid={`button-view-transactions-${account.id}`}
                variant="ghost"
                size="icon"
                onClick={() => setShowTransactions(true)}
                className="h-8 w-8"
                title="Посмотреть транзакции"
              >
                <History className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button
                data-testid={`button-edit-account-${account.id}`}
                variant="ghost"
                size="icon"
                onClick={() => onEdit(account.id)}
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                data-testid={`button-delete-account-${account.id}`}
                variant="ghost"
                size="icon"
                onClick={() => onDelete(account.id)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground mb-2">
            {formatCurrency(account.balance, account.currency)}
          </div>
          <Badge variant="secondary" className="text-xs">
            {typeLabels[account.type]}
          </Badge>
        </CardContent>
      </Card>

      {/* Transactions Dialog */}
      <Dialog open={showTransactions} onOpenChange={setShowTransactions}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid={`dialog-account-transactions-${account.id}`}>
          <AccountTransactions
            accountName={account.name}
            accountCurrency={account.currency}
            transactions={transactions}
            onClose={() => setShowTransactions(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
