import type { CurrencyCode } from './currency';
import { formatCurrency } from './currency';

/**
 * Format a USD price in the user's selected currency.
 * Falls back to USD if no currency is provided.
 */
export function formatPrice(usdPrice: number, currency: CurrencyCode = 'USD'): string {
    return formatCurrency(usdPrice, currency);
}
