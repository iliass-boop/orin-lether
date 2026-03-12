import { describe, test, expect } from 'vitest';
import { formatPrice } from '@/lib/formatPrice';
import { convertPrice, formatCurrency, toCents, CURRENCIES, ZERO_DECIMAL_CURRENCIES } from '@/lib/currency';

/* ============================================================
   Currency & Price Formatting Tests
   Skills: testing-qa
   
   Tests: convertPrice, formatCurrency, formatPrice, toCents,
          edge cases (zero, large values, all currencies)
   ============================================================ */

describe('convertPrice', () => {
    test('USD to USD returns same value', () => {
        expect(convertPrice(100, 'USD')).toBe(100);
    });

    test('converts to EUR using static rate', () => {
        expect(convertPrice(100, 'EUR')).toBeCloseTo(92, 0);
    });

    test('converts to JPY (no decimal)', () => {
        expect(convertPrice(100, 'JPY')).toBeCloseTo(15010, 0);
    });

    test('converts to MAD', () => {
        expect(convertPrice(100, 'MAD')).toBeCloseTo(1000, 0);
    });

    test('handles zero price', () => {
        expect(convertPrice(0, 'EUR')).toBe(0);
    });
});

describe('formatCurrency', () => {
    test('formats USD correctly', () => {
        const formatted = formatCurrency(100, 'USD');
        expect(formatted).toContain('$');
        expect(formatted).toContain('100');
    });

    test('formats EUR correctly', () => {
        const formatted = formatCurrency(100, 'EUR');
        expect(formatted).toContain('€');
    });

    test('formats GBP correctly', () => {
        const formatted = formatCurrency(100, 'GBP');
        expect(formatted).toContain('£');
    });

    test('formats JPY without decimals', () => {
        const formatted = formatCurrency(1, 'JPY');
        expect(formatted).not.toContain('.');
    });
});

describe('formatPrice', () => {
    test('defaults to USD when no currency specified', () => {
        const result = formatPrice(485);
        expect(result).toContain('$');
        expect(result).toContain('485');
    });

    test('formats in specified currency', () => {
        const result = formatPrice(485, 'GBP');
        expect(result).toContain('£');
    });
});

describe('toCents', () => {
    test('converts USD to cents correctly', () => {
        expect(toCents(10.50, 'USD')).toBe(1050);
        expect(toCents(485, 'USD')).toBe(48500);
    });

    test('handles GBP correctly', () => {
        // 100 USD -> 79 GBP -> 7900 pence (rate updated to 0.79)
        expect(toCents(100, 'GBP')).toBe(7900);
    });

    test('handles zero-decimal currencies (JPY)', () => {
        // 100 USD -> 15010 JPY -> 15010 (no cents for JPY)
        expect(toCents(100, 'JPY')).toBe(15010);
    });

    test('handles zero price', () => {
        expect(toCents(0, 'USD')).toBe(0);
    });

    test('rounds correctly for fractional amounts', () => {
        // 0.99 USD * 100 = 99 cents — must be exactly 99
        expect(toCents(0.99, 'USD')).toBe(99);
    });
});

describe('Currency configuration', () => {
    test('all currencies have required fields', () => {
        for (const [code, currency] of Object.entries(CURRENCIES)) {
            expect(currency.code).toBe(code);
            expect(currency.symbol).toBeTruthy();
            expect(currency.name).toBeTruthy();
            expect(currency.rate).toBeGreaterThan(0);
        }
    });

    test('JPY is a zero-decimal currency', () => {
        expect(ZERO_DECIMAL_CURRENCIES).toContain('JPY');
    });

    test('USD rate is 1', () => {
        expect(CURRENCIES.USD.rate).toBe(1);
    });
});
