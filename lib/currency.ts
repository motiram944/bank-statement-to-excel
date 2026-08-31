export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  rateToUSD: number; // 1 USD = rateToUSD target currency
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar ($)', rateToUSD: 1.0 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro (€)', rateToUSD: 0.92 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound (£)', rateToUSD: 0.79 },
  CAD: { code: 'CAD', symbol: '$', name: 'Canadian Dollar (CAD $)', rateToUSD: 1.36 },
  AUD: { code: 'AUD', symbol: '$', name: 'Australian Dollar (AUD $)', rateToUSD: 1.52 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)', rateToUSD: 155.0 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)', rateToUSD: 83.5 },
  CHF: { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc (CHF)', rateToUSD: 0.90 },
};

/**
 * Converts an amount from one currency to another using USD base conversion rates
 */
export function convertCurrency(
  amount: number | null,
  fromCurrencyCode: string = 'USD',
  toCurrencyCode: string = 'USD'
): number | null {
  if (amount === null || isNaN(amount)) return null;
  if (fromCurrencyCode === toCurrencyCode) return amount;

  const fromInfo = SUPPORTED_CURRENCIES[fromCurrencyCode] || SUPPORTED_CURRENCIES.USD;
  const toInfo = SUPPORTED_CURRENCIES[toCurrencyCode] || SUPPORTED_CURRENCIES.USD;

  // Convert to USD base first, then to target currency
  const amountInUSD = amount / fromInfo.rateToUSD;
  const converted = amountInUSD * toInfo.rateToUSD;

  return Math.round(converted * 100) / 100;
}

/**
 * Formats currency number with appropriate symbol
 */
export function formatCurrency(
  amount: number | null,
  currencyCode: string = 'USD'
): string {
  if (amount === null || isNaN(amount)) return '-';
  const info = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.USD;
  const formattedNum = Math.abs(amount).toFixed(2);
  const prefix = amount < 0 ? '-' : '';
  return `${prefix}${info.symbol}${formattedNum}`;
}
