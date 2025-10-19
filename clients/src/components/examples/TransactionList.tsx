import TransactionList, { Transaction } from '../TransactionList';

export default function TransactionListExample() {
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      type: 'income',
      category: 'Зарплата',
      amount: 85000,
      currency: 'RUB',
      account: 'Тинькофф',
      date: new Date('2024-01-15'),
      description: 'Зарплата за январь',
    },
    {
      id: '2',
      type: 'expense',
      category: 'Еда',
      amount: 3500,
      currency: 'RUB',
      account: 'Тинькофф',
      date: new Date('2024-01-14'),
    },
    {
      id: '3',
      type: 'expense',
      category: 'Транспорт',
      amount: 500,
      currency: 'RUB',
      account: 'Наличные',
      date: new Date('2024-01-13'),
    },
  ];

  return (
    <TransactionList
      transactions={mockTransactions}
      onDelete={(id) => console.log('Delete transaction:', id)}
      onAdd={() => console.log('Add transaction')}
    />
  );
}
