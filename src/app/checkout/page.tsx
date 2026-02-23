'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { useCartStore } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { useRouter } from 'next/navigation';

import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';

import { sanitizeTextInput, isValidEmail } from '@/lib/utils/sanitize';

// Load Stripe outside of components to avoid recreating the object
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// The actual Checkout Form Component
const CheckoutForm = ({ clientSecret }: { clientSecret: string }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { items, totalPrice } = useCartStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Manual Data Collection
    const [email, setEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return; // Stripe.js hasn't yet loaded.
        }

        // --- DEFENSIVE PROGRAMMING: Sanitize & Validate Inputs ---
        const sanitizedEmail = sanitizeTextInput(email);
        if (!isValidEmail(sanitizedEmail)) {
            setErrorMessage("Please enter a valid email address.");
            return;
        }

        setIsProcessing(true);
        setErrorMessage(null);

        // Confirm the payment with Stripe
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Pass sanitized data to Stripe if needed for receipts
                receipt_email: sanitizedEmail,
                return_url: `${window.location.origin}/checkout/success`,
            },
        });

        // This point will only be reached if there is an immediate error when
        // confirming the payment. Otherwise, your customer will be redirected to
        // your `return_url`.
        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setErrorMessage(error.message || "An error occurred with your payment method.");
            } else {
                setErrorMessage("An unexpected error occurred.");
            }
        }

        setIsProcessing(false);
    };

    return (
        <form className={styles.formSection} onSubmit={handleSubmit}>
            <h1>Secure Checkout</h1>

            <div className={styles.formGroup} style={{ marginTop: '2rem' }}>
                <h2 className={styles.sectionTitle}>Contact Information</h2>
                <div className={styles.inputWrapper}>
                    <label className={styles.label}>Email Address</label>
                    <input
                        type="email"
                        required
                        className={styles.input}
                        placeholder="jdoe@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.formGroup} style={{ marginTop: '2rem' }}>
                <h2 className={styles.sectionTitle}>Payment Details</h2>
                {/* The PaymentElement automatically renders the best payment methods for the user */}
                <div style={{ padding: '1.5rem', background: '#fff', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                    <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
                </div>
            </div>

            {errorMessage && (
                <div className={styles.errorMessage} style={{ color: '#d32f2f', marginTop: '1rem', padding: '1rem', background: '#ffebee', borderRadius: '4px' }}>
                    {errorMessage}
                </div>
            )}

            <button
                type="submit"
                className={styles.btnCheckout}
                disabled={isProcessing || !stripe || !elements}
                style={{ marginTop: '2rem' }}
            >
                {isProcessing ? 'Processing SECURE Payment...' : `Complete Order • $${totalPrice().toFixed(2)}`}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#666', marginTop: '1rem' }}>
                Payment securely processed by Stripe. Orin Leather never stores your card details.
            </p>
        </form>
    );
};

// Main Page Component
export default function CheckoutPage() {
    const { items, totalPrice } = useCartStore();
    const router = useRouter();
    const [clientSecret, setClientSecret] = useState<string>('');

    useEffect(() => {
        // Only fetch if we have items in the cart
        if (items.length === 0) return;

        // 1. Send cart items to our secure backend API route
        fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                // Convert complex cart items into simple ID/quantity pairs for the API
                items: items.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity
                }))
            }),
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to initialize checkout');
                return res.json();
            })
            .then((data) => {
                // 2. The backend responds with a secure Client Secret
                setClientSecret(data.clientSecret);
            })
            .catch((err) => {
                console.error("Error creating PaymentIntent:", err);
            });
    }, [items]);

    if (items.length === 0) {
        return (
            <div className={styles.page}>
                <div className={styles.container}>
                    <h1>Your cart is empty.</h1>
                    <button onClick={() => router.push('/products')} className={styles.btnCheckout} style={{ marginTop: '2rem', maxWidth: '200px' }}>
                        Browse Products
                    </button>
                </div>
            </div>
        );
    }

    const appearance = {
        theme: 'flat' as const, // Fix: 'minimal' is not a valid predefined stripe theme
        variables: {
            fontFamily: 'var(--font-primary), sans-serif',
            colorText: '#333',
            colorPrimary: '#A0764A', // Injecting our brand bronze/gold
        },
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>

                {clientSecret ? (
                    // Stripe Elements Provider wraps the checkout form
                    <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
                        <CheckoutForm clientSecret={clientSecret} />
                    </Elements>
                ) : (
                    <div style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                        <div className={styles.loader}>Initializing secure checkout...</div>
                    </div>
                )}

                <div className={styles.summary} style={{ flex: 1 }}>
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
                        <span>Total (USD)</span>
                        <span>${totalPrice().toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
