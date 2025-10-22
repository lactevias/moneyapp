import { useState, useEffect, useMemo } from 'react'; // <-- 1. Добавили useMemo
import { AppSidebar } from './components/AppSidebar';
import { doc, setDoc, getDoc, collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { db, auth } from './firebaseConfig';
import { SidebarProvider } from "@/components/ui/sidebar";
import EnhancedDashboard from './components/EnhancedDashboard';
import EnhancedBusinessDashboard from './components/EnhancedBusinessDashboard';
// <-- 2. Импортируем все наши типы данных
import type { Transaction, Account, Budget, Goal, PlannedPayment } from './types'; 
// <-- 3. Импортируем функцию для расчета валют
import { calculateMultiCurrencyTotal, groupByCurrency } from './lib/currency'; 

// --- Main App component ---
export function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [appData, setAppData] = useState({
    activeTab: 'dashboard',
    currentSpace: 'personal' as 'personal' | 'business',
  });
  
  // <-- 4. Создаем состояния для ВСЕХ наших данных
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
      setTimeout(() => setIsInitialLoad(false), 500);
    });
    
    return () => unsubscribe();
  }, [userId]);

  // <-- 5. Универсальный эффект для загрузки коллекций (счетов, транзакций и т.д.)
  useEffect(() => {
    if (!userId || !appData.currentSpace) return;

    // Ставим "Загрузка..."
    setIsLoading(true);

    // Функция-помощник для подписки на коллекцию
    const subscribeToCollection = <T,>(collectionName: string, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
      const collRef = collection(db, 'users', userId, collectionName);
      const q = query(collRef, where("space", "==", appData.currentSpace));

      return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Конвертируем Timestamp из Firebase в JS Date
            date: data.date instanceof Timestamp ? data.date.toDate() : (data.date ? new Date(data.date) : undefined),
            dueDate: data.dueDate instanceof Timestamp ? data.dueDate.toDate() : (data.dueDate ? new Date(data.dueDate) : undefined),
          } as T;
        });
        
        // Для транзакций сортируем по дате
        if (collectionName === 'transactions') {
          (items as Transaction[]).sort((a, b) => (b.date as Date).getTime() - (a.date as Date).getTime());
        }
        
        setter(items);
        console.log(`${collectionName} loaded for ${appData.currentSpace} space.`);
      }, (error) => {
        console.error(`Error fetching ${collectionName}:`, error);
      });
    };

    // Подписываемся на все коллекции
    const unsubTransactions = subscribeToCollection<Transaction>('transactions', setTransactions);
    const unsubAccounts = subscribeToCollection<Account>('accounts', setAccounts);
    const unsubBudgets = subscribeToCollection<Budget>('budgets', setBudgets);
    const unsubGoals = subscribeToCollection<Goal>('goals', setGoals);
    const unsubPlannedPayments = subscribeToCollection<PlannedPayment>('plannedPayments', setPlannedPayments);

    // Убираем "Загрузка..."
    // (onSnapshot асинхронный, для простоты убираем загрузку сразу)
    // В идеале нужен счетчик, но этого хватит
    const timer = setTimeout(() => setIsLoading(false), 1500); // Даем 1.5с на загрузку

    // Отписываемся от всего при выходе
    return () => {
      unsubTransactions();
      unsubAccounts();
      unsubBudgets();
      unsubGoals();
      unsubPlannedPayments();
      clearTimeout(timer);
    };
  }, [userId, appData.currentSpace]); // Перезагружаем все, если поменялся пользователь или пространство

  // Эффект для сохранения настроек (вкладка, пространство)
  useEffect(() => {
    if (isInitialLoad || !userId) return;

    const handler = setTimeout(() => {
      const docRef = doc(db, 'users', userId);
      setDoc(docRef, { appData: { activeTab: appData.activeTab, currentSpace: appData.currentSpace } }, { merge: true })
        .then(() => {
          console.log('General app data saved.');
        })
        .catch(error => console.error("Error saving app data:", error));
    }, 1000);

    return () => clearTimeout(handler);
  }, [appData.activeTab, appData.currentSpace, userId, isInitialLoad]);

  
  // --- 6. Расчеты в реальном времени (наконец-то!) ---

  // Считаем балансы
  const totalBalanceByCurrency = useMemo(() => {
    return groupByCurrency(accounts);
  }, [accounts]);

  const totalBalance = useMemo(() => {
    // Конвертируем все балансы в RUB (или базовую валюту)
    const amounts = Object.entries(totalBalanceByCurrency)
                          .map(([currency, amount]) => ({ amount, currency }));
    return calculateMultiCurrencyTotal(amounts, 'RUB'); // Используем твою функцию
  }, [totalBalanceByCurrency]);

  // Считаем доходы/расходы за ТЕКУЩИЙ месяц
  const [income, expenses, savings] = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Фильтруем транзакции за этот месяц
    const monthlyTransactions = transactions.filter(t => (t.date as Date) >= startOfMonth);

    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + calculateMultiCurrencyTotal([{ amount: t.amount, currency: t.currency }], 'RUB'), 0);
      
    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + calculateMultiCurrencyTotal([{ amount: t.amount, currency: t.currency }], 'RUB'), 0);

    return [monthlyIncome, monthlyExpenses, monthlyIncome - monthlyExpenses];
  }, [transactions]);
  
  const goalsCount = useMemo(() => goals.length, [goals]);

  // --- Обработчики ---
  
  const handleTabChange = (tab: string) => {
    setAppData(prevData => ({ ...prevData, activeTab: tab }));
  };

  const handleSpaceChange = (space: 'personal' | 'business') => {
    // Сбрасываем все данные, чтобы не показывать старые
    setTransactions([]);
    setAccounts([]);
    setBudgets([]);
    setGoals([]);
    setPlannedPayments([]);
    setIsLoading(true); // Показываем загрузку
    setAppData(prevData => ({ ...prevData, currentSpace: space, activeTab: 'dashboard' }));
  }

  // --- Рендер компонента ---

  if (isLoading && !transactions.length) { // Показываем загрузку, пока не придет первая пачка данных
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50">
          <div className="text-white text-lg">Загрузка данных...</div>
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
          <main className="flex-1 overflow-auto">
              {/* Переключатель Личное/Бизнес */}
              <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-center gap-2 bg-gray-800 p-1 rounded-lg max-w-xs mx-auto">
                      <button onClick={() => handleSpaceChange('personal')} className={`w-full py-2 px-4 rounded-md text-sm font-semibold ${appData.currentSpace === 'personal' ? 'bg-primary text-white' : 'text-gray-300'}`}>Личное</button>
                      <button onClick={() => handleSpaceChange('business')} className={`w-full py-2 px-4 rounded-md text-sm font-semibold ${appData.currentSpace === 'business' ? 'bg-primary text-white' : 'text-gray-300'}`}>Бизнес</button>
                  </div>
              </div>

              {/* --- 7. Передаем настоящие данные в дашборды --- 
              */}
              {appData.currentSpace === 'personal' ? (
                <EnhancedDashboard
                  activeTab={appData.activeTab}
                  // @ts-ignore (userId может быть null на 1мс, это ок)
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
                  // @ts-ignore (userId может быть null на 1мс, это ок)
                  userId={userId} 
                  transactions={transactions}
                  totalBalance={totalBalance}
                  totalBalanceByCurrency={totalBalanceByCurrency}
                  income={income}
                  expenses={expenses}
                  netProfit={savings} // Для бизнеса "сбережения" = "чистая прибыль"
                  // taxPayments={...} // Мы это еще не загружали
                />
              )}

          </main>
      </div>
    </SidebarProvider>
  );
}
