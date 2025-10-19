import GoalCard, { Goal } from '../GoalCard';

export default function GoalCardExample() {
  const mockGoals: Goal[] = [
    { id: '1', name: 'Отпуск', currentAmount: 50000, targetAmount: 200000, currency: 'RUB' },
    { id: '2', name: 'Новый ноутбук', currentAmount: 30000, targetAmount: 150000, currency: 'RUB' },
    { id: '3', name: 'Автомобиль', currentAmount: 250000, targetAmount: 1000000, currency: 'RUB' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mockGoals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          onDelete={(id) => console.log('Delete goal:', id)}
          onAddFunds={(id) => console.log('Add funds to goal:', id)}
        />
      ))}
    </div>
  );
}
