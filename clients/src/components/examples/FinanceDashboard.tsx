import FinanceDashboard from '../FinanceDashboard';

export default function FinanceDashboardExample() {
  const mockData = {
    totalBalance: '226 500 ₽',
    income: '85 000 ₽',
    expenses: '32 450 ₽',
    savings: '125 000 ₽',
    incomeChange: '+12% за месяц',
    expensesChange: '-8% к прошлому месяцу',
    goalsCount: 3,
  };

  return <FinanceDashboard data={mockData} />;
}
