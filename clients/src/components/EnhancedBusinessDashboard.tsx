import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calculator,
  Target,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Wallet,
  ArrowUpRight,
  Lightbulb,
  Euro,
  Edit,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Pencil,
  UserCheck,
  CreditCard,
  Calendar,
  Clock,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface BusinessMetrics {
  totalRevenue: number;
  expenses: number;
  taxProvision: number;
  assistantSalary: number;
  personalWithdrawals: number;
  netProfit: number;
}

interface ServiceGoal {
  serviceName: string;
  pricePerUnit: number;
  currentUnits: number;
  targetUnits: number;
}

interface Service {
  name: string;
  priceMin: number;
  priceMax?: number;
  unit: string;
}

const services: Service[] = [
  { name: "Консультационная работа", priceMin: 100, unit: "€" },
  { name: "Исследование аудитории и конкурентов под ключ", priceMin: 700, priceMax: 800, unit: "€" },
  { name: "Разработка программы курса высокого уровня", priceMin: 850, unit: "€" },
  { name: "Разработка программы курса без продакшена", priceMin: 1200, unit: "€" },
  { name: "Разработка программы курса с продакшеном", priceMin: 2000, unit: "€" },
  { name: "Разработка внутреннего контента курса", priceMin: 800, unit: "€" },
  { name: "Методическое сопровождение курса", priceMin: 800, unit: "€/месяц" },
  { name: "Работа со спикерами", priceMin: 60, unit: "€/спикер" },
  { name: "Аудит курса/программы", priceMin: 300, unit: "€" },
  { name: "Аудит практических заданий", priceMin: 200, unit: "€" },
];

const businessTips = [
  {
    title: "Пакетное предложение",
    description: "Объедините аудит + разработку программы в один пакет со скидкой 10-15%. Клиенты часто нуждаются в комплексном решении.",
  },
  {
    title: "Абонементное обслуживание",
    description: "Предложите месячный абонемент на методическое сопровождение + консультации. Стабильный доход и долгосрочные отношения.",
  },
  {
    title: "VIP-пакет с продакшеном",
    description: "Создайте премиум-пакет 'под ключ': исследование + программа + продакшен + 3 месяца поддержки. Цена от 4000€.",
  },
  {
    title: "Мини-аудит как входная точка",
    description: "Предложите экспресс-аудит за 150€ для новых клиентов. Затем upsell на полный аудит и разработку.",
  },
  {
    title: "Корпоративные программы",
    description: "Адаптируйте услуги для корпоративных клиентов. Цены можно увеличить на 30-50% для B2B сегмента.",
  },
];

interface GapAnalysisService {
  name: string;
  priceEUR: number;
  priceRUB: number;
  quantity: number;
}

interface ContractorPayment {
  id: string;
  contractorName: string;
  description: string;
  amount: number;
  currency: 'RUB' | 'EUR' | 'USD' | 'GEL' | 'KZT';
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: string;
}

