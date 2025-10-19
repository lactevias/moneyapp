import FinanceHeader from '../FinanceHeader';

export default function FinanceHeaderExample() {
  const mockSpaces = [
    { id: '1', name: 'Личное', type: 'personal' as const },
    { id: '2', name: 'Бизнес', type: 'business' as const },
  ];

  return (
    <FinanceHeader
      spaces={mockSpaces}
      currentSpaceId="1"
      onSpaceChange={(id) => console.log('Space changed to:', id)}
      userId="user123456789"
      appId="finance-app-v1"
    />
  );
}
