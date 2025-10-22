import { Timestamp } from 'firebase/firestore';

export type Space = 'personal' | 'business';

export interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
  type: 'regular' | 'crypto' | 'savings';
  space: Space;
  createdAt?: Timestamp; // Добавлено для сортировки, если нужно
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  currency: string; // Валюта транзакции
  account: string; // Название счета (или ID счета, если структура другая)
  accountId: string; // ID счета, к которому привязана транзакция
  date: Date | Timestamp; // Может быть Date или Timestamp из Firebase
  description?: string;
  space: Space;
  createdAt?: Timestamp; // Добавлено для сортировки, если нужно
  // Дополнительные поля, если они есть в Firebase
  fee?: number;
  transactionCurrency?: string; // Если валюта транзакции отличается от валюты счета
}

export interface Budget {
  id: string;
  category: string;
  amount: number; // Лимит бюджета
  space: Space;
  createdAt?: Timestamp; // Добавлено для сортировки, если нужно
  // Поле 'spent' лучше рассчитывать на лету, а не хранить
}

export interface Goal {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  space: Space;
  createdAt?: Timestamp; // Добавлено для сортировки, если нужно
  currency?: string; // Валюта цели, если она отличается
}

export interface PlannedPayment {
  id: string;
  description: string; // Название платежа
  amount: number;
  currency: string;
  date: Date | Timestamp; // Дата следующего платежа
  category: string;
  accountId: string; // ID счета для списания
  space: Space;
  recurring?: boolean; // Повторяющийся?
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly'; // Периодичность
  endDate?: Date | Timestamp; // Дата окончания повторений
  isRequired?: boolean; // Обязательный платеж?
  status?: 'planned' | 'confirmed'; // Статус (запланирован / выполнен)
  createdAt?: Timestamp;
}

export interface RecurringPayment {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  accountId: string;
  dayOfMonth: number; // День месяца для списания/зачисления
  space: Space;
  createdAt?: Timestamp;
}

export interface TaxPayment {
  id: string;
  name: string;
  amount: number;
  dueDate: Date | Timestamp; // Срок уплаты
  isPaid: boolean;
  space: Space; // Должно быть 'business'
  createdAt?: Timestamp;
}

// Тип для формы AI ассистента
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Тип для переводов (если есть отдельная сущность)
export interface MoneyTransfer {
  id: string;
  fromAccount: string; // Название или ID счета
  toAccount: string;   // Название или ID счета
  amount: number;
  currency: string;
  date: Date | Timestamp;
  description?: string;
  fee?: number;
  space: Space;
  createdAt?: Timestamp;
}

 // Тип для долгов
export interface Debt {
  id: string;
  type: 'i_owe' | 'owed_to_me'; // Я должен / Мне должны
  person: string; // Кому / От кого
  amount: number;
  currency: string;
  description?: string;
  dueDate?: Date | Timestamp; // Срок возврата
  isPaid: boolean; // Погашен ли долг
  space: Space;
  createdAt?: Timestamp;
}
