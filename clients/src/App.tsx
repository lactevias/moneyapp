import { useState, useEffect } from 'react';
import { AppSidebar } from './components/AppSidebar';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { db, auth } from './firebaseConfig';
import { SidebarProvider } from "@/components/ui/sidebar";

// A placeholder for your main content components
const MainContent = ({ activeTab, currentSpace }: { activeTab: string, currentSpace: string }) => {
  return (
    <div className="flex-1 p-8 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold">
        {currentSpace === 'personal' ? 'Личное пространство' : 'Бизнес пространство'}
      </h1>
      <p className="mt-4">Активная вкладка: <span className="font-semibold text-primary">{activeTab}</span></p>
      <div className="mt-8 p-6 bg-gray-800 rounded-lg">
        <p>Здесь будет отображаться содержимое для каждой вкладки.</p>
        <p className="mt-2 text-sm text-gray-400">Вам нужно будет создать компоненты для каждой страницы (Дашборд, Финансы и т.д.) и отображать их здесь в зависимости от `activeTab`.</p>
      </div>
    </div>
  );
};


// Main App component that manages state
export function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [appData, setAppData] = useState({
    activeTab: 'dashboard',
    currentSpace: 'personal' as 'personal' | 'business',
    // ... you can add any other data to save here, e.g., transactions: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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

  // Effect for loading data from Firestore
  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // Merge with default state to avoid errors if saved data is incomplete
        setAppData(prevData => ({ ...prevData, ...docSnap.data().appData }));
        console.log("Data loaded from Firestore.");
      } else {
        console.log("No previous data found. Using default state.");
      }
      setIsLoading(false);
      // After first load, we can start saving changes
      setTimeout(() => setIsInitialLoad(false), 500); 
    };

    loadData();
  }, [userId]);

  // Effect for saving data to Firestore (debounced)
  useEffect(() => {
    if (isInitialLoad || !userId) return;

    const handler = setTimeout(() => {
      const docRef = doc(db, 'users', userId);
      setDoc(docRef, { appData }).then(() => {
        console.log('Data saved.');
      });
    }, 1000); // Save 1 second after the last change

    return () => clearTimeout(handler);
  }, [appData, userId, isInitialLoad]);

  const handleTabChange = (tab: string) => {
    setAppData(prevData => ({ ...prevData, activeTab: tab }));
  };
  
  const handleSpaceChange = (space: 'personal' | 'business') => {
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
          <MainContent activeTab={appData.activeTab} currentSpace={appData.currentSpace} />
        </main>
      </div>
    </SidebarProvider>
  );
}
