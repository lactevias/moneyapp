import { useState } from 'react';
import FinanceNav from '../FinanceNav';

export default function FinanceNavExample() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <FinanceNav
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}
