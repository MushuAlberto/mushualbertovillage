import { CurrencyCode } from '../types';

/**
 * Formats a numeric value into a currency string based on the provided currency code.
 * Uses 'es-ES' locale for number formatting conventions but applies the specified currency.
 * @param value The number to format.
 * @param currencyCode The currency code (e.g., 'USD', 'EUR', 'CLP').
 * @returns A string representing the formatted currency value.
 */
export const formatCurrency = (value: number, currencyCode: CurrencyCode): string => {
  return new Intl.NumberFormat('es-ES', { // Using 'es-ES' for general Spanish number formatting
    style: 'currency',
    currency: currencyCode,
    // minimumFractionDigits: currencyCode === 'CLP' ? 0 : 2, // CLP usually doesn't use decimals
    // maximumFractionDigits: currencyCode === 'CLP' ? 0 : 2,
  }).format(value);
};
