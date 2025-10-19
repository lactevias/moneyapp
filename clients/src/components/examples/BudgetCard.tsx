import BudgetCard, { Budget } from '../BudgetCard';

export default function BudgetCardExample() {
  const mockBudgets: Budget[] = [
    { id: '1', category: 'Еда', limit: 30000, spent: 18500, currency: 'RUB', period: 'Январь' },
    { id: '2', category: 'Транспорт', limit: 10000, spent: 12000, currency: 'RUB', period: 'Январь' },
    { id: '3', category: 'Развлечения', limit: 15000, spent: 8200, currency: 'RUB', period: 'Январь' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mockBudgets.map((budget) => (
        <BudgetCard
          key={budget.id}
          budget={budget}
          onDelete={(id) => console.log('Delete budget:', id)}
        />
      ))}
    </div>
  );
}
