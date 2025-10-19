import { Button } from "@/components/ui/button";

interface FinanceNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'dashboard', label: 'Дашборд' },
  { id: 'transactions', label: 'Транзакции' },
  { id: 'accounts', label: 'Счета' },
  { id: 'savings', label: 'Накопления' },
  { id: 'planner', label: 'Календарь платежей' },
  { id: 'budgets-goals', label: 'Бюджеты и цели' },
  { id: 'settings', label: 'Настройки' },
];

export default function FinanceNav({ activeTab, onTabChange }: FinanceNavProps) {
  return (
    <div className="mb-8 border-b border-border">
      <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto scrollbar-hide" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            data-testid={`tab-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-foreground border-primary font-semibold'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
