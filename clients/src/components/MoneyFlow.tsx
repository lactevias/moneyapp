import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wallet, TrendingUp, Plus, Pencil, Trash2 } from "lucide-react";
import { MoneyTransfer } from "@/types";

interface MoneyFlowProps {
  transfers: MoneyTransfer[];
  onAdd?: () => void;
  onEdit?: (transferId: string) => void;
  onDelete?: (transferId: string) => void;
}

const formatCurrency = (amount: number, currency: string) => {
  const symbols: Record<string, string> = {
    RUB: '₽',
    GEL: '₾',
    USD: '$',
    KZT: '₸',
    USDT: 'USDT',
  };
  
  return `${amount.toFixed(2)} ${symbols[currency] || currency}`;
};

export default function MoneyFlow({ transfers, onAdd, onEdit, onDelete }: MoneyFlowProps) {
  const sortedTransfers = [...transfers].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <Card data-testid="money-flow-tracker" className="shadow-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Движение денег</CardTitle>
            </div>
          </div>
          {onAdd && (
            <Button 
              data-testid="button-add-transfer" 
              variant="outline" 
              size="sm"
              className="gap-2"
              onClick={onAdd}
            >
              <Plus className="h-4 w-4" />
              Добавить перевод
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedTransfers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Переводов пока нет</p>
            </div>
          ) : (
            sortedTransfers.map((transfer) => (
              <div
                key={transfer.id}
                data-testid={`transfer-${transfer.id}`}
                className="relative p-4 rounded-lg border border-primary/30 bg-primary/5 hover-elevate transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="px-3 py-1.5 rounded-md bg-card border border-card-border text-sm font-medium">
                        {transfer.fromAccount}
                      </div>
                      <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 animate-pulse" />
                      <div className="px-3 py-1.5 rounded-md bg-card border border-card-border text-sm font-medium">
                        {transfer.toAccount}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <Badge variant="default" className="text-base px-3 py-1">
                      {formatCurrency(transfer.amount, transfer.currency)}
                    </Badge>
                    {onEdit && (
                      <Button
                        data-testid={`button-edit-transfer-${transfer.id}`}
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onEdit(transfer.id)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        data-testid={`button-delete-transfer-${transfer.id}`}
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => onDelete(transfer.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{transfer.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                  {transfer.description && (
                    <span className="italic">{transfer.description}</span>
                  )}
                </div>

                {/* Energy flow visualization */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-50"></div>
              </div>
            ))
          )}
        </div>

        {transfers.length > 0 && (
          <div className="mt-6 p-4 rounded-lg bg-accent/10 border border-accent/20">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Всего переводов</span>
              <span className="font-semibold text-foreground">{transfers.length}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
