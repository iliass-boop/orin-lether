'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './CartDrawer.module.css';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/formatPrice';

export default function CartDrawer() {
    const { items, isOpen, closeCart, removeItem, updateQuantity, totalItems, totalPrice } = useCartStore();
    const drawerRef = useRef<HTMLElement>(null);
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    // Lock body scroll when cart is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Close on Escape key + focus trap
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                closeCart();
                return;
            }
            // Focus trap: constrain Tab within the drawer
            if (e.key === 'Tab' && isOpen && drawerRef.current) {
                const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
                    'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    }
                } else {
                    if (document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closeCart]);

    return (
        <>
            {/* Overlay */}
            <div
                className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
                onClick={closeCart}
                aria-hidden="true"
            />

            {/* Drawer */}
            <aside
                ref={drawerRef}
                className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}
                role="dialog"
                aria-modal="true"
                aria-label="Shopping cart"
            >
                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <span className={styles.title}>Your Cart</span>
                        <span className={styles.itemCount}>
                            {mounted ? totalItems() : 0} {(mounted ? totalItems() : 0) === 1 ? 'item' : 'items'}
                        </span>
                    </div>
                    <button className={styles.closeBtn} onClick={closeCart} aria-label="Close cart">
                        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Items or Empty State */}
                {!mounted || items.length === 0 ? (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>◇</div>
                        <h3 className={styles.emptyTitle}>Your cart is empty</h3>
                        <p className={styles.emptyText}>Time to discover something exceptional.</p>
                        <Link href="/products" className={styles.browseBtn} onClick={closeCart}>
                            Browse Collection
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className={styles.items}>
                            {items.map((item) => (
                                <div key={item.product.id} className={styles.item}>
                                    {/* Image */}
                                    <div className={styles.itemImage}>
                                        {item.product.images?.[0] ? (
                                            <Image
                                                src={item.product.images[0]}
                                                alt={item.product.name}
                                                fill
                                                className={styles.productImage}
                                                sizes="90px"
                                            />
                                        ) : (
                                            <div className={styles.placeholderImage}>
                                                {item.product.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className={styles.itemDetails}>
                                        <div className={styles.itemMeta}>
                                            <div className={styles.topRow}>
                                                <h4 className={styles.itemName}>{item.product.name}</h4>
                                                <p className={styles.itemPrice}>{formatPrice(item.product.price * item.quantity)}</p>
                                            </div>
                                            <p className={styles.itemColor}>{item.product.color.name}</p>
                                        </div>

                                        <div className={styles.itemActions}>
                                            <div className={styles.quantityControl}>
                                                <button
                                                    className={styles.quantityBtn}
                                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                    aria-label="Decrease quantity"
                                                >
                                                    −
                                                </button>
                                                <span className={styles.quantity}>{item.quantity}</span>
                                                <button
                                                    className={styles.quantityBtn}
                                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                    aria-label="Increase quantity"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                className={styles.removeBtn}
                                                onClick={() => removeItem(item.product.id)}
                                                aria-label={`Remove ${item.product.name}`}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className={styles.footer}>
                            <div className={styles.subtotalRow}>
                                <span className={styles.subtotalLabel}>Subtotal</span>
                                <span className={styles.subtotalValue}>{formatPrice(totalPrice())}</span>
                            </div>
                            <p className={styles.shippingNote}>Complimentary shipping on all orders</p>
                            <Link href="/checkout" className={styles.checkoutBtn} onClick={closeCart}>
                                Proceed to Checkout
                            </Link>
                        </div>
                    </>
                )}
            </aside>
        </>
    );
}
