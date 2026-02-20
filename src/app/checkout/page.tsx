'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { useCartStore } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCartStore();
    const { showToast } = useToast();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        // Simulate payment processing
        setTimeout(() => {
            setIsProcessing(false);
            clearCart();
            showToast('Order placed successfully!', 'success');
            router.push('/');
        }, 2000);
    };

    if (items.length === 0) {
        return (
            <div className={styles.page}>
                <div className={styles.container}>
                    <h1>Your cart is empty.</h1>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <form className={styles.formSection} onSubmit={handleSubmit}>
                    <h1>Checkout</h1>

                    <div className={styles.formGroup}>
                        <h2 className={styles.sectionTitle}>Contact Information</h2>
                        <div className={styles.inputWrapper}>
                            <label className={styles.label}>Email Address</label>
                            <input type="email" required className={styles.input} placeholder="jdoe@example.com" />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <h2 className={styles.sectionTitle}>Shipping Address</h2>
                        <div className={styles.inputGrid}>
                            <div className={styles.inputWrapper}>
                                <label className={styles.label}>First Name</label>
                                <input type="text" required className={styles.input} />
                            </div>
                            <div className={styles.inputWrapper}>
                                <label className={styles.label}>Last Name</label>
                                <input type="text" required className={styles.input} />
                            </div>
                        </div>
                        <div className={styles.inputWrapper}>
                            <label className={styles.label}>Address</label>
                            <input type="text" required className={styles.input} />
                        </div>
                        <div className={styles.inputGrid}>
                            <div className={styles.inputWrapper}>
                                <label className={styles.label}>City</label>
                                <input type="text" required className={styles.input} />
                            </div>
                            <div className={styles.inputWrapper}>
                                <label className={styles.label}>Postal Code</label>
                                <input type="text" required className={styles.input} />
                            </div>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <h2 className={styles.sectionTitle}>Payment Details</h2>
                        <div className={styles.inputWrapper}>
                            <label className={styles.label}>Card Number</label>
                            <input type="text" placeholder="0000 0000 0000 0000" className={styles.input} />
                        </div>
                        <div className={styles.inputGrid}>
                            <div className={styles.inputWrapper}>
                                <label className={styles.label}>Expiry</label>
                                <input type="text" placeholder="MM/YY" className={styles.input} />
                            </div>
                            <div className={styles.inputWrapper}>
                                <label className={styles.label}>CVC</label>
                                <input type="text" placeholder="123" className={styles.input} />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className={styles.btnCheckout} disabled={isProcessing}>
                        {isProcessing ? 'Processing...' : `Pay $${totalPrice().toFixed(2)}`}
                    </button>
                </form>

                <div className={styles.summary}>
                    <h2 className={styles.summaryTitle}>Order Summary</h2>
                    {items.map((item, i) => (
                        <div key={`${item.product.id}-${i}`} className={styles.orderItem}>
                            <span className={styles.itemName}>
                                {item.quantity}x {item.product.name} <br />
                                <span style={{ fontSize: '0.8em', color: '#888' }}>{item.product.color.name}</span>
                            </span>
                            <span className={styles.itemPrice}>${(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className={styles.totalRow}>
                        <span>Total</span>
                        <span>${totalPrice().toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
