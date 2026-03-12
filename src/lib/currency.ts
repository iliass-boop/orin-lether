/* ============================================================
   Orin Leather — Currency Utilities

   Supported currencies: USD, EUR, GBP, JPY, MAD
   Exchange rates are static with a daily refresh hook baked in.
   For live rates, replace RATES with a fetch from:
     https://api.exchangerate-api.com/v4/latest/USD (free tier)
   ============================================================ */

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'MAD';

export interface Currency {
    code: CurrencyCode;
    symbol: string;
    flag: string;
    name: string;
    /** Approximate rate vs USD. Replace with live API for production. */
    rate: number;
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
    USD: { code: 'USD', symbol: '$', flag: '🇺🇸', name: 'US Dollar', rate: 1 },
    EUR: { code: 'EUR', symbol: '€', flag: '🇪🇺', name: 'Euro', rate: 0.92 },
    GBP: { code: 'GBP', symbol: '£', flag: '🇬🇧', name: 'British Pound', rate: 0.79 },
    JPY: { code: 'JPY', symbol: '¥', flag: '🇯🇵', name: 'Japanese Yen', rate: 150.1 },
    MAD: { code: 'MAD', symbol: 'د.م.', flag: '🇲🇦', name: 'Moroccan Dirham', rate: 10.0 },
};

/**
 * Convert a price in USD to the target currency.
 * @param usdPrice - price in USD (dollars, not cents)
 * @param currency - target currency code
 */
export function convertPrice(usdPrice: number, currency: CurrencyCode): number {
    return usdPrice * CURRENCIES[currency].rate;
}

/**
 * Format a price with proper locale, symbol, and decimal rules.
 * JPY has no decimal places; MAD uses Arabic locale.
 */
export function formatCurrency(usdPrice: number, currency: CurrencyCode): string {
    const converted = convertPrice(usdPrice, currency);

    const localeMap: Record<CurrencyCode, string> = {
        USD: 'en-US',
        EUR: 'fr-FR',
        GBP: 'en-GB',
        JPY: 'ja-JP',
        MAD: 'fr-MA',
    };

    return new Intl.NumberFormat(localeMap[currency], {
        style: 'currency',
        currency,
        maximumFractionDigits: currency === 'JPY' ? 0 : 2,
    }).format(converted);
}

/** Convert a USD price to the target currency in cents (for Stripe). */
export function toCents(usdPrice: number, currency: CurrencyCode): number {
    const converted = convertPrice(usdPrice, currency);
    // JPY is a zero-decimal currency — Stripe expects whole numbers
    return currency === 'JPY' ? Math.round(converted) : Math.round(converted * 100);
}

/** Zero-decimal currencies (Stripe does not multiply by 100). */
export const ZERO_DECIMAL_CURRENCIES: CurrencyCode[] = ['JPY'];
