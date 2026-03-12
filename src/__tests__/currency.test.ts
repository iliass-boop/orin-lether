import { test, expect } from 'vitest';
import { toCents } from '@/lib/currency';

test('toCents converts standard USD to cents correctly', () => {
    expect(toCents(10.50, 'USD')).toBe(1050);
    expect(toCents(485, 'USD')).toBe(48500);
});

test('toCents handles GBP correctly', () => {
    // 100 USD -> 79 GBP (rate 0.79) -> 7900 pence
    expect(toCents(100, 'GBP')).toBe(7900);
});

test('toCents handles zero-decimal currencies (JPY) correctly', () => {
    // 100 USD -> 15010 JPY (rate 150.1) -> 15010 (no cents multiplier for JPY)
    expect(toCents(100, 'JPY')).toBe(15010);
});
