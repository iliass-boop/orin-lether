/**
 * Shared currency formatter for Orin Leather.
 * All USD price formatting should use this utility.
 */
const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
});

export function formatPrice(price: number): string {
    return formatter.format(price);
}
