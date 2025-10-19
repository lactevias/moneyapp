import AccountCard, { Account } from '../AccountCard';

export default function AccountCardExample() {
  const mockAccounts: Account[] = [
    { id: '1', name: 'Тинькофф', balance: 50000, currency: 'RUB', type: 'regular' },
    { id: '2', name: 'Crypto Wallet', balance: 500, currency: 'USDT', type: 'crypto' },
    { id: '3', name: 'Накопительный', balance: 125000, currency: 'RUB', type: 'savings' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mockAccounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          onEdit={(id) => console.log('Edit account:', id)}
          onDelete={(id) => console.log('Delete account:', id)}
        />
      ))}
    </div>
  );
}