export default function EnhancedBusinessDashboard() {
  const [assistantSalary, setAssistantSalary] = useState(45000);
  const [monthlyGoal, setMonthlyGoal] = useState(300000);
  
  // EUR to RUB exchange rate
  const EUR_TO_RUB = 100;
  
  // Gap Analysis: Convert services from EUR to RUB
  const [gapServices, setGapServices] = useState<GapAnalysisService[]>([
    { name: "Консультационная работа", priceEUR: 100, priceRUB: 100 * EUR_TO_RUB, quantity: 0 },
    { name: "Исследование аудитории и конкурентов", priceEUR: 750, priceRUB: 750 * EUR_TO_RUB, quantity: 0 },
    { name: "Разработка программы курса высокого уровня", priceEUR: 850, priceRUB: 850 * EUR_TO_RUB, quantity: 0 },
    { name: "Разработка программы без продакшена", priceEUR: 1200, priceRUB: 1200 * EUR_TO_RUB, quantity: 0 },
    { name: "Разработка программы с продакшеном", priceEUR: 2000, priceRUB: 2000 * EUR_TO_RUB, quantity: 0 },
    { name: "Разработка внутреннего контента", priceEUR: 800, priceRUB: 800 * EUR_TO_RUB, quantity: 0 },
    { name: "Методическое сопровождение (месяц)", priceEUR: 800, priceRUB: 800 * EUR_TO_RUB, quantity: 0 },
    { name: "Работа со спикерами", priceEUR: 60, priceRUB: 60 * EUR_TO_RUB, quantity: 0 },
    { name: "Аудит курса/программы", priceEUR: 300, priceRUB: 300 * EUR_TO_RUB, quantity: 0 },
    { name: "Аудит практических заданий", priceEUR: 200, priceRUB: 200 * EUR_TO_RUB, quantity: 0 },
  ]);

  // Service edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);
  const [editServiceName, setEditServiceName] = useState("");
  const [editServicePrice, setEditServicePrice] = useState(0);
  
  // Editable service goals
  const [serviceGoals, setServiceGoals] = useState<ServiceGoal[]>([
    {
      serviceName: "Образовательные консультации",
      pricePerUnit: 5000,
      currentUnits: 20,
      targetUnits: 30,
    },
    {
      serviceName: "Групповые курсы",
      pricePerUnit: 15000,
      currentUnits: 4,
      targetUnits: 6,
    },
    {
      serviceName: "Индивидуальные программы",
      pricePerUnit: 30000,
      currentUnits: 1,
      targetUnits: 2,
    },
  ]);

  // Contractor payments state
  const [contractorPayments, setContractorPayments] = useState<ContractorPayment[]>([
    {
      id: '1',
      contractorName: 'Мария Иванова',
      description: 'Дизайн курса',
      amount: 25000,
      currency: 'RUB',
      dueDate: '2025-10-25',
      status: 'pending',
    },
    {
      id: '2',
      contractorName: 'Алексей Петров',
      description: 'Видеомонтаж',
      amount: 500,
      currency: 'EUR',
      dueDate: '2025-10-20',
      status: 'pending',
    },
  ]);

  // Contractor payment dialog state
  const [contractorDialogOpen, setContractorDialogOpen] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    contractorName: '',
    description: '',
    amount: 0,
    currency: 'RUB' as 'RUB' | 'EUR' | 'USD' | 'GEL' | 'KZT',
    dueDate: '',
  });

  // Helper functions
  const calculateTax = (amount: number) => amount * 0.06;

  // Calculate metrics based on current inputs
  const totalRevenue = 250000;
  const expenses = 85000;
  const taxProvision = calculateTax(totalRevenue);
  const personalWithdrawals = 80000;
  
  const metrics: BusinessMetrics = {
    totalRevenue,
    expenses,
    taxProvision,
    assistantSalary,
    personalWithdrawals,
    netProfit: totalRevenue - expenses - taxProvision - assistantSalary,
  };

  const availableForWithdrawal = Math.max(0, metrics.netProfit - personalWithdrawals);
  const businessHealth = ((metrics.totalRevenue - metrics.expenses) / metrics.totalRevenue) * 100;

  const currentProjectedRevenue = serviceGoals.reduce(
    (sum, service) => sum + service.pricePerUnit * service.currentUnits,
    0
  );

  const targetProjectedRevenue = serviceGoals.reduce(
    (sum, service) => sum + service.pricePerUnit * service.targetUnits,
    0
  );

  const goalProgress = (currentProjectedRevenue / monthlyGoal) * 100;

  const updateServiceGoal = (index: number, field: 'currentUnits' | 'targetUnits', value: number) => {
    const updated = [...serviceGoals];
    updated[index] = { ...updated[index], [field]: value };
    setServiceGoals(updated);
  };

  // Gap Analysis functions
  const updateGapService = (index: number, quantity: number) => {
    const updated = [...gapServices];
    updated[index] = { ...updated[index], quantity: Math.max(0, quantity) };
    setGapServices(updated);
  };

  const gapAnalysisTotal = gapServices.reduce(
    (sum, service) => sum + service.priceRUB * service.quantity,
    0
  );

  const remainingGap = Math.max(0, monthlyGoal - currentProjectedRevenue - gapAnalysisTotal);
  const gapAnalysisProgress = ((currentProjectedRevenue + gapAnalysisTotal) / monthlyGoal) * 100;

  const clearGapAnalysis = () => {
    setGapServices(gapServices.map(s => ({ ...s, quantity: 0 })));
  };

  // Service management functions
  const openEditDialog = (index: number) => {
    setEditingServiceIndex(index);
    setEditServiceName(gapServices[index].name);
    setEditServicePrice(gapServices[index].priceEUR);
    setEditDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingServiceIndex(null);
    setEditServiceName("");
    setEditServicePrice(0);
    setEditDialogOpen(true);
  };

  const handleSaveService = () => {
    if (!editServiceName.trim() || editServicePrice <= 0) return;

    if (editingServiceIndex !== null) {
      // Edit existing service
      const updated = [...gapServices];
      updated[editingServiceIndex] = {
        ...updated[editingServiceIndex],
        name: editServiceName,
        priceEUR: editServicePrice,
        priceRUB: editServicePrice * EUR_TO_RUB,
      };
      setGapServices(updated);
    } else {
      // Add new service
      setGapServices([
        ...gapServices,
        {
          name: editServiceName,
          priceEUR: editServicePrice,
          priceRUB: editServicePrice * EUR_TO_RUB,
          quantity: 0,
        },
      ]);
    }

    setEditDialogOpen(false);
  };

  const deleteService = (index: number) => {
    setGapServices(gapServices.filter((_, i) => i !== index));
  };

  // Contractor payment management functions
  const openContractorDialog = (paymentId?: string) => {
    if (paymentId) {
      const payment = contractorPayments.find(p => p.id === paymentId);
      if (payment) {
        setEditingPaymentId(paymentId);
        setPaymentForm({
          contractorName: payment.contractorName,
          description: payment.description,
          amount: payment.amount,
          currency: payment.currency,
          dueDate: payment.dueDate,
        });
      }
    } else {
      setEditingPaymentId(null);
      setPaymentForm({
        contractorName: '',
        description: '',
        amount: 0,
        currency: 'RUB',
        dueDate: '',
      });
    }
    setContractorDialogOpen(true);
  };

  const handleSaveContractorPayment = () => {
    if (!paymentForm.contractorName.trim() || !paymentForm.description.trim() || paymentForm.amount <= 0 || !paymentForm.dueDate) {
      return;
    }

    if (editingPaymentId) {
      setContractorPayments(contractorPayments.map(p =>
        p.id === editingPaymentId
          ? {
              ...p,
              contractorName: paymentForm.contractorName,
              description: paymentForm.description,
              amount: paymentForm.amount,
              currency: paymentForm.currency,
              dueDate: paymentForm.dueDate,
            }
          : p
      ));
    } else {
      const newPayment: ContractorPayment = {
        id: Date.now().toString(),
        contractorName: paymentForm.contractorName,
        description: paymentForm.description,
        amount: paymentForm.amount,
        currency: paymentForm.currency,
        dueDate: paymentForm.dueDate,
        status: 'pending',
      };
      setContractorPayments([...contractorPayments, newPayment]);
    }

    setContractorDialogOpen(false);
  };

  const deleteContractorPayment = (paymentId: string) => {
    setContractorPayments(contractorPayments.filter(p => p.id !== paymentId));
  };

  const markPaymentAsPaid = (paymentId: string) => {
    setContractorPayments(contractorPayments.map(p =>
      p.id === paymentId
        ? { ...p, status: 'paid' as const, paidDate: new Date().toISOString().split('T')[0] }
        : p
    ));
  };

  const getPaymentStatus = (payment: ContractorPayment) => {
    if (payment.status === 'paid') return 'paid';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(payment.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today ? 'overdue' : 'pending';
  };

  const pendingPayments = contractorPayments.filter(p => getPaymentStatus(p) !== 'paid');
  const overduePayments = contractorPayments.filter(p => getPaymentStatus(p) === 'overdue');

  return (
    <div className="space-y-6" data-testid="enhanced-business-dashboard">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-3xl font-bold text-foreground">Бизнес-аналитика</h2>
          <p className="text-muted-foreground">Управление энергией предпринимательства</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-business-health" className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Здоровье бизнеса
            </CardTitle>
            {businessHealth >= 70 ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{businessHealth.toFixed(0)}%</div>
            <Progress value={businessHealth} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {businessHealth >= 70 ? 'Отличное состояние' : 'Требует внимания'}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-revenue" className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Доход</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(metrics.totalRevenue, 'RUB')}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Налог 6%: {formatCurrency(metrics.taxProvision, 'RUB')}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-expenses" className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Расходы</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(metrics.expenses, 'RUB')}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              +Ассистент: {formatCurrency(metrics.assistantSalary, 'RUB')}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-net-profit" className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Чистая прибыль
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(metrics.netProfit, 'RUB')}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              После налогов и зарплат
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Details */}
      <Card data-testid="card-cash-flow" className="hover-elevate">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Денежный поток
          </CardTitle>
          <CardDescription>Детальная разбивка финансовых потоков</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Доход</span>
              <span className="font-semibold text-green-600">
                +{formatCurrency(metrics.totalRevenue, 'RUB')}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Расходы</span>
              <span className="font-semibold text-red-600">
                -{formatCurrency(metrics.expenses, 'RUB')}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Налог УСН 6%</span>
              <span className="font-semibold text-red-600">
                -{formatCurrency(metrics.taxProvision, 'RUB')}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Зарплата ассистента</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={assistantSalary}
                  onChange={(e) => setAssistantSalary(Number(e.target.value) || 0)}
                  className="w-32 h-8 text-right"
                  data-testid="input-assistant-salary"
                />
                <span className="text-sm text-muted-foreground">₽</span>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border-2 border-primary/20">
              <span className="font-semibold text-foreground">Чистая прибыль</span>
              <span className="font-bold text-primary text-lg">
                {formatCurrency(metrics.netProfit, 'RUB')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Withdrawals */}
      <Card data-testid="card-withdrawals" className="hover-elevate">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5" />
            Личные изъятия
          </CardTitle>
          <CardDescription>Доступно для вывода на личные нужды</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Чистая прибыль</span>
              <span className="font-semibold">{formatCurrency(metrics.netProfit, 'RUB')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Уже изъято</span>
              <span className="font-semibold text-red-600">
                -{formatCurrency(metrics.personalWithdrawals, 'RUB')}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border-2 border-primary/20">
              <span className="font-semibold text-foreground">Доступно для изъятия</span>
              <span className="font-bold text-primary text-lg">
                {formatCurrency(availableForWithdrawal, 'RUB')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editable Monthly Goal */}
      <Card data-testid="card-monthly-goal" className="hover-elevate">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Цель по доходу
          </CardTitle>
          <CardDescription>Устанавливайте и отслеживайте свои цели</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="monthly-goal" className="text-sm whitespace-nowrap">
              Месячная цель:
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="monthly-goal"
                type="number"
                value={monthlyGoal}
                onChange={(e) => setMonthlyGoal(Number(e.target.value) || 0)}
                className="w-40"
                data-testid="input-monthly-goal"
              />
              <span className="text-sm text-muted-foreground">₽</span>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Прогресс</span>
              <span className="text-sm font-semibold">{goalProgress.toFixed(0)}%</span>
            </div>
            <Progress value={Math.min(goalProgress, 100)} className="h-3" />
            <div className="flex justify-between mt-2">
              <span className="text-sm font-semibold">
                {formatCurrency(currentProjectedRevenue, 'RUB')}
              </span>
              <span className="text-sm text-muted-foreground">
                из {formatCurrency(monthlyGoal, 'RUB')}
              </span>
            </div>
          </div>

          {goalProgress < 100 && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-foreground">
                <strong>Недостаток:</strong> {formatCurrency(monthlyGoal - currentProjectedRevenue, 'RUB')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gap Analysis */}
      {goalProgress < 100 && (
        <Card data-testid="card-gap-analysis" className="hover-elevate border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Анализ недостающего дохода</CardTitle>
                  <CardDescription>Выберите услуги для достижения цели</CardDescription>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearGapAnalysis}
                data-testid="button-clear-gap"
              >
                Очистить
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Текущий доход (план)</span>
                <span className="font-semibold">{formatCurrency(currentProjectedRevenue, 'RUB')}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Выбрано услуг</span>
                <span className="font-semibold text-primary">+{formatCurrency(gapAnalysisTotal, 'RUB')}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border-2 border-primary/20">
                <span className="font-semibold text-foreground">Прогноз с новыми продажами</span>
                <span className="font-bold text-primary text-lg">
                  {formatCurrency(currentProjectedRevenue + gapAnalysisTotal, 'RUB')}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Прогресс к цели</span>
                  <span className="text-sm font-semibold">{Math.min(gapAnalysisProgress, 100).toFixed(0)}%</span>
                </div>
                <Progress 
                  value={Math.min(gapAnalysisProgress, 100)} 
                  className="h-3"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-sm font-semibold">
                    {formatCurrency(currentProjectedRevenue + gapAnalysisTotal, 'RUB')}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    цель: {formatCurrency(monthlyGoal, 'RUB')}
                  </span>
                </div>
              </div>

              {/* Remaining Gap */}
              {remainingGap > 0 ? (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm text-foreground">
                    <strong>Ещё нужно:</strong> {formatCurrency(remainingGap, 'RUB')}
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-semibold text-green-700">
                    Цель достигнута!
                  </p>
                </div>
              )}
            </div>

            {/* Service Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Euro className="h-4 w-4" />
                  Выберите услуги для продажи
                </h4>
                <Button
                  size="sm"
                  onClick={openAddDialog}
                  data-testid="button-add-service"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Добавить услугу
                </Button>
              </div>
              <div className="space-y-2">
                {gapServices.map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors gap-2"
                    data-testid={`gap-service-${index}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {service.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        €{service.priceEUR} = {formatCurrency(service.priceRUB, 'RUB')}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(index)}
                        data-testid={`button-edit-${index}`}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => deleteService(index)}
                        data-testid={`button-delete-${index}`}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                      
                      <div className="w-px h-6 bg-border mx-1" />
                      
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => updateGapService(index, service.quantity - 1)}
                        disabled={service.quantity === 0}
                        data-testid={`button-decrease-${index}`}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      
                      <Input
                        type="number"
                        value={service.quantity}
                        onChange={(e) => updateGapService(index, Number(e.target.value) || 0)}
                        className="w-16 h-8 text-center"
                        min="0"
                        data-testid={`input-gap-quantity-${index}`}
                      />
                      
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => updateGapService(index, service.quantity + 1)}
                        data-testid={`button-increase-${index}`}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      
                      {service.quantity > 0 && (
                        <div className="ml-2 min-w-[100px] text-right">
                          <Badge variant="default" className="font-semibold">
                            {formatCurrency(service.priceRUB * service.quantity, 'RUB')}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Editable Service Goals */}
      <Card data-testid="card-service-goals" className="hover-elevate">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Цели по услугам
          </CardTitle>
          <CardDescription>Редактируйте целевые показатели для каждой услуги</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {serviceGoals.map((service, index) => {
            const currentRevenue = service.pricePerUnit * service.currentUnits;
            const targetRevenue = service.pricePerUnit * service.targetUnits;
            const serviceProgress = (service.currentUnits / service.targetUnits) * 100;
            
            return (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-foreground">{service.serviceName}</h4>
                  <Badge variant="outline">{formatCurrency(service.pricePerUnit, 'RUB')}/ед.</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Текущие единицы</Label>
                    <Input
                      type="number"
                      value={service.currentUnits}
                      onChange={(e) => updateServiceGoal(index, 'currentUnits', Number(e.target.value) || 0)}
                      className="mt-1"
                      data-testid={`input-current-units-${index}`}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      = {formatCurrency(currentRevenue, 'RUB')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Целевые единицы</Label>
                    <Input
                      type="number"
                      value={service.targetUnits}
                      onChange={(e) => updateServiceGoal(index, 'targetUnits', Number(e.target.value) || 0)}
                      className="mt-1"
                      data-testid={`input-target-units-${index}`}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      = {formatCurrency(targetRevenue, 'RUB')}
                    </p>
                  </div>
                </div>
                
                <div>
                  <Progress value={Math.min(serviceProgress, 100)} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {serviceProgress.toFixed(0)}% выполнено
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Contractor Payments */}
      <Card data-testid="card-contractor-payments" className="hover-elevate">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Платежи контрагентам
              </CardTitle>
              <CardDescription>Отслеживайте платежи подрядчикам и исполнителям</CardDescription>
            </div>
            <Button
              onClick={() => openContractorDialog()}
              size="sm"
              data-testid="button-add-contractor-payment"
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить платеж
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {contractorPayments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Нет платежей контрагентам</p>
            </div>
          ) : (
            <div className="space-y-3">
              {overduePayments.length > 0 && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
                  <div className="flex items-center gap-2 text-destructive font-semibold">
                    <AlertCircle className="h-4 w-4" />
                    <span>Просроченных платежей: {overduePayments.length}</span>
                  </div>
                </div>
              )}
              
              {contractorPayments.map((payment) => {
                const status = getPaymentStatus(payment);
                const isPaid = status === 'paid';
                const isOverdue = status === 'overdue';
                
                return (
                  <div
                    key={payment.id}
                    className={`p-4 rounded-lg border ${
                      isPaid
                        ? 'bg-green-500/5 border-green-500/20'
                        : isOverdue
                        ? 'bg-destructive/5 border-destructive/20'
                        : 'bg-card border-border'
                    }`}
                    data-testid={`contractor-payment-${payment.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground truncate">
                            {payment.contractorName}
                          </h4>
                          <Badge
                            variant={isPaid ? 'default' : isOverdue ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {isPaid ? 'Оплачено' : isOverdue ? 'Просрочено' : 'Ожидает'}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {payment.description}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <div className="flex items-center gap-1 text-foreground font-semibold">
                            <CreditCard className="h-3 w-3" />
                            <span>{formatCurrency(payment.amount, payment.currency)}</span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {isPaid
                                ? `Оплачено ${payment.paidDate}`
                                : `До ${payment.dueDate}`}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {!isPaid && (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => openContractorDialog(payment.id)}
                              data-testid={`button-edit-payment-${payment.id}`}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => markPaymentAsPaid(payment.id)}
                              data-testid={`button-mark-paid-${payment.id}`}
                            >
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            </Button>
                          </>
                        )}
                        
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => deleteContractorPayment(payment.id)}
                          data-testid={`button-delete-payment-${payment.id}`}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Edit/Add Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent data-testid="dialog-service-edit">
          <DialogHeader>
            <DialogTitle>
              {editingServiceIndex !== null ? "Редактировать услугу" : "Добавить услугу"}
            </DialogTitle>
            <DialogDescription>
              {editingServiceIndex !== null 
                ? "Измените название и цену услуги в евро"
                : "Добавьте новую услугу с ценой в евро"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="service-name">Название услуги</Label>
              <Input
                id="service-name"
                value={editServiceName}
                onChange={(e) => setEditServiceName(e.target.value)}
                placeholder="Например: Консультация"
                data-testid="input-service-name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service-price">Цена (€)</Label>
              <Input
                id="service-price"
                type="number"
                value={editServicePrice || ""}
                onChange={(e) => setEditServicePrice(Number(e.target.value) || 0)}
                placeholder="100"
                min="0"
                data-testid="input-service-price"
              />
              <p className="text-xs text-muted-foreground">
                = {formatCurrency(editServicePrice * EUR_TO_RUB, 'RUB')}
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setEditDialogOpen(false)}
              data-testid="button-cancel-service"
            >
              Отмена
            </Button>
            <Button
              onClick={handleSaveService}
              disabled={!editServiceName.trim() || editServicePrice <= 0}
              data-testid="button-save-service"
            >
              {editingServiceIndex !== null ? "Сохранить" : "Добавить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contractor Payment Edit/Add Dialog */}
      <Dialog open={contractorDialogOpen} onOpenChange={setContractorDialogOpen}>
        <DialogContent data-testid="dialog-contractor-payment">
          <DialogHeader>
            <DialogTitle>
              {editingPaymentId ? "Редактировать платеж" : "Добавить платеж"}
            </DialogTitle>
            <DialogDescription>
              {editingPaymentId
                ? "Измените данные платежа контрагенту"
                : "Добавьте новый платеж контрагенту"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="contractor-name">Имя контрагента</Label>
              <Input
                id="contractor-name"
                value={paymentForm.contractorName}
                onChange={(e) => setPaymentForm({ ...paymentForm, contractorName: e.target.value })}
                placeholder="Например: Иван Иванов"
                data-testid="input-contractor-name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment-description">Описание работ</Label>
              <Input
                id="payment-description"
                value={paymentForm.description}
                onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                placeholder="Например: Дизайн сайта"
                data-testid="input-payment-description"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment-amount">Сумма</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  value={paymentForm.amount || ""}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) || 0 })}
                  placeholder="50000"
                  min="0"
                  data-testid="input-payment-amount"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment-currency">Валюта</Label>
                <select
                  id="payment-currency"
                  value={paymentForm.currency}
                  onChange={(e) => setPaymentForm({ ...paymentForm, currency: e.target.value as typeof paymentForm.currency })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  data-testid="select-payment-currency"
                >
                  <option value="RUB">RUB</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GEL">GEL</option>
                  <option value="KZT">KZT</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment-due-date">Срок оплаты</Label>
              <Input
                id="payment-due-date"
                type="date"
                value={paymentForm.dueDate}
                onChange={(e) => setPaymentForm({ ...paymentForm, dueDate: e.target.value })}
                data-testid="input-payment-due-date"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setContractorDialogOpen(false)}
              data-testid="button-cancel-contractor-payment"
            >
              Отмена
            </Button>
            <Button
              onClick={handleSaveContractorPayment}
              disabled={
                !paymentForm.contractorName.trim() ||
                !paymentForm.description.trim() ||
                paymentForm.amount <= 0 ||
                !paymentForm.dueDate
              }
              data-testid="button-save-contractor-payment"
            >
              {editingPaymentId ? "Сохранить" : "Добавить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
