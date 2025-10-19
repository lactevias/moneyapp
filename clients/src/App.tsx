import { useState, useMemo, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Account, Transaction, Budget, Goal, Category, MoneyTransfer, Debt, PlannedPayment, Space } from "./types";
import EnhancedDashboard from "./components/EnhancedDashboard";
import BusinessDashboard from "./components/BusinessDashboard";
import SimplifiedBusinessDashboard from "./components/SimplifiedBusinessDashboard";
import EnhancedBusinessDashboard from "./components/EnhancedBusinessDashboard";
import BusinessCalculators from "./components/BusinessCalculators";
import MonthlyBudgetPlanner from "./components/MonthlyBudgetPlanner";
import EnhancedSavings from "./components/EnhancedSavings";
import AIAssistant from "./components/AIAssistant";
import TransactionList from "./components/TransactionList";
import AccountCard from "./components/AccountCard";
import BudgetCard from "./components/BudgetCard";
import CurrencyConverter from "./components/CurrencyConverter";
import MoneyFlow from "./components/MoneyFlow";
import PaymentCalendar from "./components/PaymentCalendar";
import DebtTracker from "./components/DebtTracker";
import GoalCard from "./components/GoalCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wallet, Target, LayoutDashboard, Calendar, Plus, TrendingUp, Bot, Settings, Repeat } from "lucide-react";
import { calculateMultiCurrencyTotal, groupByCurrency, fetchExchangeRates, convertCurrency, defaultRates, type ExchangeRates } from "@/lib/currency";

//todo: remove mock functionality
const mockSpaces = [
  { id: '1', name: 'Личное', type: 'personal' as const },
  { id: '2', name: 'Бизнес', type: 'business' as const },
];

const initialTransactions: Transaction[] = [];

const initialAccounts: Account[] = [];

const initialSavings: Account[] = [];

const initialGoals: Goal[] = [];

const initialBudgets: Budget[] = [];

const initialTransfers: MoneyTransfer[] = [];

const initialMockPayments: PlannedPayment[] = [
  {
    id: 'p1',
    title: 'Интернет',
    amount: 800,
    currency: 'RUB',
    date: new Date('2025-02-01'),
    category: 'Связь',
    recurring: true,
    isRequired: true,
    space: 'personal'
  },
  {
    id: 'p2',
    title: 'Подписка на сервисы',
    amount: 15,
    currency: 'USD',
    date: new Date('2025-02-05'),
    category: 'Развлечения',
    recurring: true,
    isRequired: false,
    space: 'personal'
  },
  {
    id: 'p3',
    title: 'Страховка',
    amount: 12000,
    currency: 'RUB',
    date: new Date('2025-02-10'),
    category: 'Другое',
    recurring: false,
    isRequired: true,
    space: 'personal'
  },
  {
    id: 'p4',
    title: 'Коммунальные',
    amount: 200,
    currency: 'GEL',
    date: new Date('2025-02-15'),
    category: 'Жилье',
    recurring: true,
    isRequired: true,
    space: 'personal'
  },
];

const mockContracts = [
  {
    id: 'c1',
    client: 'Онлайн-школа "Знание"',
    amount: 120000,
    currency: 'RUB',
    status: 'active' as const,
    deadline: new Date('2025-02-28'),
  },
  {
    id: 'c2',
    client: 'Образовательная платформа',
    amount: 85000,
    currency: 'RUB',
    status: 'active' as const,
    deadline: new Date('2025-03-15'),
  },
  {
    id: 'c3',
    client: 'Частные консультации',
    amount: 45000,
    currency: 'RUB',
    status: 'pending' as const,
  },
];

