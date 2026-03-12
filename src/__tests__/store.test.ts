import { describe, test, expect, beforeEach } from 'vitest';
import { useCartStore, products, type Product } from '@/lib/store';

/* ============================================================
   Cart Store Unit Tests
   Skills: testing-qa, tdd-workflow
   
   Tests: addItem, removeItem, updateQuantity, totalPrice,
          totalItems, wishlist, clearCart, edge cases
   ============================================================ */

// Helper: get a fresh product for testing
const testProduct: Product = products[0]!; // The Drifter
const testProduct2: Product = products[3]!; // The Ridge

describe('Cart Store', () => {
    beforeEach(() => {
        // Reset store between tests
        useCartStore.setState({
            items: [],
            isOpen: false,
            wishlist: [],
            currency: 'USD',
        });
    });

    // ── addItem ───────────────────────────────────────────────────────
    test('addItem adds a product to the cart', () => {
        const { addItem } = useCartStore.getState();
        addItem(testProduct);

        const { items } = useCartStore.getState();
        expect(items).toHaveLength(1);
        expect(items[0]!.product.id).toBe('the-drifter');
        expect(items[0]!.quantity).toBe(1);
    });

    test('addItem increments quantity if product already exists', () => {
        const { addItem } = useCartStore.getState();
        addItem(testProduct);
        addItem(testProduct);

        const { items } = useCartStore.getState();
        expect(items).toHaveLength(1);
        expect(items[0]!.quantity).toBe(2);
    });

    test('addItem respects custom quantity', () => {
        const { addItem } = useCartStore.getState();
        addItem(testProduct, 3);

        const { items } = useCartStore.getState();
        expect(items[0]!.quantity).toBe(3);
    });

    test('addItem opens the cart drawer', () => {
        const { addItem } = useCartStore.getState();
        addItem(testProduct);

        expect(useCartStore.getState().isOpen).toBe(true);
    });

    // ── removeItem ────────────────────────────────────────────────────
    test('removeItem removes a product from the cart', () => {
        const { addItem } = useCartStore.getState();
        addItem(testProduct);
        addItem(testProduct2);

        useCartStore.getState().removeItem('the-drifter');

        const { items } = useCartStore.getState();
        expect(items).toHaveLength(1);
        expect(items[0]!.product.id).toBe('the-ridge');
    });

    test('removeItem does nothing for non-existent product', () => {
        const { addItem } = useCartStore.getState();
        addItem(testProduct);

        useCartStore.getState().removeItem('non-existent');

        expect(useCartStore.getState().items).toHaveLength(1);
    });

    // ── updateQuantity ────────────────────────────────────────────────
    test('updateQuantity updates the quantity of a product', () => {
        const { addItem } = useCartStore.getState();
        addItem(testProduct);

        useCartStore.getState().updateQuantity('the-drifter', 5);

        expect(useCartStore.getState().items[0]!.quantity).toBe(5);
    });

    test('updateQuantity removes item when quantity is 0', () => {
        const { addItem } = useCartStore.getState();
        addItem(testProduct);

        useCartStore.getState().updateQuantity('the-drifter', 0);

        expect(useCartStore.getState().items).toHaveLength(0);
    });

    test('updateQuantity removes item when quantity is negative', () => {
        const { addItem } = useCartStore.getState();
        addItem(testProduct);

        useCartStore.getState().updateQuantity('the-drifter', -1);

        expect(useCartStore.getState().items).toHaveLength(0);
    });

    // ── totalItems & totalPrice ───────────────────────────────────────
    test('totalItems returns total count across all items', () => {
        const { addItem } = useCartStore.getState();
        addItem(testProduct, 2); // 2 × Drifter
        addItem(testProduct2, 3); // 3 × Ridge

        expect(useCartStore.getState().totalItems()).toBe(5);
    });

    test('totalPrice returns correct total in USD', () => {
        const { addItem } = useCartStore.getState();
        addItem(testProduct, 2); // 2 × $485 = $970
        addItem(testProduct2, 1); // 1 × $125

        expect(useCartStore.getState().totalPrice()).toBe(1095);
    });

    test('totalPrice returns 0 for empty cart', () => {
        expect(useCartStore.getState().totalPrice()).toBe(0);
    });

    // ── clearCart ──────────────────────────────────────────────────────
    test('clearCart removes all items', () => {
        const { addItem } = useCartStore.getState();
        addItem(testProduct);
        addItem(testProduct2);

        useCartStore.getState().clearCart();

        expect(useCartStore.getState().items).toHaveLength(0);
    });

    // ── Cart open/close ───────────────────────────────────────────────
    test('toggleCart toggles isOpen state', () => {
        useCartStore.getState().toggleCart();
        expect(useCartStore.getState().isOpen).toBe(true);

        useCartStore.getState().toggleCart();
        expect(useCartStore.getState().isOpen).toBe(false);
    });

    test('openCart and closeCart work correctly', () => {
        useCartStore.getState().openCart();
        expect(useCartStore.getState().isOpen).toBe(true);

        useCartStore.getState().closeCart();
        expect(useCartStore.getState().isOpen).toBe(false);
    });

    // ── Wishlist ──────────────────────────────────────────────────────
    test('toggleWishlist adds a product to wishlist', () => {
        useCartStore.getState().toggleWishlist('the-drifter');

        expect(useCartStore.getState().wishlist).toContain('the-drifter');
    });

    test('toggleWishlist removes a product from wishlist on second call', () => {
        useCartStore.getState().toggleWishlist('the-drifter');
        useCartStore.getState().toggleWishlist('the-drifter');

        expect(useCartStore.getState().wishlist).not.toContain('the-drifter');
    });

    // ── Currency ──────────────────────────────────────────────────────
    test('setCurrency updates the store currency', () => {
        useCartStore.getState().setCurrency('EUR');
        expect(useCartStore.getState().currency).toBe('EUR');
    });
});

// ── Product data integrity ────────────────────────────────────────────
describe('Product Data', () => {
    test('all products have required fields', () => {
        for (const product of products) {
            expect(product.id).toBeTruthy();
            expect(product.name).toBeTruthy();
            expect(product.price).toBeGreaterThan(0);
            expect(product.category).toMatch(/^(bags|wallets|accessories)$/);
            expect(product.image).toBeTruthy();
            expect(product.images.length).toBeGreaterThan(0);
            expect(product.description.length).toBeGreaterThan(20);
        }
    });

    test('all product IDs are unique', () => {
        const ids = products.map((p) => p.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
    });
});
