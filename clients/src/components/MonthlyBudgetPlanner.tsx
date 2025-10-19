import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calculator,
  TrendingUp,
  Plus,
  Trash2,
  PiggyBank,
  AlertCircle,
  CheckCircle,
  Wallet,
  Calendar,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import type { PlannedPayment } from "@/types";

interface BudgetCategory {
  id: string;
  name: string;
  planned: number;
  spent: number;
  currency: string;
}

interface MonthlyBudgetPlannerProps {
  plannedPayments?: PlannedPayment[];
  onAddPayment?: (payment: Omit<PlannedPayment, 'id'>) => void;
  onDeletePayment?: (id: string) => void;
  onUpdatePayment?: (id: string, updates: Partial<PlannedPayment>) => void;
  currentSpace?: 'personal' | 'business';
}

export default function MonthlyBudgetPlanner({
  plannedPayments = [],
  onAddPayment,
  onDeletePayment,
  onUpdatePayment,
  currentSpace = 'personal',
}: MonthlyBudgetPlannerProps) {
  const [monthlyIncome, setMonthlyIncome] = useState(100000);
  const [categories, setCategories] = useState<BudgetCategory[]>([
    { id: "1", name: "Питание", planned: 25000, spent: 18000, currency: "RUB" },
    { id: "2", name: "Жильё", planned: 30000, spent: 30000, currency: "RUB" },
    { id: "3", name: "Транспорт", planned: 8000, spent: 5500, currency: "RUB" },
    { id: "4", name: "Развлечения", planned: 10000, spent: 7000, currency: "RUB" },
    { id: "5", name: "Здоровье", planned: 5000, spent: 2000, currency: "RUB" },
  ]);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryPlanned, setNewCategoryPlanned] = useState(0);
  const [newCategoryCurrency, setNewCategoryCurrency] = useState("RUB");
  
  // Payment scheduling state
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BudgetCategory | null>(null);
  const [paymentTitle, setPaymentTitle] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentRecurring, setPaymentRecurring] = useState(false);
  const [paymentRecurrencePattern, setPaymentRecurrencePattern] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [paymentEndDate, setPaymentEndDate] = useState("");
  const [paymentIsRequired, setPaymentIsRequired] = useState(true);

  const totalPlanned = categories.reduce((sum, cat) => sum + cat.planned, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const remaining = monthlyIncome - totalSpent;
  const budgetUtilization = totalPlanned > 0 ? Math.min((totalSpent / totalPlanned) * 100, 100) : 0;
  const savingsTarget = monthlyIncome * 0.2; // 20% savings goal
  const actualSavings = remaining;
  const savingsProgress = savingsTarget > 0 ? Math.max(0, Math.min((actualSavings / savingsTarget) * 100, 100)) : 0;

  const addCategory = () => {
    if (!newCategoryName.trim() || newCategoryPlanned <= 0) return;
    
    const newCategory: BudgetCategory = {
      id: Date.now().toString(),
      name: newCategoryName,
      planned: newCategoryPlanned,
      spent: 0,
      currency: newCategoryCurrency,
    };
    
    setCategories([...categories, newCategory]);
    setNewCategoryName("");
    setNewCategoryPlanned(0);
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const updateCategorySpent = (id: string, spent: number) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, spent } : cat
    ));
  };

  const updateCategoryPlanned = (id: string, planned: number) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, planned } : cat
    ));
  };

  const openScheduleDialog = (category: BudgetCategory) => {
    setSelectedCategory(category);
    setPaymentTitle(category.name);
    setPaymentAmount(category.planned);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentRecurring(false);
    setPaymentRecurrencePattern('monthly');
    setPaymentEndDate("");
    setPaymentIsRequired(true);
    setScheduleDialogOpen(true);
  };

  const handleSchedulePayment = () => {
    if (!selectedCategory || !paymentTitle.trim() || paymentAmount <= 0 || !paymentDate || !onAddPayment) return;

    const payment: Omit<PlannedPayment, 'id'> = {
      title: paymentTitle,
      amount: paymentAmount,
      currency: selectedCategory.currency,
      date: new Date(paymentDate),
      category: selectedCategory.name,
      recurring: paymentRecurring,
      recurrencePattern: paymentRecurring ? paymentRecurrencePattern : undefined,
      endDate: paymentRecurring && paymentEndDate ? new Date(paymentEndDate) : undefined,
      isRequired: paymentIsRequired,
      space: currentSpace,
    };

    onAddPayment(payment);
    setScheduleDialogOpen(false);
    setSelectedCategory(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">Планирование месячного бюджета</h2>
          <p className="text-muted-foreground">Контролируйте доходы и расходы</p>
        </div>
      </div>

      {/* Income & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-testid="card-monthly-income" className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Месячный доход</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(Number(e.target.value) || 0)}
              className="text-2xl font-bold h-auto border-0 p-0 focus-visible:ring-0"
              data-testid="input-monthly-income"
            />
            <p className="text-xs text-muted-foreground mt-2">₽ в месяц</p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-spent" className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Всего потрачено</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(totalSpent, 'RUB')}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              План: {formatCurrency(totalPlanned, 'RUB')}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-remaining" className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Остаток</CardTitle>
            {remaining >= 0 ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(remaining, 'RUB')}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {remaining >= 0 ? 'В рамках бюджета' : 'Перерасход!'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Utilization */}
      <Card data-testid="card-budget-utilization" className="hover-elevate">
        <CardHeader>
          <CardTitle>Использование бюджета</CardTitle>
          <CardDescription>Процент израсходованных средств от плана</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <span className="text-2xl font-bold text-foreground">
              {budgetUtilization.toFixed(0)}%
            </span>
            <Badge variant={budgetUtilization > 100 ? "destructive" : "default"}>
              {budgetUtilization > 100 ? 'Превышение' : 'В норме'}
            </Badge>
          </div>
          <Progress value={Math.min(budgetUtilization, 100)} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {totalSpent} ₽ из {totalPlanned} ₽ запланировано
          </p>
        </CardContent>
      </Card>

      {/* Savings Goal */}
      <Card data-testid="card-savings-goal" className="hover-elevate border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-primary" />
            Цель по накоплениям (20% от дохода)
          </CardTitle>
          <CardDescription>Рекомендуется откладывать 20% дохода</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Цель</p>
              <p className="text-lg font-semibold">{formatCurrency(savingsTarget, 'RUB')}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Фактически</p>
              <p className={`text-lg font-semibold ${actualSavings >= savingsTarget ? 'text-green-600' : 'text-yellow-600'}`}>
                {formatCurrency(actualSavings, 'RUB')}
              </p>
            </div>
          </div>
          <Progress value={Math.min(savingsProgress, 100)} className="h-3" />
          <p className="text-xs text-muted-foreground">
            {savingsProgress >= 100 
              ? '🎉 Отлично! Цель по накоплениям достигнута!' 
              : `Еще ${formatCurrency(savingsTarget - actualSavings, 'RUB')} до цели`
            }
          </p>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card data-testid="card-categories" className="hover-elevate">
        <CardHeader>
          <CardTitle>Категории расходов</CardTitle>
          <CardDescription>Планируйте и отслеживайте траты по категориям</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.map((category) => {
            const progress = (category.spent / category.planned) * 100;
            return (
              <div key={category.id} className="space-y-2 p-4 bg-muted rounded-lg" data-testid={`category-${category.id}`}>
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-foreground">{category.name}</h4>
                  <div className="flex gap-2">
                    {onAddPayment && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openScheduleDialog(category)}
                        className="h-8 w-8"
                        data-testid={`button-schedule-payment-${category.id}`}
                        title="Запланировать платёж"
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteCategory(category.id)}
                      className="h-8 w-8"
                      data-testid={`button-delete-category-${category.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Запланировано</Label>
                    <Input
                      type="number"
                      value={category.planned}
                      onChange={(e) => updateCategoryPlanned(category.id, Number(e.target.value) || 0)}
                      className="mt-1"
                      data-testid={`input-planned-${category.id}`}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Потрачено</Label>
                    <Input
                      type="number"
                      value={category.spent}
                      onChange={(e) => updateCategorySpent(category.id, Number(e.target.value) || 0)}
                      className="mt-1"
                      data-testid={`input-spent-${category.id}`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(category.spent, category.currency)} / {formatCurrency(category.planned, category.currency)}
                    </span>
                    <Badge variant={progress > 100 ? "destructive" : "outline"} className="text-xs">
                      {category.planned > 0 ? progress.toFixed(0) : '0'}%
                    </Badge>
                  </div>
                  <Progress value={category.planned > 0 ? Math.min(progress, 100) : 0} className="h-2" />
                </div>
              </div>
            );
          })}

          {/* Add New Category */}
          <div className="space-y-3 p-4 border-2 border-dashed border-primary/20 rounded-lg">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Добавить категорию
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Название</Label>
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Например: Одежда"
                  className="mt-1"
                  data-testid="input-new-category-name"
                />
              </div>
              <div>
                <Label className="text-xs">Запланировано</Label>
                <Input
                  type="number"
                  value={newCategoryPlanned || ""}
                  onChange={(e) => setNewCategoryPlanned(Number(e.target.value) || 0)}
                  placeholder="5000"
                  className="mt-1"
                  data-testid="input-new-category-planned"
                />
              </div>
              <div>
                <Label className="text-xs">Валюта</Label>
                <Select value={newCategoryCurrency} onValueChange={setNewCategoryCurrency}>
                  <SelectTrigger className="mt-1" data-testid="select-new-category-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RUB">RUB ₽</SelectItem>
                    <SelectItem value="USD">USD $</SelectItem>
                    <SelectItem value="EUR">EUR €</SelectItem>
                    <SelectItem value="GEL">GEL ₾</SelectItem>
                    <SelectItem value="KZT">KZT ₸</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={addCategory}
              disabled={!newCategoryName.trim() || newCategoryPlanned <= 0}
              className="w-full"
              data-testid="button-add-category"
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Payment Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent data-testid="dialog-schedule-payment">
          <DialogHeader>
            <DialogTitle>Запланировать платёж</DialogTitle>
            <DialogDescription>
              Создайте запланированный платёж из категории бюджета
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="payment-title">Название платежа</Label>
              <Input
                id="payment-title"
                value={paymentTitle}
                onChange={(e) => setPaymentTitle(e.target.value)}
                placeholder="Например: Аренда квартиры"
                data-testid="input-payment-title"
              />
            </div>
            
            <div>
              <Label htmlFor="payment-amount">Сумма</Label>
              <Input
                id="payment-amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value) || 0)}
                placeholder="5000"
                data-testid="input-payment-amount"
              />
            </div>
            
            <div>
              <Label htmlFor="payment-date">Дата платежа</Label>
              <Input
                id="payment-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                data-testid="input-payment-date"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                id="payment-recurring"
                type="checkbox"
                checked={paymentRecurring}
                onChange={(e) => setPaymentRecurring(e.target.checked)}
                className="h-4 w-4"
                data-testid="checkbox-payment-recurring"
              />
              <Label htmlFor="payment-recurring" className="cursor-pointer">
                Повторяющийся платёж
              </Label>
            </div>
            
            {paymentRecurring && (
              <>
                <div>
                  <Label htmlFor="payment-pattern">Периодичность</Label>
                  <Select value={paymentRecurrencePattern} onValueChange={(value: any) => setPaymentRecurrencePattern(value)}>
                    <SelectTrigger id="payment-pattern" data-testid="select-recurrence-pattern">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Ежедневно</SelectItem>
                      <SelectItem value="weekly">Еженедельно</SelectItem>
                      <SelectItem value="monthly">Ежемесячно</SelectItem>
                      <SelectItem value="yearly">Ежегодно</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="payment-end-date">Дата окончания (опционально)</Label>
                  <Input
                    id="payment-end-date"
                    type="date"
                    value={paymentEndDate}
                    onChange={(e) => setPaymentEndDate(e.target.value)}
                    data-testid="input-payment-end-date"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Оставьте пустым для бессрочной подписки
                  </p>
                </div>
              </>
            )}
            
            <div className="flex items-center space-x-2">
              <input
                id="payment-required"
                type="checkbox"
                checked={paymentIsRequired}
                onChange={(e) => setPaymentIsRequired(e.target.checked)}
                className="h-4 w-4"
                data-testid="checkbox-payment-required"
              />
              <Label htmlFor="payment-required" className="cursor-pointer">
                Обязательный платёж
              </Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setScheduleDialogOpen(false)}
              data-testid="button-cancel-schedule"
            >
              Отмена
            </Button>
            <Button
              onClick={handleSchedulePayment}
              disabled={!paymentTitle.trim() || paymentAmount <= 0 || !paymentDate}
              data-testid="button-confirm-schedule"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Добавить в календарь
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
