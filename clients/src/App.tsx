import { useState, useEffect, useMemo } from 'react';
import { AppSidebar } from './components/AppSidebar';
import { doc, setDoc, getDoc, collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { db, auth } from './firebaseConfig';
import { SidebarProvider } from "@/components/ui/sidebar";
import EnhancedDashboard from './components/EnhancedDashboard';
import EnhancedBusinessDashboard from './components/EnhancedBusinessDashboard';
import type { Transaction, Account, Budget, Goal, PlannedPayment } from './types';
import { calculateMultiCurrencyTotal, groupByCurrency } from './lib/currency';
import { LoadingSpinner } from './components/LoadingSpinner'; // Импортируем наш лоадер

// --- Main App component ---
export function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [appData, setAppData] = useState({
    activeTab: 'dashboard',
    currentSpace: 'personal' as 'personal' | 'business',
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [plannedPayments, setPlannedPayments] = useState<PlannedPayment[]>([]);

  // --- Эффекты для загрузки данных ---

  // Эффект для входа (аутентификации)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setUserId(user.uid);
      } else {
        signInAnonymously(auth).catch(error => console.error("Anonymous sign-in failed:", error));
      }
    });
    return () => unsubscribe();
  }, []);

  // Эффект для загрузки настроек (вкладка, пространство)
  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    setIsInitialLoad(true);

    const docRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().appData) {
        setAppData(prevData => ({ ...prevData, ...docSnap.data().appData }));
        console.log("App data loaded.");
      } else {
        console.log("No previous app data found. Using default state.");
      }
      // Не убираем isLoading здесь, ждем все данные
      setTimeout(() => setIsInitialLoad(false), 500); // Позволяем сохранять изменения вскоре после загрузки настроек
    });
    
    return () => unsubscribe();
  }, [userId]);

  // Универсальный эффект для загрузки коллекций
  useEffect(() => {
    if (!userId || !appData.currentSpace) return;

    let activeSubscriptions = 0;
    const expectedSubscriptions = 5; // Сколько коллекций мы грузим
    setIsLoading(true); // Ставим загрузку в начале

    // Функция-помощник для подписки на коллекцию
    const subscribeToCollection = <T,>(collectionName: string, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
      const collRef = collection(db, 'users', userId, collectionName);
      const q = query(collRef, where("space", "==", appData.currentSpace));

      return onSnapshot(q, (snapshot) => {
        activeSubscriptions++; // Увеличиваем счетчик при получении данных
        const items = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date instanceof Timestamp ? data.date.toDate() : (data.date ? new Date(data.date) : undefined),
            dueDate: data.dueDate instanceof Timestamp ? data.dueDate.toDate() : (data.dueDate ? new Date(data.dueDate) : undefined),
          } as T;
        });
        
        if (collectionName === 'transactions') {
          (items as Transaction[]).sort((a, b) => (b.date as Date).getTime() - (a.date as Date).getTime());
        }
        
        setter(items);
        console.log(`${collectionName} loaded for ${appData.currentSpace} space.`);
        
        // Если все подписки активны (т.е. загрузились хотя бы раз), убираем загрузку
        if (activeSubscriptions >= expectedSubscriptions) {
          setIsLoading(false);
        }

      }, (error) => {
        activeSubscriptions++; // Считаем ошибку как "завершенную" подписку, чтобы не висеть вечно
        console.error(`Error fetching ${collectionName}:`, error);
        if (activeSubscriptions >= expectedSubscriptions) {
          setIsLoading(false);
        }
      });
    };

    // Подписываемся на все коллекции
    const unsubTransactions = subscribeToCollection<Transaction>('transactions', setTransactions);
    const unsubAccounts = subscribeToCollection<Account>('accounts', setAccounts);
    const unsubBudgets = subscribeToCollection<Budget>('budgets', setBudgets);
    const unsubGoals = subscribeToCollection<Goal>('goals', setGoals);
    const unsubPlannedPayments = subscribeToCollection<PlannedPayment>('plannedPayments', setPlannedPayments);

    // Отписываемся от всего при выходе
    return () => {
      unsubTransactions();
      unsubAccounts();
      unsubBudgets();
      unsubGoals();
      unsubPlannedPayments();
    };
  }, [userId, appData.currentSpace]);

  // Эффект для сохранения настроек
  useEffect(() => {
    if (isInitialLoad || !userId) return;

    const handler = setTimeout(() => {
      const docRef = doc(db, 'users', userId);
      setDoc(docRef, { appData: { activeTab: appData.activeTab, currentSpace: appData.currentSpace } }, { merge: true })
        .then(() => { console.log('General app data saved.'); })
        .catch(error => console.error("Error saving app data:", error));
    }, 1000);

    return () => clearTimeout(handler);
  }, [appData.activeTab, appData.currentSpace, userId, isInitialLoad]);

  // --- Расчеты ---
  const totalBalanceByCurrency = useMemo(() => groupByCurrency(accounts), [accounts]);
  const totalBalance = useMemo(() => calculateMultiCurrencyTotal(accounts.map(a => ({ amount: a.balance, currency: a.currency })), 'RUB'), [accounts]);
  const [income, expenses, savings] = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyTransactions = transactions.filter(t => (t.date as Date) >= startOfMonth);
    const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + calculateMultiCurrencyTotal([{ amount: t.amount, currency: t.currency }], 'RUB'), 0);
    const monthlyExpenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + calculateMultiCurrencyTotal([{ amount: t.amount, currency: t.currency }], 'RUB'), 0);
    return [monthlyIncome, monthlyExpenses, monthlyIncome - monthlyExpenses];
  }, [transactions]);
  const goalsCount = useMemo(() => goals.length, [goals]);

  // --- Обработчики ---
  const handleTabChange = (tab: string) => setAppData(prevData => ({ ...prevData, activeTab: tab }));
  const handleSpaceChange = (space: 'personal' | 'business') => {
    // Сбрасываем все данные
    setTransactions([]); setAccounts([]); setBudgets([]); setGoals([]); setPlannedPayments([]);
    setIsLoading(true); // Показываем загрузку
    setAppData(prevData => ({ ...prevData, currentSpace: space, activeTab: 'dashboard' }));
  }

  // --- Рендер ---
  if (isLoading) { // Показываем лоадер, пока isLoading === true
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
          <AppSidebar
            activeTab={appData.activeTab}
            onTabChange={handleTabChange}
            currentSpace={appData.currentSpace}
          />
          {/* --- ВОТ ИЗМЕНЕНИЯ --- */}
          <main className="flex-1 overflow-auto">
            {/* Переключатель Личное/Бизнес - оставляем его во всю ширину */}
            <div className="p-4 border-b border-border sticky top-0 bg-background z-10">
                <div className="flex items-center justify-center gap-2 bg-gray-800 p-1 rounded-lg max-w-xs mx-auto">
                    <button onClick={() => handleSpaceChange('personal')} className={`w-full py-2 px-4 rounded-md text-sm font-semibold ${appData.currentSpace === 'personal' ? 'bg-primary text-white' : 'text-gray-300'}`}>Личное</button>
                    <button onClick={() => handleSpaceChange('business')} className={`w-full py-2 px-4 rounded-md text-sm font-semibold ${appData.currentSpace === 'business' ? 'bg-primary text-white' : 'text-gray-300'}`}>Бизнес</button>
                </div>
            </div>

            {/* Контейнер для основного контента с отступами и ограничением ширины */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {appData.currentSpace === 'personal' ? (
                <EnhancedDashboard
                  activeTab={appData.activeTab}
                  userId={userId}
                  transactions={transactions}
                  totalBalance={totalBalance}
                  totalBalanceByCurrency={totalBalanceByCurrency}
                  income={income}
                  expenses={expenses}
                  savings={savings}
                  goalsCount={goalsCount}
                  payments={plannedPayments}
                  budgets={budgets}
                />
              ) : (
                <EnhancedBusinessDashboard
                  activeTab={appData.activeTab}
                  userId={userId}
                  transactions={transactions}
                  totalBalance={totalBalance}
                  totalBalanceByCurrency={totalBalanceByCurrency}
                  income={income}
                  expenses={expenses}
                  netProfit={savings}
                  // taxPayments={...}
                />
              )}
            </div>
             {/* --- КОНЕЦ ИЗМЕНЕНИЙ --- */}
          </main>
      </div>
    </SidebarProvider>
  );
}
