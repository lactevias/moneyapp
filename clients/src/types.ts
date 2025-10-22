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
  account: string; // Keep this if components rely on it
  accountId: string; // The ID is more reliable
  date: Date | Timestamp; // Can be Date or Timestamp from Firebase
  description?: string;
  space: Space;
  createdAt?: Timestamp;
  fee?: number;
  transactionCurrency?: string; // If transaction currency differs
}

export interface Budget {
  id: string;
  category: string;
  amount: number; // Budget limit
  space: Space;
  createdAt?: Timestamp;
  // 'spent' is better calculated on the fly, not stored
  // For BudgetCard compatibility if needed:
  limit?: number; // Alias for amount
  spent?: number; // Calculated value
  period?: string; // Calculated value
}

export interface Goal {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  space: Space;
  createdAt?: Timestamp;
  currency?: string; // Goal currency if different
}

export interface PlannedPayment {
  id: string;
  description: string; // Payment name/title
  amount: number;
  currency: string;
  date: Date | Timestamp; // Next payment date
  category: string;
  accountId: string; // Account ID for deduction
  space: Space;
  recurring?: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  endDate?: Date | Timestamp;
  isRequired?: boolean;
  status?: 'planned' | 'confirmed';
  createdAt?: Timestamp;
   // For compatibility with components expecting 'title'
  title?: string;
}

export interface RecurringPayment {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  accountId: string;
  dayOfMonth: number; // Day of month for execution
  space: Space;
  createdAt?: Timestamp;
}

export interface TaxPayment {
  id: string;
  name: string;
  amount: number;
  dueDate: Date | Timestamp; // Due date
  isPaid: boolean;
  space: Space; // Should be 'business'
  createdAt?: Timestamp;
}

// Type for AI Assistant form
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Type for transfers (if a separate entity exists)
export interface MoneyTransfer {
  id: string;
  fromAccount: string; // Account name or ID
  toAccount: string;   // Account name or ID
  amount: number;
  currency: string;
  date: Date | Timestamp;
  description?: string;
  fee?: number;
  space: Space;
  createdAt?: Timestamp;
}

// Type for debts
export interface Debt {
  id: string;
  type: 'i_owe' | 'owed_to_me'; // I owe / Owed to me
  person: string; // To whom / From whom
  amount: number;
  currency: string;
  description?: string;
  dueDate?: Date | Timestamp; // Return date
  isPaid: boolean; // Is the debt settled?
  space: Space;
  createdAt?: Timestamp;
}
