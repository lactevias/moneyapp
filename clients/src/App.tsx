import { useState, useEffect } from 'react';
import { AppSidebar } from './components/AppSidebar';
import { doc, setDoc, getDoc, collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { db, auth } from './firebaseConfig';
import { SidebarProvider } from "@/components/ui/sidebar";
import EnhancedDashboard from './components/EnhancedDashboard';
import EnhancedBusinessDashboard from './components/EnhancedBusinessDashboard';
import type { Transaction } from './types'; // <-- ИЗМЕНЕНИЕ 1

// Main App component that manages state
export function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [appData, setAppData] = useState({
    activeTab: 'dashboard',
    currentSpace: 'personal' as 'personal' | 'business',
    // We store non-transaction app state here
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]); // 

  // Effect for handling authentication
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

  // Effect for loading general app data (like current tab/space) from Firestore
  useEffect(() => {
    if (!userId) return;
    setIsLoading(true); // Start loading when user ID is available
    setIsInitialLoad(true); // Reset initial load flag

    const loadData = async () => {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().appData) {
        setAppData(prevData => ({ ...prevData, ...docSnap.data().appData }));
        console.log("App data loaded from Firestore.");
      } else {
        console.log("No previous app data found. Using default state.");
      }
      // Don't set isLoading to false here, wait for transactions too
      // Mark initial load complete after a short delay to allow saving
      setTimeout(() => setIsInitialLoad(false), 500);
    };

    loadData();
  }, [userId]);

  // Effect for loading TRANSACTIONS from Firestore in real-time
  useEffect(() => {
    if (!userId || !appData.currentSpace) return;

    // Start loading only after user ID and current space are known
    setIsLoading(true);

    const transactionsRef = collection(db, 'users', userId, 'transactions');
    const q = query(transactionsRef, where("space", "==", appData.currentSpace));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTransactions = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convert Firestore Timestamp back to JS Date
          date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
        } as Transaction;
      }).sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort newest first

      setTransactions(fetchedTransactions);
      console.log(`Transactions loaded for ${appData.currentSpace} space.`);
      setIsLoading(false); // Set loading false only after transactions are fetched
    }, (error) => {
      console.error("Error fetching transactions:", error);
      setIsLoading(false); // Stop loading on error
    });

    // Cleanup listener on unmount or when space/user changes
    return () => unsubscribe();
  }, [userId, appData.currentSpace]); // Re-run when user or space changes


  // Effect for saving general app data (tab/space) to Firestore (debounced)
  useEffect(() => {
    if (isInitialLoad || !userId) return;

    const handler = setTimeout(() => {
      const docRef = doc(db, 'users', userId);
      // Only save the general app data, not transactions
      setDoc(docRef, { appData: { activeTab: appData.activeTab, currentSpace: appData.currentSpace } }, { merge: true })
        .then(() => {
          console.log('General app data saved.');
        })
        .catch(error => console.error("Error saving app data:", error));
    }, 1000);

    return () => clearTimeout(handler);
  }, [appData.activeTab, appData.currentSpace, userId, isInitialLoad]); // Depend only on savable data

  const handleTabChange = (tab: string) => {
    setAppData(prevData => ({ ...prevData, activeTab: tab }));
  };

  const handleSpaceChange = (space: 'personal' | 'business') => {
    // Reset transactions when changing space to avoid showing old data briefly
    setTransactions([]);
    // Set loading state while space-specific data loads
    setIsLoading(true);
    setAppData(prevData => ({ ...prevData, currentSpace: space, activeTab: 'dashboard' }));
  }

  if (isLoading) {
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
              {/* Placeholder for mode toggle buttons */}
              <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-center gap-2 bg-gray-800 p-1 rounded-lg max-w-xs mx-auto">
                      <button onClick={() => handleSpaceChange('personal')} className={`w-full py-2 px-4 rounded-md text-sm font-semibold ${appData.currentSpace === 'personal' ? 'bg-primary text-white' : 'text-gray-300'}`}>Личное</button>
                      <button onClick={() => handleSpaceChange('business')} className={`w-full py-2 px-4 rounded-md text-sm font-semibold ${appData.currentSpace === 'business' ? 'bg-primary text-white' : 'text-gray-300'}`}>Бизнес</button>
                  </div>
              </div>

              {appData.currentSpace === 'personal' ? (
                <EnhancedDashboard
                  activeTab={appData.activeTab}
                  userId={userId}
                  transactions={transactions} 
                  // Pass other necessary props like totalBalance, income, expenses etc.
                  // These might need to be calculated based on transactions and accounts
                />
              ) : (
                <EnhancedBusinessDashboard
                  activeTab={appData.activeTab}
                  userId={userId}
                  transactions={transactions} 
                  // Pass business-specific props
                />
              )}

          </main>
      </div>
    </SidebarProvider>
  );
}
