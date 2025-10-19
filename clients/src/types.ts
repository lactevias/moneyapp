export type Space = 'personal' | 'business';

export interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
  type: 'regular' | 'crypto' | 'savings';
  space: Space;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  currency: string;
  transactionCurrency?: string;
  account: string;
  date: Date;
  description?: string;
  fee?: number;
  space: Space;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  currency?: string;
  period?: string;
  space: Space;
}

export interface Goal {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  currency?: string;
  space: Space;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  isRequired?: boolean;
  space: Space;
}

export interface MoneyTransfer {
  id: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  currency: string;
  date: Date;
  description?: string;
  fee?: number;
  space: Space;
}

export interface PlannedPayment {
  id: string;
  title: string;
  amount: number;
  currency: string;
  date: Date;
  category: string;
  account?: string;
  recurring?: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  lastGenerated?: Date;
  endDate?: Date;
  isRequired?: boolean;
  status?: 'planned' | 'confirmed';
  space: Space;
}

export interface Debt {
  id: string;
  type: 'i_owe' | 'owed_to_me';
  person: string;
  amount: number;
  currency: string;
  description?: string;
  dueDate?: Date;
  isPaid: boolean;
  space: Space;
}
