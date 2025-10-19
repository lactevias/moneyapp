// Currency conversion utilities for Nina's multi-currency finances

export interface ExchangeRates {
  RUB: number;
  GEL: number;
  USD: number;
  KZT: number;
}

// Default fallback rates (will be replaced by live API data)
export const defaultRates: ExchangeRates = {
  RUB: 1,
  GEL: 30,      // 1 GEL = 30 RUB
  USD: 92,      // 1 USD = 92 RUB
  KZT: 0.2,     // 1 KZT = 0.2 RUB
};

export const currencySymbols: Record<string, string> = {
  RUB: '₽',
  GEL: '₾',
  USD: '$',
  KZT: '₸',
  USDT: 'USDT',
};

// Convert any currency to RUB using exchange rates
export function convertToRUB(amount: number, currency: string, rates: ExchangeRates = defaultRates): number {
  if (currency === 'RUB') return amount;
  const rate = rates[currency as keyof ExchangeRates];
  return amount * (rate || 1);
}

// Convert from RUB to any currency using exchange rates
export function convertFromRUB(amountInRUB: number, targetCurrency: string, rates: ExchangeRates = defaultRates): number {
  if (targetCurrency === 'RUB') return amountInRUB;
  const rate = rates[targetCurrency as keyof ExchangeRates];
  return amountInRUB / (rate || 1);
}

// Convert between any two currencies
export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string, rates: ExchangeRates = defaultRates): number {
  if (fromCurrency === toCurrency) return amount;
  const amountInRUB = convertToRUB(amount, fromCurrency, rates);
  return convertFromRUB(amountInRUB, toCurrency, rates);
}

// Fetch live exchange rates from API
export async function fetchExchangeRates(): Promise<ExchangeRates> {
  try {
    const response = await fetch('https://api.exchangerate.host/latest?base=RUB&symbols=GEL,USD,KZT');
    const data = await response.json();
    
    if (data.success && data.rates) {
      // API returns rates from RUB, but we need rates TO RUB
      // So we invert the rates
      return {
        RUB: 1,
        GEL: 1 / (data.rates.GEL || 0.033),  // Invert to get RUB per GEL
        USD: 1 / (data.rates.USD || 0.011),  // Invert to get RUB per USD
        KZT: 1 / (data.rates.KZT || 5),      // Invert to get RUB per KZT
      };
    }
    
    return defaultRates;
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    return defaultRates;
  }
}

// Format currency with proper symbol
export function formatCurrency(amount: number, currency: string): string {
  const symbol = currencySymbols[currency] || currency;
  
  if (currency === 'USDT') {
    return `${amount.toFixed(2)} USDT`;
  }

  try {
    const options: Intl.NumberFormatOptions = { 
      style: 'currency', 
      currency,
      minimumFractionDigits: currency === 'RUB' ? 0 : 2,
      maximumFractionDigits: currency === 'RUB' ? 0 : 2,
    };
    return new Intl.NumberFormat('ru-RU', options).format(amount);
  } catch {
    return `${amount.toFixed(currency === 'RUB' ? 0 : 2)} ${symbol}`;
  }
}

// Calculate total across multiple currencies, converting to base currency (RUB)
export function calculateMultiCurrencyTotal(
  items: Array<{ amount: number; currency: string }>,
  rates: ExchangeRates = defaultRates
): number {
  return items.reduce((total, item) => {
    return total + convertToRUB(item.amount, item.currency, rates);
  }, 0);
}

// Group amounts by currency
export function groupByCurrency(
  items: Array<{ amount: number; currency: string }>
): Record<string, number> {
  return items.reduce((acc, item) => {
    acc[item.currency] = (acc[item.currency] || 0) + item.amount;
    return acc;
  }, {} as Record<string, number>);
}