function App() {
  const [currentSpace, setCurrentSpace] = useState('1');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [rawPlannedPayments, setRawPlannedPayments] = useLocalStorage<PlannedPayment[]>('plannedPayments', initialMockPayments);
  const { toast } = useToast();

  // Convert date strings back to Date objects for planned payments
  const plannedPayments = useMemo(() => 
    rawPlannedPayments.map(p => ({
      ...p,
      date: p.date instanceof Date ? p.date : new Date(p.date),
      endDate: p.endDate ? (p.endDate instanceof Date ? p.endDate : new Date(p.endDate)) : undefined,
      lastGenerated: p.lastGenerated ? (p.lastGenerated instanceof Date ? p.lastGenerated : new Date(p.lastGenerated)) : undefined
    })),
    [rawPlannedPayments]
  );

  // State for all data with localStorage persistence
  const [allAccounts, setAllAccounts] = useLocalStorage<Account[]>('accounts', initialAccounts);
  const [rawTransactions, setRawTransactions] = useLocalStorage<Transaction[]>('transactions', initialTransactions);
  const [rawGoals, setRawGoals] = useLocalStorage<Goal[]>('goals', initialGoals);
  const [allBudgets, setAllBudgets] = useLocalStorage<Budget[]>('budgets', initialBudgets);
  const [categories, setCategories] = useLocalStorage<Category[]>('categories', []);
  const [rawTransfers, setRawTransfers] = useLocalStorage<MoneyTransfer[]>('transfers', initialTransfers);
  const [rawDebts, setRawDebts] = useLocalStorage<Debt[]>('debts', []);

  // Convert date strings back to Date objects after loading from localStorage
  const allTransactions = useMemo(() => 
    rawTransactions.map(t => ({
      ...t,
      date: t.date instanceof Date ? t.date : new Date(t.date)
    })),
    [rawTransactions]
  );

  const allGoals = useMemo(() => 
    rawGoals.map(g => ({ ...g })),
    [rawGoals]
  );

  const allTransfers = useMemo(() => 
    rawTransfers.map(t => ({
      ...t,
      date: t.date instanceof Date ? t.date : new Date(t.date)
    })),
    [rawTransfers]
  );

  const allDebts = useMemo(() => 
    rawDebts.map(d => ({
      ...d,
      dueDate: d.dueDate ? (d.dueDate instanceof Date ? d.dueDate : new Date(d.dueDate)) : undefined
    })),
    [rawDebts]
  );

  // Dialog states
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);

  // Edit states
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingTransferId, setEditingTransferId] = useState<string | null>(null);

  const isPersonal = currentSpace === '1';
  const isBusiness = currentSpace === '2';
  const currentSpaceType: Space = isPersonal ? 'personal' : 'business';

  // Load exchange rates on mount and refresh every hour
  useEffect(() => {
    const loadRates = async () => {
      const rates = await fetchExchangeRates();
      setExchangeRates(rates);
    };

    loadRates();
    const interval = setInterval(loadRates, 3600000); // Refresh every hour

    return () => clearInterval(interval);
  }, []);

  // Filter data by current space
  const accounts = useMemo(() => 
    allAccounts.filter(a => a.space === currentSpaceType && a.type === 'regular'),
    [allAccounts, currentSpaceType]
  );
  
  const savings = useMemo(() => 
    allAccounts.filter(a => a.space === currentSpaceType && a.type === 'savings'),
    [allAccounts, currentSpaceType]
  );
  
  const transactions = useMemo(() => 
    allTransactions.filter(t => t.space === currentSpaceType),
    [allTransactions, currentSpaceType]
  );
  
  const goals = useMemo(() => 
    allGoals.filter(g => g.space === currentSpaceType),
    [allGoals, currentSpaceType]
  );
  
  const budgets = useMemo(() => 
    allBudgets.filter(b => b.space === currentSpaceType),
    [allBudgets, currentSpaceType]
  );

  const currentCategories = useMemo(() => 
    categories.filter(c => c.space === currentSpaceType),
    [categories, currentSpaceType]
  );

  const transfers = useMemo(() => 
    allTransfers.filter(t => t.space === currentSpaceType),
    [allTransfers, currentSpaceType]
  );

  const debts = useMemo(() => 
    allDebts.filter(d => d.space === currentSpaceType),
    [allDebts, currentSpaceType]
  );

  // Form states
  const [accountForm, setAccountForm] = useState<Omit<Account, 'id'>>({
    name: '',
    balance: 0,
    currency: 'RUB',
    type: 'regular',
    space: currentSpaceType
  });

  const [transactionForm, setTransactionForm] = useState<Omit<Transaction, 'id'>>({
    type: 'expense',
    category: '',
    amount: 0,
    currency: 'RUB',
    transactionCurrency: undefined,
    account: '',
    date: new Date(),
    description: '',
    fee: undefined,
    space: currentSpaceType
  });

  // Planned transaction state
  const [shouldSchedule, setShouldSchedule] = useState(false);
  const [scheduleRecurring, setScheduleRecurring] = useState(false);
  const [schedulePattern, setSchedulePattern] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [scheduleEndDate, setScheduleEndDate] = useState<Date | null>(null);

  // Exchange rates state
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(defaultRates);

  const [goalForm, setGoalForm] = useState<Omit<Goal, 'id'>>({
    name: '',
    currentAmount: 0,
    targetAmount: 0,
    currency: 'RUB',
    space: currentSpaceType
  });

  const [budgetForm, setBudgetForm] = useState<Omit<Budget, 'id'>>({
    category: '',
    limit: 0,
    spent: 0,
    currency: 'RUB',
    period: 'Январь',
    space: currentSpaceType
  });

  const [categoryForm, setCategoryForm] = useState<Omit<Category, 'id'>>({
    name: '',
    type: 'expense',
    isRequired: false,
    space: currentSpaceType
  });

  const [transferForm, setTransferForm] = useState<Omit<MoneyTransfer, 'id'>>({
    fromAccount: '',
    toAccount: '',
    amount: 0,
    currency: 'RUB',
    date: new Date(),
    description: '',
    fee: undefined,
    space: currentSpaceType
  });

  const handleAddPayment = (payment: Omit<PlannedPayment, 'id'>) => {
    const newPayment: PlannedPayment = {
      ...payment,
      id: `p-${Date.now()}`,
    };
    setRawPlannedPayments([...plannedPayments, newPayment]);
  };

  const handleDeletePayment = (id: string) => {
    setRawPlannedPayments(plannedPayments.filter(p => p.id !== id));
  };

  const handleUpdatePayment = (id: string, updates: Partial<PlannedPayment>) => {
    setRawPlannedPayments(plannedPayments.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  // Account handlers
  const openAccountDialog = (accountId?: string) => {
    if (accountId) {
      const account = allAccounts.find(a => a.id === accountId);
      if (account) {
        setEditingAccountId(accountId);
        setAccountForm({
          name: account.name,
          balance: account.balance,
          currency: account.currency,
          type: account.type,
          space: account.space
        });
      }
    } else {
      setEditingAccountId(null);
      setAccountForm({
        name: '',
        balance: 0,
        currency: 'RUB',
        type: 'regular',
        space: currentSpaceType
      });
    }
    setAccountDialogOpen(true);
  };

  const saveAccount = () => {
    if (!accountForm.name.trim() || accountForm.balance < 0) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля корректно",
        variant: "destructive"
      });
      return;
    }

    if (editingAccountId) {
      setAllAccounts(allAccounts.map(a => 
        a.id === editingAccountId ? { ...accountForm, id: editingAccountId } : a
      ));
      
      toast({
        title: "Успешно",
        description: "Счёт обновлён"
      });
    } else {
      const newAccount: Account = {
        ...accountForm,
        id: `acc-${Date.now()}`,
        space: currentSpaceType
      };
      
      setAllAccounts([...allAccounts, newAccount]);
      
      toast({
        title: "Успешно",
        description: "Счёт добавлен"
      });
    }
    
    setAccountDialogOpen(false);
    setEditingAccountId(null);
  };

  const deleteAccount = (accountId: string) => {
    setAllAccounts(allAccounts.filter(a => a.id !== accountId));
    toast({
      title: "Удалено",
      description: "Счёт удалён"
    });
  };

  // Transaction handlers
  const openTransactionDialog = (transactionId?: string) => {
    if (transactionId) {
      const transaction = allTransactions.find(t => t.id === transactionId);
      if (transaction) {
        setEditingTransactionId(transactionId);
        setTransactionForm({
          type: transaction.type,
          category: transaction.category,
          amount: transaction.amount,
          currency: transaction.currency,
          transactionCurrency: transaction.transactionCurrency,
          account: transaction.account,
          date: transaction.date,
          description: transaction.description || '',
          fee: transaction.fee,
          space: transaction.space
        });
      }
    } else {
      setEditingTransactionId(null);
      setTransactionForm({
        type: 'expense',
        category: '',
        amount: 0,
        currency: 'RUB',
        transactionCurrency: undefined,
        account: accounts[0]?.name || '',
        date: new Date(),
        description: '',
        fee: undefined,
        space: currentSpaceType
      });
    }
    
    // Reset scheduling state
    setShouldSchedule(false);
    setScheduleRecurring(false);
    setSchedulePattern('monthly');
    setScheduleEndDate(null);
    
    setTransactionDialogOpen(true);
  };

  const saveTransaction = () => {
    if (!transactionForm.category.trim() || transactionForm.amount <= 0) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля корректно",
        variant: "destructive"
      });
      return;
    }

    if (!transactionForm.account.trim()) {
      toast({
        title: "Ошибка",
        description: "Выберите счёт для транзакции",
        variant: "destructive"
      });
      return;
    }

    // Auto-create category if it doesn't exist (in the transaction's space, not current space)
    const targetSpace = editingTransactionId 
      ? transactionForm.space  // Preserve original space when editing
      : currentSpaceType;      // Use current space for new transactions
    
    const categoryExists = categories.find(c => 
      c.name === transactionForm.category && 
      c.type === transactionForm.type && 
      c.space === targetSpace
    );
    
    if (!categoryExists) {
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        name: transactionForm.category,
        type: transactionForm.type,
        isRequired: false, // Auto-created categories default to non-required
        space: targetSpace
      };
      setCategories([...categories, newCategory]);
    }

    // Update account balance
    const targetAccount = allAccounts.find(a => a.name === transactionForm.account && a.space === targetSpace);
    
    if (!targetAccount) {
      toast({
        title: "Ошибка",
        description: "Счёт не найден",
        variant: "destructive"
      });
      return;
    }

    // Currency conversion if needed
    const transactionCurrency = transactionForm.transactionCurrency || targetAccount.currency;
    const amountInAccountCurrency = convertCurrency(
      transactionForm.amount,
      transactionCurrency,
      targetAccount.currency,
      exchangeRates
    );
    
    // Total amount including fee (fee is always in account currency)
    const totalAmount = amountInAccountCurrency + (transactionForm.fee || 0);

    let updatedAccounts = [...allAccounts];

    if (editingTransactionId) {
      // When editing: restore old balance, then apply new transaction
      const oldTransaction = allTransactions.find(t => t.id === editingTransactionId);
      if (oldTransaction) {
        // Restore old transaction effect
        const oldAccount = allAccounts.find(a => a.name === oldTransaction.account && a.space === oldTransaction.space);
        if (oldAccount) {
          const oldTransactionCurrency = oldTransaction.transactionCurrency || oldAccount.currency;
          const oldAmountInAccountCurrency = convertCurrency(
            oldTransaction.amount,
            oldTransactionCurrency,
            oldAccount.currency,
            exchangeRates
          );
          const oldTotalAmount = oldAmountInAccountCurrency + (oldTransaction.fee || 0);
          
          updatedAccounts = updatedAccounts.map(a => 
            a.id === oldAccount.id 
              ? { ...a, balance: a.balance + (oldTransaction.type === 'expense' ? oldTotalAmount : -oldTotalAmount) }
              : a
          );
        }
      }
      
      // Apply new transaction
      updatedAccounts = updatedAccounts.map(a => 
        a.id === targetAccount.id 
          ? { ...a, balance: a.balance + (transactionForm.type === 'income' ? amountInAccountCurrency : -totalAmount) }
          : a
      );

      setAllAccounts(updatedAccounts);
      setRawTransactions(allTransactions.map(t => 
        t.id === editingTransactionId ? { 
          ...transactionForm, 
          id: editingTransactionId,
          currency: targetAccount.currency,
          transactionCurrency: transactionCurrency !== targetAccount.currency ? transactionCurrency : undefined
        } : t
      ));
      toast({
        title: "Успешно",
        description: transactionCurrency !== targetAccount.currency 
          ? `Транзакция обновлена (сконвертировано ${transactionForm.amount} ${transactionCurrency} → ${amountInAccountCurrency.toFixed(2)} ${targetAccount.currency})` 
          : "Транзакция обновлена"
      });
    } else {
      // New transaction: just apply the balance change
      updatedAccounts = updatedAccounts.map(a => 
        a.id === targetAccount.id 
          ? { ...a, balance: a.balance + (transactionForm.type === 'income' ? amountInAccountCurrency : -totalAmount) }
          : a
      );

      const newTransaction: Transaction = {
        ...transactionForm,
        id: `tr-${Date.now()}`,
        currency: targetAccount.currency,
        transactionCurrency: transactionCurrency !== targetAccount.currency ? transactionCurrency : undefined,
        space: currentSpaceType
      };

      setAllAccounts(updatedAccounts);
      setRawTransactions([newTransaction, ...allTransactions]);
      
      // Create planned payment if scheduling is enabled
      if (shouldSchedule) {
        const newPlannedPayment: PlannedPayment = {
          id: `p-${Date.now()}`,
          title: transactionForm.category,
          amount: transactionForm.amount,
          currency: transactionForm.currency,
          date: transactionForm.date,
          category: transactionForm.category,
          account: transactionForm.account,
          recurring: scheduleRecurring,
          recurrencePattern: scheduleRecurring ? schedulePattern : undefined,
          endDate: scheduleRecurring && scheduleEndDate ? scheduleEndDate : undefined,
          isRequired: transactionForm.type === 'expense',
          space: currentSpaceType
        };
        setRawPlannedPayments([...plannedPayments, newPlannedPayment]);
      }

      const conversionMessage = transactionCurrency !== targetAccount.currency 
        ? ` (сконвертировано ${transactionForm.amount} ${transactionCurrency} → ${amountInAccountCurrency.toFixed(2)} ${targetAccount.currency})` 
        : '';
      
      toast({
        title: "Успешно",
        description: shouldSchedule 
          ? `Транзакция добавлена и запланирована${conversionMessage}` 
          : `Транзакция добавлена${conversionMessage}`
      });
    }
    
    setTransactionDialogOpen(false);
    setEditingTransactionId(null);
  };

  const deleteTransaction = (transactionId: string) => {
    const transaction = allTransactions.find(t => t.id === transactionId);
    
    if (transaction) {
      // Restore account balance by reversing the transaction
      const targetAccount = allAccounts.find(a => a.name === transaction.account && a.space === transaction.space);
      
      if (targetAccount) {
        const transactionCurrency = transaction.transactionCurrency || targetAccount.currency;
        const amountInAccountCurrency = convertCurrency(
          transaction.amount,
          transactionCurrency,
          targetAccount.currency,
          exchangeRates
        );
        const totalAmount = amountInAccountCurrency + (transaction.fee || 0);
        
        const updatedAccounts = allAccounts.map(a => 
          a.id === targetAccount.id 
            ? { ...a, balance: a.balance + (transaction.type === 'expense' ? totalAmount : -amountInAccountCurrency) }
            : a
        );
        setAllAccounts(updatedAccounts);
      }
    }

    setRawTransactions(allTransactions.filter(t => t.id !== transactionId));
    toast({
      title: "Удалено",
      description: "Транзакция удалена"
    });
  };

  // Goal handlers
  const openGoalDialog = (goalId?: string) => {
    if (goalId) {
      const goal = allGoals.find(g => g.id === goalId);
      if (goal) {
        setEditingGoalId(goalId);
        setGoalForm({
          name: goal.name,
          currentAmount: goal.currentAmount,
          targetAmount: goal.targetAmount,
          currency: goal.currency,
          space: goal.space
        });
      }
    } else {
      setEditingGoalId(null);
      setGoalForm({
        name: '',
        currentAmount: 0,
        targetAmount: 0,
        currency: 'RUB',
        space: currentSpaceType
      });
    }
    setGoalDialogOpen(true);
  };

  const saveGoal = () => {
    if (!goalForm.name.trim() || goalForm.targetAmount <= 0) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля корректно",
        variant: "destructive"
      });
      return;
    }

    if (editingGoalId) {
      setRawGoals(allGoals.map(g => 
        g.id === editingGoalId ? { ...goalForm, id: editingGoalId } : g
      ));
      toast({
        title: "Успешно",
        description: "Цель обновлена"
      });
    } else {
      const newGoal: Goal = {
        ...goalForm,
        id: `goal-${Date.now()}`,
        space: currentSpaceType
      };
      setRawGoals([...allGoals, newGoal]);
      toast({
        title: "Успешно",
        description: "Цель добавлена"
      });
    }
    
    setGoalDialogOpen(false);
    setEditingGoalId(null);
  };

  const deleteGoal = (goalId: string) => {
    setRawGoals(allGoals.filter(g => g.id !== goalId));
    toast({
      title: "Удалено",
      description: "Цель удалена"
    });
  };

  const addFundsToGoal = (goalId: string, amount: number) => {
    setRawGoals(allGoals.map(g => 
      g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g
    ));
    toast({
      title: "Успешно",
      description: "Средства добавлены к цели"
    });
  };

  // Budget handlers
  const openBudgetDialog = (budgetId?: string) => {
    if (budgetId) {
      const budget = allBudgets.find(b => b.id === budgetId);
      if (budget) {
        setEditingBudgetId(budgetId);
        setBudgetForm({
          category: budget.category,
          limit: budget.limit,
          spent: budget.spent,
          currency: budget.currency,
          period: budget.period || 'Январь',
          space: budget.space
        });
      }
    } else {
      setEditingBudgetId(null);
      setBudgetForm({
        category: '',
        limit: 0,
        spent: 0,
        currency: 'RUB',
        period: 'Январь',
        space: currentSpaceType
      });
    }
    setBudgetDialogOpen(true);
  };

  const saveBudget = () => {
    if (!budgetForm.category.trim() || budgetForm.limit <= 0) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля корректно",
        variant: "destructive"
      });
      return;
    }

    if (editingBudgetId) {
      setAllBudgets(allBudgets.map(b => 
        b.id === editingBudgetId ? { ...budgetForm, id: editingBudgetId } : b
      ));
      toast({
        title: "Успешно",
        description: "Бюджет обновлён"
      });
    } else {
      const newBudget: Budget = {
        ...budgetForm,
        id: `budget-${Date.now()}`,
        space: currentSpaceType
      };
      setAllBudgets([...allBudgets, newBudget]);
      toast({
        title: "Успешно",
        description: "Бюджет добавлен"
      });
    }
    
    setBudgetDialogOpen(false);
    setEditingBudgetId(null);
  };

  const deleteBudget = (budgetId: string) => {
    setAllBudgets(allBudgets.filter(b => b.id !== budgetId));
    toast({
      title: "Удалено",
      description: "Бюджет удалён"
    });
  };

  // Category handlers
  const openCategoryDialog = (categoryId?: string) => {
    if (categoryId) {
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        setEditingCategoryId(categoryId);
        setCategoryForm({
          name: category.name,
          type: category.type,
          isRequired: category.isRequired || false,
          space: category.space
        });
      }
    } else {
      setEditingCategoryId(null);
      setCategoryForm({
        name: '',
        type: 'expense',
        isRequired: false,
        space: currentSpaceType
      });
    }
    setCategoryDialogOpen(true);
  };

  const saveCategory = () => {
    if (!categoryForm.name.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите название категории",
        variant: "destructive"
      });
      return;
    }

    if (editingCategoryId) {
      setCategories(categories.map(c => 
        c.id === editingCategoryId ? { ...categoryForm, id: editingCategoryId } : c
      ));
      toast({
        title: "Успешно",
        description: "Категория обновлена"
      });
    } else {
      const newCategory: Category = {
        ...categoryForm,
        id: `cat-${Date.now()}`,
        space: currentSpaceType
      };
      setCategories([...categories, newCategory]);
      toast({
        title: "Успешно",
        description: "Категория добавлена"
      });
    }
    
    setCategoryDialogOpen(false);
    setEditingCategoryId(null);
  };

  const deleteCategory = (categoryId: string) => {
    setCategories(categories.filter(c => c.id !== categoryId));
    toast({
      title: "Удалено",
      description: "Категория удалена"
    });
  };

  // Transfer handlers
  const openTransferDialog = (transferId?: string) => {
    if (transferId) {
      const transfer = allTransfers.find(t => t.id === transferId);
      if (transfer) {
        setEditingTransferId(transferId);
        setTransferForm({
          fromAccount: transfer.fromAccount,
          toAccount: transfer.toAccount,
          amount: transfer.amount,
          currency: transfer.currency,
          date: transfer.date,
          description: transfer.description || '',
          fee: transfer.fee,
          space: transfer.space
        });
      }
    } else {
      setEditingTransferId(null);
      setTransferForm({
        fromAccount: accounts[0]?.name || '',
        toAccount: accounts[1]?.name || '',
        amount: 0,
        currency: 'RUB',
        date: new Date(),
        description: '',
        fee: undefined,
        space: currentSpaceType
      });
    }
    setTransferDialogOpen(true);
  };

  const saveTransfer = () => {
    if (!transferForm.fromAccount.trim() || !transferForm.toAccount.trim() || transferForm.amount <= 0) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля корректно",
        variant: "destructive"
      });
      return;
    }

    if (transferForm.fromAccount === transferForm.toAccount) {
      toast({
        title: "Ошибка",
        description: "Счёт отправителя и получателя не могут совпадать",
        variant: "destructive"
      });
      return;
    }

    if (editingTransferId) {
      setRawTransfers(allTransfers.map(t => 
        t.id === editingTransferId ? { ...transferForm, id: editingTransferId } : t
      ));
      toast({
        title: "Успешно",
        description: "Перевод обновлён"
      });
    } else {
      const newTransfer: MoneyTransfer = {
        ...transferForm,
        id: `transfer-${Date.now()}`,
        space: currentSpaceType
      };
      setRawTransfers([newTransfer, ...allTransfers]);
      toast({
        title: "Успешно",
        description: "Перевод добавлен"
      });
    }
    
    setTransferDialogOpen(false);
    setEditingTransferId(null);
  };

  const deleteTransfer = (transferId: string) => {
    setRawTransfers(allTransfers.filter(t => t.id !== transferId));
    toast({
      title: "Удалено",
      description: "Перевод удалён"
    });
  };

  // Debt handlers
  const addDebt = (debtData: Omit<Debt, 'id'>) => {
    const newDebt: Debt = {
      ...debtData,
      id: `debt-${Date.now()}`,
      space: currentSpaceType
    };
    setRawDebts([...allDebts, newDebt]);
    toast({
      title: "Успешно",
      description: "Долг добавлен"
    });
  };

  const updateDebt = (debt: Debt) => {
    setRawDebts(allDebts.map(d => d.id === debt.id ? { ...debt, space: debt.space } : d));
    toast({
      title: "Успешно",
      description: "Долг обновлён"
    });
  };

  const deleteDebt = (debtId: string) => {
    setRawDebts(allDebts.filter(d => d.id !== debtId));
    toast({
      title: "Удалено",
      description: "Долг удалён"
    });
  };

  // Calculate multi-currency totals for Personal space
  const personalStats = useMemo(() => {
    // Total funds - regular accounts only (excluding savings as per user request)
    const regularAccountsData = accounts.map(acc => ({
      amount: acc.balance,
      currency: acc.currency
    }));
    const totalFunds = calculateMultiCurrencyTotal(regularAccountsData);
    
    // Total balance - all accounts including savings
    const allAccountsData = [...accounts, ...savings].map(acc => ({
      amount: acc.balance,
      currency: acc.currency
    }));
    const totalBalance = calculateMultiCurrencyTotal(allAccountsData);
    const balanceByCurrency = groupByCurrency(allAccountsData);

    // Income and expenses from transactions
    const incomeData = transactions
      .filter(t => t.type === 'income')
      .map(t => ({ amount: t.amount, currency: t.currency }));
    const income = calculateMultiCurrencyTotal(incomeData);

    const expenseData = transactions
      .filter(t => t.type === 'expense')
      .map(t => ({ amount: t.amount, currency: t.currency }));
    const expenses = calculateMultiCurrencyTotal(expenseData);

    // Savings
    const savingsData = savings.map(acc => ({
      amount: acc.balance,
      currency: acc.currency
    }));
    const savingsTotal = calculateMultiCurrencyTotal(savingsData);

    return {
      totalFunds, // Regular accounts only
      totalBalance, // All accounts
      balanceByCurrency,
      income,
      expenses,
      savings: savingsTotal,
    };
  }, [accounts, savings, transactions]);

  // Tab configuration for each space (memoized to prevent unnecessary re-renders)
  const personalTabs = useMemo(() => [
    { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
    { id: 'money-accounts', label: 'Деньги и счета', icon: Wallet },
    { id: 'goals-savings', label: 'Цели и накопления', icon: Target },
    { id: 'planner', label: 'Платежи', icon: Calendar },
    { id: 'budget', label: 'Бюджет', icon: TrendingUp },
    { id: 'ai-assistant', label: 'AI Помощник', icon: Bot },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ], []);

  const businessTabs = useMemo(() => [
    { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
    { id: 'finances', label: 'Финансы', icon: Wallet },
    { id: 'services', label: 'Услуги', icon: Target },
    { id: 'calculators', label: 'Калькуляторы', icon: TrendingUp },
    { id: 'ai-assistant', label: 'AI Помощник', icon: Bot },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ], []);

  const currentTabs = isPersonal ? personalTabs : businessTabs;

  // Sync active tab when space changes
  useEffect(() => {
    const currentTabIds = currentTabs.map(tab => tab.id);
    if (!currentTabIds.includes(activeTab)) {
      setActiveTab('dashboard'); // Reset to dashboard if current tab doesn't exist in new space
    }
  }, [currentSpace, currentTabs, activeTab]);

  // Auto-generate transactions from recurring payments
  useEffect(() => {
    const processRecurringPayments = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const recurringPayments = rawPlannedPayments.filter(p => p.recurring && p.recurrencePattern);
      if (recurringPayments.length === 0) return;

      let updatedPayments = [...rawPlannedPayments];
      let newTransactions: Transaction[] = [];

      recurringPayments.forEach(payment => {
        const paymentDate = payment.date instanceof Date ? payment.date : new Date(payment.date);
        const lastGen = payment.lastGenerated ? 
          (payment.lastGenerated instanceof Date ? payment.lastGenerated : new Date(payment.lastGenerated)) : 
          null;
        const endDate = payment.endDate ? 
          (payment.endDate instanceof Date ? payment.endDate : new Date(payment.endDate)) : 
          null;

        // Calculate next occurrence date
        let nextDate = lastGen || paymentDate;
        
        while (nextDate <= today) {
          // Check if we should stop (end date reached)
          if (endDate && nextDate > endDate) break;

          // Create transaction if this date hasn't been processed
          if (!lastGen || nextDate > lastGen) {
            const newTransaction: Transaction = {
              id: `auto-tx-${Date.now()}-${Math.random()}`,
              type: 'expense',
              category: payment.category,
              amount: payment.amount,
              currency: payment.currency,
              account: payment.account || accounts[0]?.name || 'Основной',
              date: new Date(nextDate),
              description: `Автоплатёж: ${payment.title}`,
              space: payment.space,
            };
            newTransactions.push(newTransaction);

            // Update lastGenerated
            const paymentIndex = updatedPayments.findIndex(p => p.id === payment.id);
            if (paymentIndex !== -1) {
              updatedPayments[paymentIndex] = {
                ...updatedPayments[paymentIndex],
                lastGenerated: new Date(nextDate)
              };
            }
          }

          // Calculate next occurrence based on pattern
          const tempDate = new Date(nextDate);
          switch (payment.recurrencePattern) {
            case 'daily':
              tempDate.setDate(tempDate.getDate() + 1);
              break;
            case 'weekly':
              tempDate.setDate(tempDate.getDate() + 7);
              break;
            case 'monthly':
              tempDate.setMonth(tempDate.getMonth() + 1);
              break;
            case 'yearly':
              tempDate.setFullYear(tempDate.getFullYear() + 1);
              break;
          }
          nextDate = tempDate;
        }
      });

      // Apply updates if any transactions were created
      if (newTransactions.length > 0) {
        setRawTransactions(prev => [...prev, ...newTransactions]);
        setRawPlannedPayments(updatedPayments);
        toast({
          title: "Автоматические платежи созданы",
          description: `Создано транзакций: ${newTransactions.length}`,
        });
      }
    };

    processRecurringPayments();
    
    // Run daily check
    const intervalId = setInterval(processRecurringPayments, 24 * 60 * 60 * 1000); // Once per day
    return () => clearInterval(intervalId);
  }, [rawPlannedPayments, accounts, setRawTransactions, setRawPlannedPayments, toast]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col h-screen w-full bg-background">
          {/* Header with Space Switcher */}
          <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Привет, <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Нина</span>
                </h1>
              </div>
              
              {/* Space Switcher */}
              <div className="flex items-center gap-2 bg-card p-1.5 rounded-lg border border-border">
                {mockSpaces.map((space) => (
                  <Button
                    key={space.id}
                    data-testid={`button-space-${space.id}`}
                    size="sm"
                    variant={currentSpace === space.id ? "default" : "ghost"}
                    onClick={() => setCurrentSpace(space.id)}
                  >
                    {space.name}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Horizontal Tabs */}
            <div className="flex items-center gap-1 px-4 overflow-x-auto">
              {currentTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    data-testid={`tab-${tab.id}`}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab(tab.id)}
                    className={activeTab === tab.id ? "border-b-2 border-primary rounded-b-none" : ""}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </Button>
                );
              })}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {isPersonal && (
                    <EnhancedDashboard
                      totalBalance={personalStats.totalBalance}
                      totalBalanceByCurrency={personalStats.balanceByCurrency}
                      income={personalStats.income}
                      expenses={personalStats.expenses}
                      savings={personalStats.savings}
                      transactions={transactions}
                      goalsCount={goals.length}
                      payments={plannedPayments}
                      budgets={budgets}
                      currentSpace={currentSpaceType}
                    />
                  )}

                  {isBusiness && (
                    <SimplifiedBusinessDashboard />
                  )}
                </div>
              )}

              {activeTab === 'money-accounts' && isPersonal && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-2 mb-6">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      <h2 className="text-2xl font-bold text-foreground">Деньги и счета</h2>
                    </div>
                    <Button 
                      data-testid="button-add-account" 
                      variant="outline" 
                      className="gap-2"
                      onClick={() => openAccountDialog()}
                    >
                      <Plus className="h-4 w-4" />
                      Добавить счёт
                    </Button>
                  </div>
                  
                  <TransactionList
                    transactions={transactions}
                    onAdd={() => openTransactionDialog()}
                    onEdit={openTransactionDialog}
                    onDelete={deleteTransaction}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {accounts.map((account) => (
                      <AccountCard
                        key={account.id}
                        account={account}
                        transactions={transactions}
                        onEdit={openAccountDialog}
                        onDelete={deleteAccount}
                      />
                    ))}
                  </div>
                  
                  <MoneyFlow 
                    transfers={transfers} 
                    onAdd={() => openTransferDialog()}
                    onEdit={openTransferDialog}
                    onDelete={deleteTransfer}
                  />

                  <DebtTracker 
                    debts={debts}
                    currentSpace={currentSpaceType}
                    onAdd={addDebt}
                    onUpdate={updateDebt}
                    onDelete={deleteDebt}
                  />
                </div>
              )}

              {activeTab === 'goals-savings' && isPersonal && (
                <div className="space-y-8">
                  {/* Goals Section */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-bold text-foreground">Финансовые цели</h2>
                      </div>
                      <Button 
                        data-testid="button-add-goal" 
                        variant="outline" 
                        className="gap-2"
                        onClick={() => openGoalDialog()}
                      >
                        <Plus className="h-4 w-4" />
                        Добавить цель
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {goals.map((goal) => (
                        <GoalCard
                          key={goal.id}
                          goal={goal}
                          onDelete={deleteGoal}
                          onAddFunds={(goalId) => {
                            // Simple prompt for now - can be enhanced with a dialog
                            const amount = prompt('Введите сумму пополнения:');
                            if (amount) {
                              addFundsToGoal(goalId, Number(amount));
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Elegant Separator */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-primary/20"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-background px-4 text-sm text-muted-foreground">
                        <Sparkles className="h-4 w-4 inline mr-1" />
                        Накопления
                      </span>
                    </div>
                  </div>

                  {/* Savings Section */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-bold text-foreground">Накопительные счета</h2>
                      </div>
                      <Button 
                        data-testid="button-add-savings" 
                        variant="outline" 
                        className="gap-2"
                        onClick={() => {
                          setAccountForm({ ...accountForm, type: 'savings' });
                          openAccountDialog();
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        Добавить счёт
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {savings.map((account) => (
                        <AccountCard
                          key={account.id}
                          account={account}
                          transactions={transactions}
                          onEdit={openAccountDialog}
                          onDelete={deleteAccount}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'finances' && isBusiness && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Wallet className="h-5 w-5 text-primary" />
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Финансы</h2>
                      <p className="text-muted-foreground">Бизнес-транзакции и счета</p>
                    </div>
                  </div>
                  
                  <TransactionList
                    transactions={transactions}
                    onAdd={() => openTransactionDialog()}
                    onEdit={openTransactionDialog}
                    onDelete={deleteTransaction}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {accounts.map((account) => (
                      <AccountCard
                        key={account.id}
                        account={account}
                        transactions={transactions}
                        onEdit={openAccountDialog}
                        onDelete={deleteAccount}
                      />
                    ))}
                  </div>
                  
                  <MoneyFlow 
                    transfers={transfers} 
                    onAdd={() => openTransferDialog()}
                    onEdit={openTransferDialog}
                    onDelete={deleteTransfer}
                  />
                </div>
              )}

              {activeTab === 'services' && isBusiness && (
                <div className="space-y-6">
                  {/* This will be the services component */}
                  <EnhancedBusinessDashboard />
                </div>
              )}

              {activeTab === 'calculators' && isBusiness && (
                <BusinessCalculators />
              )}

              {activeTab === 'accounts' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Счета</h2>
                      <p className="text-muted-foreground">Каналы энергии</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {accounts.map((account) => (
                      <AccountCard
                        key={account.id}
                        account={account}
                        transactions={transactions}
                        onEdit={openAccountDialog}
                        onDelete={deleteAccount}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'savings' && (
                <EnhancedSavings
                  savingsAccounts={savings}
                  goals={goals}
                  regularAccounts={accounts}
                />
              )}

              {activeTab === 'budgets-goals' && (
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">Бюджеты</h2>
                        <p className="text-muted-foreground">Контроль потоков</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {budgets.map((budget) => (
                        <BudgetCard
                          key={budget.id}
                          budget={budget}
                          onDelete={deleteBudget}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'planner' && (
                <div className="space-y-6">
                  <PaymentCalendar
                    payments={plannedPayments}
                    onAddPlannedPayment={() => setActiveTab('budget')}
                    onUpdatePayment={handleUpdatePayment}
                  />
                </div>
              )}

              {activeTab === 'budget' && isPersonal && (
                <MonthlyBudgetPlanner
                  plannedPayments={plannedPayments}
                  onAddPayment={handleAddPayment}
                  onDeletePayment={handleDeletePayment}
                  onUpdatePayment={handleUpdatePayment}
                  currentSpace={currentSpaceType}
                />
              )}

              {activeTab === 'ai-assistant' && (
                <AIAssistant
                  userContext={{
                    totalBalance: personalStats.totalBalance,
                    income: personalStats.income,
                    expenses: personalStats.expenses,
                    savings: personalStats.savings,
                    currentSpace: isPersonal ? 'personal' : 'business',
                  }}
                />
              )}

              {activeTab === 'converter' && (
                <div className="max-w-2xl">
                  <CurrencyConverter />
                </div>
              )}

              {activeTab === 'settings' && (
                <Card className="shadow-glow">
                  <CardHeader>
                    <CardTitle>Настройки</CardTitle>
                    <CardDescription>Управление категориями пространства "{isPersonal ? 'Личное' : 'Бизнес'}"</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Категории доходов
                          </h3>
                          <Button 
                            data-testid="button-add-income-category" 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setCategoryForm({ name: '', type: 'income', space: currentSpaceType });
                              openCategoryDialog();
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Добавить
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {currentCategories.filter(c => c.type === 'income').length === 0 ? (
                            <p className="text-sm text-muted-foreground">Категорий пока нет</p>
                          ) : (
                            currentCategories
                              .filter(c => c.type === 'income')
                              .map((cat) => (
                                <Badge 
                                  key={cat.id} 
                                  variant="outline"
                                  className="px-3 py-1 bg-primary/10 border-primary/30 gap-2"
                                >
                                  {cat.name}
                                  <button
                                    onClick={() => deleteCategory(cat.id)}
                                    className="ml-1 hover:text-destructive"
                                    data-testid={`button-delete-category-${cat.id}`}
                                  >
                                    ×
                                  </button>
                                </Badge>
                              ))
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Категории расходов
                          </h3>
                          <Button 
                            data-testid="button-add-expense-category" 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setCategoryForm({ name: '', type: 'expense', space: currentSpaceType });
                              openCategoryDialog();
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Добавить
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {currentCategories.filter(c => c.type === 'expense').length === 0 ? (
                            <p className="text-sm text-muted-foreground">Категорий пока нет</p>
                          ) : (
                            currentCategories
                              .filter(c => c.type === 'expense')
                              .map((cat) => (
                                <Badge 
                                  key={cat.id} 
                                  variant="outline"
                                  className="px-3 py-1 bg-accent/10 border-accent/30 gap-2"
                                >
                                  {cat.name}
                                  <button
                                    onClick={() => deleteCategory(cat.id)}
                                    className="ml-1 hover:text-destructive"
                                    data-testid={`button-delete-category-${cat.id}`}
                                  >
                                    ×
                                  </button>
                                </Badge>
                              ))
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          Валюты
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {['RUB (₽)', 'GEL (₾)', 'USD ($)', 'KZT (₸)'].map((curr) => (
                            <Badge key={curr} variant="outline" className="px-3 py-1">
                              {curr}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
          </main>

          {/* Account Dialog */}
          <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
            <DialogContent data-testid="dialog-account">
              <DialogHeader>
                <DialogTitle>{editingAccountId ? 'Редактировать счёт' : 'Добавить счёт'}</DialogTitle>
                <DialogDescription>
                  {editingAccountId ? 'Измените данные счёта' : 'Создайте новый счёт'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="account-name">Название счёта</Label>
                  <Input
                    id="account-name"
                    value={accountForm.name}
                    onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                    placeholder="Например: Тинькофф"
                    data-testid="input-account-name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="account-balance">Баланс</Label>
                    <Input
                      id="account-balance"
                      type="number"
                      value={accountForm.balance || ''}
                      onChange={(e) => setAccountForm({ ...accountForm, balance: Number(e.target.value) || 0 })}
                      placeholder="50000"
                      min="0"
                      data-testid="input-account-balance"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="account-currency">Валюта</Label>
                    <select
                      id="account-currency"
                      value={accountForm.currency}
                      onChange={(e) => setAccountForm({ ...accountForm, currency: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      data-testid="select-account-currency"
                    >
                      <option value="RUB">RUB (₽)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GEL">GEL (₾)</option>
                      <option value="KZT">KZT (₸)</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="account-type">Тип счёта</Label>
                  <select
                    id="account-type"
                    value={accountForm.type}
                    onChange={(e) => setAccountForm({ ...accountForm, type: e.target.value as 'regular' | 'savings' })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    data-testid="select-account-type"
                  >
                    <option value="regular">Обычный</option>
                    <option value="savings">Накопительный</option>
                  </select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="ghost" onClick={() => setAccountDialogOpen(false)} data-testid="button-cancel-account">
                  Отмена
                </Button>
                <Button onClick={saveAccount} data-testid="button-save-account">
                  {editingAccountId ? 'Сохранить' : 'Добавить'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Transaction Dialog */}
          <Dialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen}>
            <DialogContent className="max-h-[80vh] overflow-y-auto" data-testid="dialog-transaction">
              <DialogHeader>
                <DialogTitle>{editingTransactionId ? 'Редактировать транзакцию' : 'Добавить транзакцию'}</DialogTitle>
                <DialogDescription>
                  {editingTransactionId ? 'Измените данные транзакции' : 'Создайте новую транзакцию'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transaction-type">Тип</Label>
                  <select
                    id="transaction-type"
                    value={transactionForm.type}
                    onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value as 'income' | 'expense' })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    data-testid="select-transaction-type"
                  >
                    <option value="income">Доход</option>
                    <option value="expense">Расход</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="transaction-category">Категория</Label>
                  <Input
                    id="transaction-category"
                    value={transactionForm.category}
                    onChange={(e) => setTransactionForm({ ...transactionForm, category: e.target.value })}
                    placeholder="Например: Еда"
                    list="categories-list"
                    data-testid="input-transaction-category"
                  />
                  <datalist id="categories-list">
                    {currentCategories
                      .filter(c => c.type === transactionForm.type)
                      .map(cat => (
                        <option key={cat.id} value={cat.name} />
                      ))}
                  </datalist>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="transaction-amount">Сумма</Label>
                    <Input
                      id="transaction-amount"
                      type="number"
                      value={transactionForm.amount || ''}
                      onChange={(e) => setTransactionForm({ ...transactionForm, amount: Number(e.target.value) || 0 })}
                      placeholder="1000"
                      min="0"
                      data-testid="input-transaction-amount"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="transaction-currency">Валюта транзакции</Label>
                    <select
                      id="transaction-currency"
                      value={transactionForm.transactionCurrency || transactionForm.currency}
                      onChange={(e) => setTransactionForm({ ...transactionForm, transactionCurrency: e.target.value || undefined })}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      data-testid="select-transaction-currency"
                    >
                      <option value="RUB">RUB (₽)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GEL">GEL (₾)</option>
                      <option value="KZT">KZT (₸)</option>
                      <option value="USDT">USDT</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="transaction-account">Счёт</Label>
                  <select
                    id="transaction-account"
                    value={transactionForm.account}
                    onChange={(e) => setTransactionForm({ ...transactionForm, account: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    data-testid="select-transaction-account"
                  >
                    <option value="">Выберите счёт</option>
                    {[...accounts, ...savings].map((acc) => (
                      <option key={acc.id} value={acc.name}>
                        {acc.name} ({acc.currency})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="transaction-date">Дата</Label>
                  <Input
                    id="transaction-date"
                    type="date"
                    value={transactionForm.date instanceof Date ? transactionForm.date.toISOString().split('T')[0] : ''}
                    onChange={(e) => setTransactionForm({ ...transactionForm, date: new Date(e.target.value) })}
                    data-testid="input-transaction-date"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="transaction-description">Описание (необязательно)</Label>
                    <Input
                      id="transaction-description"
                      value={transactionForm.description}
                      onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                      placeholder="Дополнительная информация"
                      data-testid="input-transaction-description"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="transaction-fee">Комиссия (необязательно)</Label>
                    <Input
                      id="transaction-fee"
                      type="number"
                      value={transactionForm.fee || ''}
                      onChange={(e) => setTransactionForm({ ...transactionForm, fee: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      data-testid="input-transaction-fee"
                    />
                  </div>
                </div>

                {/* Scheduling options */}
                <div className="border-t pt-4 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="should-schedule"
                      checked={shouldSchedule}
                      onCheckedChange={(checked) => setShouldSchedule(checked as boolean)}
                      data-testid="checkbox-should-schedule"
                    />
                    <Label htmlFor="should-schedule" className="cursor-pointer">
                      Запланировать этот платёж
                    </Label>
                  </div>

                  {shouldSchedule && (
                    <div className="space-y-4 pl-6 border-l-2 border-primary/30">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="schedule-recurring"
                          checked={scheduleRecurring}
                          onCheckedChange={(checked) => setScheduleRecurring(checked as boolean)}
                          data-testid="checkbox-schedule-recurring"
                        />
                        <Label htmlFor="schedule-recurring" className="cursor-pointer">
                          Сделать повторяющимся
                        </Label>
                      </div>

                      {scheduleRecurring && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="schedule-pattern">Периодичность</Label>
                            <select
                              id="schedule-pattern"
                              value={schedulePattern}
                              onChange={(e) => setSchedulePattern(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')}
                              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              data-testid="select-schedule-pattern"
                            >
                              <option value="daily">Ежедневно</option>
                              <option value="weekly">Еженедельно</option>
                              <option value="monthly">Ежемесячно</option>
                              <option value="yearly">Ежегодно</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="schedule-end-date">Дата окончания (необязательно)</Label>
                            <Input
                              id="schedule-end-date"
                              type="date"
                              value={scheduleEndDate ? scheduleEndDate.toISOString().split('T')[0] : ''}
                              onChange={(e) => setScheduleEndDate(e.target.value ? new Date(e.target.value) : null)}
                              data-testid="input-schedule-end-date"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="ghost" onClick={() => setTransactionDialogOpen(false)} data-testid="button-cancel-transaction">
                  Отмена
                </Button>
                <Button onClick={saveTransaction} data-testid="button-save-transaction">
                  {editingTransactionId ? 'Сохранить' : 'Добавить'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Goal Dialog */}
          <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
            <DialogContent data-testid="dialog-goal">
              <DialogHeader>
                <DialogTitle>{editingGoalId ? 'Редактировать цель' : 'Добавить цель'}</DialogTitle>
                <DialogDescription>
                  {editingGoalId ? 'Измените данные цели' : 'Создайте новую финансовую цель'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goal-name">Название цели</Label>
                  <Input
                    id="goal-name"
                    value={goalForm.name}
                    onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                    placeholder="Например: Отпуск в Грузии"
                    data-testid="input-goal-name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal-current">Текущая сумма</Label>
                    <Input
                      id="goal-current"
                      type="number"
                      value={goalForm.currentAmount || ''}
                      onChange={(e) => setGoalForm({ ...goalForm, currentAmount: Number(e.target.value) || 0 })}
                      placeholder="50000"
                      min="0"
                      data-testid="input-goal-current"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="goal-target">Целевая сумма</Label>
                    <Input
                      id="goal-target"
                      type="number"
                      value={goalForm.targetAmount || ''}
                      onChange={(e) => setGoalForm({ ...goalForm, targetAmount: Number(e.target.value) || 0 })}
                      placeholder="200000"
                      min="0"
                      data-testid="input-goal-target"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="goal-currency">Валюта</Label>
                  <select
                    id="goal-currency"
                    value={goalForm.currency}
                    onChange={(e) => setGoalForm({ ...goalForm, currency: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    data-testid="select-goal-currency"
                  >
                    <option value="RUB">RUB (₽)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GEL">GEL (₾)</option>
                    <option value="KZT">KZT (₸)</option>
                  </select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="ghost" onClick={() => setGoalDialogOpen(false)} data-testid="button-cancel-goal">
                  Отмена
                </Button>
                <Button onClick={saveGoal} data-testid="button-save-goal">
                  {editingGoalId ? 'Сохранить' : 'Добавить'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Budget Dialog */}
          <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
            <DialogContent data-testid="dialog-budget">
              <DialogHeader>
                <DialogTitle>{editingBudgetId ? 'Редактировать бюджет' : 'Добавить бюджет'}</DialogTitle>
                <DialogDescription>
                  {editingBudgetId ? 'Измените данные бюджета' : 'Создайте новый бюджет'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="budget-category">Категория</Label>
                  <Input
                    id="budget-category"
                    value={budgetForm.category}
                    onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
                    placeholder="Например: Еда"
                    data-testid="input-budget-category"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget-limit">Лимит</Label>
                    <Input
                      id="budget-limit"
                      type="number"
                      value={budgetForm.limit || ''}
                      onChange={(e) => setBudgetForm({ ...budgetForm, limit: Number(e.target.value) || 0 })}
                      placeholder="30000"
                      min="0"
                      data-testid="input-budget-limit"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="budget-spent">Потрачено</Label>
                    <Input
                      id="budget-spent"
                      type="number"
                      value={budgetForm.spent || ''}
                      onChange={(e) => setBudgetForm({ ...budgetForm, spent: Number(e.target.value) || 0 })}
                      placeholder="18500"
                      min="0"
                      data-testid="input-budget-spent"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget-currency">Валюта</Label>
                    <select
                      id="budget-currency"
                      value={budgetForm.currency}
                      onChange={(e) => setBudgetForm({ ...budgetForm, currency: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      data-testid="select-budget-currency"
                    >
                      <option value="RUB">RUB (₽)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GEL">GEL (₾)</option>
                      <option value="KZT">KZT (₸)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="budget-period">Период</Label>
                    <Input
                      id="budget-period"
                      value={budgetForm.period || ''}
                      onChange={(e) => setBudgetForm({ ...budgetForm, period: e.target.value })}
                      placeholder="Январь"
                      data-testid="input-budget-period"
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="ghost" onClick={() => setBudgetDialogOpen(false)} data-testid="button-cancel-budget">
                  Отмена
                </Button>
                <Button onClick={saveBudget} data-testid="button-save-budget">
                  {editingBudgetId ? 'Сохранить' : 'Добавить'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Category Dialog */}
          <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
            <DialogContent data-testid="dialog-category">
              <DialogHeader>
                <DialogTitle>{editingCategoryId ? 'Редактировать категорию' : 'Добавить категорию'}</DialogTitle>
                <DialogDescription>
                  {editingCategoryId ? 'Измените данные категории' : 'Создайте новую категорию'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category-name">Название категории</Label>
                  <Input
                    id="category-name"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="Например: Еда"
                    data-testid="input-category-name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category-type">Тип</Label>
                  <select
                    id="category-type"
                    value={categoryForm.type}
                    onChange={(e) => setCategoryForm({ ...categoryForm, type: e.target.value as 'income' | 'expense' })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    data-testid="select-category-type"
                  >
                    <option value="income">Доход</option>
                    <option value="expense">Расход</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="category-required"
                    checked={categoryForm.isRequired || false}
                    onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, isRequired: checked as boolean })}
                    data-testid="checkbox-category-required"
                  />
                  <Label htmlFor="category-required" className="cursor-pointer">
                    Обязательная категория расходов
                  </Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="ghost" onClick={() => setCategoryDialogOpen(false)} data-testid="button-cancel-category">
                  Отмена
                </Button>
                <Button onClick={saveCategory} data-testid="button-save-category">
                  {editingCategoryId ? 'Сохранить' : 'Добавить'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Transfer Dialog */}
          <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
            <DialogContent data-testid="dialog-transfer">
              <DialogHeader>
                <DialogTitle>{editingTransferId ? 'Редактировать перевод' : 'Добавить перевод'}</DialogTitle>
                <DialogDescription>
                  {editingTransferId ? 'Измените данные перевода' : 'Создайте новый перевод между счетами'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="transfer-from">Со счёта</Label>
                    <Input
                      id="transfer-from"
                      value={transferForm.fromAccount}
                      onChange={(e) => setTransferForm({ ...transferForm, fromAccount: e.target.value })}
                      placeholder="Тинькофф"
                      data-testid="input-transfer-from"
                      list="account-list-from"
                    />
                    <datalist id="account-list-from">
                      {[...accounts, ...savings].map((acc) => (
                        <option key={acc.id} value={acc.name} />
                      ))}
                    </datalist>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="transfer-to">На счёт</Label>
                    <Input
                      id="transfer-to"
                      value={transferForm.toAccount}
                      onChange={(e) => setTransferForm({ ...transferForm, toAccount: e.target.value })}
                      placeholder="Накопительный"
                      data-testid="input-transfer-to"
                      list="account-list-to"
                    />
                    <datalist id="account-list-to">
                      {[...accounts, ...savings].map((acc) => (
                        <option key={acc.id} value={acc.name} />
                      ))}
                    </datalist>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="transfer-amount">Сумма</Label>
                    <Input
                      id="transfer-amount"
                      type="number"
                      value={transferForm.amount || ''}
                      onChange={(e) => setTransferForm({ ...transferForm, amount: Number(e.target.value) || 0 })}
                      placeholder="10000"
                      min="0"
                      data-testid="input-transfer-amount"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="transfer-currency">Валюта</Label>
                    <select
                      id="transfer-currency"
                      value={transferForm.currency}
                      onChange={(e) => setTransferForm({ ...transferForm, currency: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      data-testid="select-transfer-currency"
                    >
                      <option value="RUB">RUB (₽)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GEL">GEL (₾)</option>
                      <option value="KZT">KZT (₸)</option>
                      <option value="USDT">USDT</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="transfer-date">Дата</Label>
                  <Input
                    id="transfer-date"
                    type="date"
                    value={transferForm.date instanceof Date ? transferForm.date.toISOString().split('T')[0] : ''}
                    onChange={(e) => setTransferForm({ ...transferForm, date: new Date(e.target.value) })}
                    data-testid="input-transfer-date"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="transfer-description">Описание (опционально)</Label>
                    <Input
                      id="transfer-description"
                      value={transferForm.description || ''}
                      onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })}
                      placeholder="Пополнение накоплений"
                      data-testid="input-transfer-description"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="transfer-fee">Комиссия (необязательно)</Label>
                    <Input
                      id="transfer-fee"
                      type="number"
                      value={transferForm.fee || ''}
                      onChange={(e) => setTransferForm({ ...transferForm, fee: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      data-testid="input-transfer-fee"
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="ghost" onClick={() => setTransferDialogOpen(false)} data-testid="button-cancel-transfer">
                  Отмена
                </Button>
                <Button onClick={saveTransfer} data-testid="button-save-transfer">
                  {editingTransferId ? 'Сохранить' : 'Добавить'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
