import { Timestamp } from 'firebase/firestore';

export type Space = 'personal' | 'business';

export interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
  type: 'regular' | 'crypto' | 'savings';
  space: Space;
  createdAt?: Timestamp;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  currency: string;
  account: string;
  accountId: string;
  date: Date | Timestamp;
  description?: string;
  space: Space;
  createdAt?: Timestamp;
  fee?: number;
  transactionCurrency?: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  space: Space;
  createdAt?: Timestamp;
}

export interface Goal {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  space: Space;
  createdAt?: Timestamp;
  currency?: string;
}

export interface PlannedPayment {
  id: string;
  description: string;
  amount: number;
  currency: string;
  date: Date | Timestamp;
  category: string;
  accountId: string;
  space: Space;
  recurring?: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  endDate?: Date | Timestamp;
  isRequired?: boolean;
  status?: 'planned' | 'confirmed';
  createdAt?: Timestamp;
}

export interface RecurringPayment {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  accountId: string;
  dayOfMonth: number;
  space: Space;
  createdAt?: Timestamp;
}

export interface TaxPayment {
  id: string;
  name: string;
  amount: number;
  dueDate: Date | Timestamp;
  isPaid: boolean;
  space: Space;
  createdAt?: Timestamp;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface MoneyTransfer {
  id: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  currency: string;
  date: Date | Timestamp;
  description?: string;
  fee?: number;
  space: Space;
  createdAt?: Timestamp;
}

export interface Debt {
  id: string;
  type: 'i_owe' | 'owed_to_me';
  person: string;
  amount: number;
  currency: string;
  description?: string;
  dueDate?: Date | Timestamp;
  isPaid: boolean;
  space: Space;
  createdAt?: Timestamp;
}
