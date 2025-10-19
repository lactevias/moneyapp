import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HandCoins, Plus, Edit2, Trash2, Check } from "lucide-react";
import type { Debt, Space } from "@/types";
import { calculateMultiCurrencyTotal, formatCurrency, groupByCurrency } from "@/lib/currency";

interface DebtTrackerProps {
  debts: Debt[];
  currentSpace: Space;
  onAdd: (debt: Omit<Debt, 'id'>) => void;
  onUpdate: (debt: Debt) => void;
  onDelete: (debtId: string) => void;
}

export default function DebtTracker({ debts, currentSpace, onAdd, onUpdate, onDelete }: DebtTrackerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  
  const [formType, setFormType] = useState<'i_owe' | 'owed_to_me'>('i_owe');
  const [formPerson, setFormPerson] = useState("");
  const [formAmount, setFormAmount] = useState(0);
  const [formCurrency, setFormCurrency] = useState("RUB");
  const [formDescription, setFormDescription] = useState("");
  const [formDueDate, setFormDueDate] = useState("");

  const openAddDialog = () => {
    setEditingDebt(null);
    setFormType('i_owe');
    setFormPerson("");
    setFormAmount(0);
    setFormCurrency("RUB");
    setFormDescription("");
    setFormDueDate("");
    setDialogOpen(true);
  };

  const openEditDialog = (debt: Debt) => {
    setEditingDebt(debt);
    setFormType(debt.type);
    setFormPerson(debt.person);
    setFormAmount(debt.amount);
    setFormCurrency(debt.currency);
    setFormDescription(debt.description || "");
    setFormDueDate(debt.dueDate ? debt.dueDate.toISOString().split('T')[0] : "");
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formPerson.trim() || formAmount <= 0) return;

    const debtData: Omit<Debt, 'id'> = {
      type: formType,
      person: formPerson,
      amount: formAmount,
      currency: formCurrency,
      description: formDescription,
      dueDate: formDueDate ? new Date(formDueDate) : undefined,
      isPaid: false,
      space: editingDebt?.space || currentSpace,
    };

    if (editingDebt) {
      onUpdate({ ...debtData, id: editingDebt.id, isPaid: editingDebt.isPaid });
    } else {
      onAdd(debtData);
    }

    setDialogOpen(false);
  };

  const markAsPaid = (debt: Debt) => {
    onUpdate({ ...debt, isPaid: true });
  };

  const unpaidDebts = debts.filter(d => !d.isPaid);
  const paidDebts = debts.filter(d => d.isPaid);

  // Calculate multi-currency totals
  const iOweData = unpaidDebts
    .filter(d => d.type === 'i_owe')
    .map(d => ({ amount: d.amount, currency: d.currency }));
  const iOweTotal = calculateMultiCurrencyTotal(iOweData);
  const iOweByCurrency = groupByCurrency(iOweData);

  const owedToMeData = unpaidDebts
    .filter(d => d.type === 'owed_to_me')
    .map(d => ({ amount: d.amount, currency: d.currency }));
  const owedToMeTotal = calculateMultiCurrencyTotal(owedToMeData);
  const owedToMeByCurrency = groupByCurrency(owedToMeData);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HandCoins className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Учёт долгов</CardTitle>
              <CardDescription>Отслеживание займов и долгов</CardDescription>
            </div>
          </div>
          <Button
            data-testid="button-add-debt"
            onClick={openAddDialog}
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Добавить
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="text-xs text-muted-foreground mb-1">Я должен</div>
              <div className="text-lg font-semibold text-destructive mb-1">
                {formatCurrency(iOweTotal, 'RUB')}
              </div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(iOweByCurrency).map(([currency, amount]) => (
                  <Badge key={currency} variant="secondary" className="text-xs">
                    {formatCurrency(amount, currency)}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="text-xs text-muted-foreground mb-1">Мне должны</div>
              <div className="text-lg font-semibold text-green-600 dark:text-green-400 mb-1">
                {formatCurrency(owedToMeTotal, 'RUB')}
              </div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(owedToMeByCurrency).map(([currency, amount]) => (
                  <Badge key={currency} variant="secondary" className="text-xs">
                    {formatCurrency(amount, currency)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Unpaid debts */}
          {unpaidDebts.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Активные долги</h4>
              {unpaidDebts.map((debt) => (
                <div
                  key={debt.id}
                  data-testid={`debt-item-${debt.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover-elevate"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-medium text-sm">{debt.person}</div>
                      <Badge variant={debt.type === 'i_owe' ? 'destructive' : 'default'} className="text-xs">
                        {debt.type === 'i_owe' ? 'Я должен' : 'Мне должны'}
                      </Badge>
                    </div>
                    {debt.description && (
                      <div className="text-xs text-muted-foreground">{debt.description}</div>
                    )}
                    {debt.dueDate && (
                      <div className="text-xs text-muted-foreground">
                        Срок: {debt.dueDate.toLocaleDateString('ru-RU')}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold">{formatCurrency(debt.amount, debt.currency)}</div>
                    <Button
                      data-testid={`button-mark-paid-${debt.id}`}
                      variant="ghost"
                      size="icon"
                      onClick={() => markAsPaid(debt)}
                      title="Отметить как оплаченное"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      data-testid={`button-edit-debt-${debt.id}`}
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(debt)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      data-testid={`button-delete-debt-${debt.id}`}
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(debt.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <HandCoins className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Нет активных долгов</p>
            </div>
          )}

          {/* Paid debts */}
          {paidDebts.length > 0 && (
            <div className="space-y-2 border-t border-border pt-4">
              <h4 className="text-sm font-semibold text-muted-foreground">Погашенные</h4>
              {paidDebts.map((debt) => (
                <div
                  key={debt.id}
                  data-testid={`debt-paid-${debt.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-border opacity-60"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-medium text-sm line-through">{debt.person}</div>
                      <Badge variant="secondary" className="text-xs">
                        Погашено
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm line-through">{formatCurrency(debt.amount, debt.currency)}</div>
                    <Button
                      data-testid={`button-delete-paid-debt-${debt.id}`}
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(debt.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-testid="dialog-debt-form">
          <DialogHeader>
            <DialogTitle>{editingDebt ? 'Редактировать долг' : 'Добавить долг'}</DialogTitle>
            <DialogDescription>
              Заполните информацию о долге
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="debt-type">Тип долга</Label>
              <Select value={formType} onValueChange={(value: 'i_owe' | 'owed_to_me') => setFormType(value)}>
                <SelectTrigger id="debt-type" data-testid="select-debt-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="i_owe">Я должен</SelectItem>
                  <SelectItem value="owed_to_me">Мне должны</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="debt-person">Кому / От кого</Label>
              <Input
                id="debt-person"
                data-testid="input-debt-person"
                value={formPerson}
                onChange={(e) => setFormPerson(e.target.value)}
                placeholder="Имя человека"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="debt-amount">Сумма</Label>
                <Input
                  id="debt-amount"
                  data-testid="input-debt-amount"
                  type="number"
                  value={formAmount}
                  onChange={(e) => setFormAmount(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="debt-currency">Валюта</Label>
                <Select value={formCurrency} onValueChange={setFormCurrency}>
                  <SelectTrigger id="debt-currency" data-testid="select-debt-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RUB">RUB ₽</SelectItem>
                    <SelectItem value="GEL">GEL ₾</SelectItem>
                    <SelectItem value="USD">USD $</SelectItem>
                    <SelectItem value="KZT">KZT ₸</SelectItem>
                    <SelectItem value="USDT">USDT ₮</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="debt-due-date">Срок возврата (необязательно)</Label>
              <Input
                id="debt-due-date"
                data-testid="input-debt-due-date"
                type="date"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="debt-description">Описание (необязательно)</Label>
              <Textarea
                id="debt-description"
                data-testid="input-debt-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Детали о долге"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-testid="button-cancel-debt"
            >
              Отмена
            </Button>
            <Button
              onClick={handleSave}
              data-testid="button-save-debt"
            >
              {editingDebt ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
