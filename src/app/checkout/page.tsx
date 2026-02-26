'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/formatPrice';

import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';

import { sanitizeTextInput, isValidEmail } from '@/lib/utils/sanitize';

// ── Stripe init (once, outside render tree) ─────────────────────────
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

// ── Stripe appearance (module-level constant prevents re-creation on every render) ──
const STRIPE_APPEARANCE = {
    theme: 'night' as const,
    variables: {
        colorPrimary: '#c9a96e',
        colorBackground: '#1a1a1a',
        colorText: '#f0ece4',
        colorDanger: '#e07070',
        fontFamily: 'var(--font-body), sans-serif',
        borderRadius: '0px',
        colorTextPlaceholder: '#444',
        colorIcon: '#888',
    },
    rules: {
        '.Input': { border: '1px solid #2a2a2a', boxShadow: 'none', backgroundColor: '#1a1a1a', color: '#f0ece4', padding: '12px 14px' },
        '.Input:focus': { border: '1px solid #c9a96e', boxShadow: 'none' },
        '.Label': { color: '#666', textTransform: 'uppercase' as const, letterSpacing: '0.1em', fontSize: '11px' },
        '.Tab': { border: '1px solid #2a2a2a', backgroundColor: '#161616' },
        '.Tab--selected': { border: '1px solid #c9a96e', color: '#c9a96e', backgroundColor: '#1a1a1a' },
        '.TabLabel': { color: '#888' },
        '.TabLabel--selected': { color: '#c9a96e' },
        '.TabIcon--selected': { fill: '#c9a96e' },
    },
};

// ── Countries ────────────────────────────────────────────────────────
const COUNTRIES = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'FR', name: 'France' },
    { code: 'DE', name: 'Germany' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'PT', name: 'Portugal' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'BE', name: 'Belgium' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'SE', name: 'Sweden' },
    { code: 'NO', name: 'Norway' },
    { code: 'DK', name: 'Denmark' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'South Korea' },
    { code: 'SG', name: 'Singapore' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'MA', name: 'Morocco' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
    { code: 'NZ', name: 'New Zealand' },
];

// ── Field validation ─────────────────────────────────────────────────
type FormData = {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
};

function getFieldError(field: keyof FormData, value: string): string {
    if (field === 'email') {
        if (!value.trim()) return 'Email is required';
        if (!isValidEmail(value.trim())) return 'Enter a valid email address';
    }
    if (field === 'firstName' && !value.trim()) return 'First name is required';
    if (field === 'lastName' && !value.trim()) return 'Last name is required';
    if (field === 'address' && !value.trim()) return 'Street address is required';
    if (field === 'city' && !value.trim()) return 'City is required';
    if (field === 'country' && !value) return 'Country is required';
    if (field === 'zip' && value.trim() && !/^[A-Za-z0-9\s-]{3,10}$/.test(value.trim()))
        return 'Enter a valid postal code';
    if (field === 'state' && value.trim() && value.trim().length > 50)
        return 'State / Region is too long';
    return '';
}

// ── Stripe Payment Form (inner) ──────────────────────────────────────
const PaymentForm = ({
    formData,
    totalPrice,
    onValidate,
}: {
    formData: FormData;
    totalPrice: number;
    onValidate: () => boolean;
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        // Trigger address form validation first
        if (!onValidate()) {
            setErrorMessage('Please complete all required shipping fields before paying.');
            return;
        }

        setIsProcessing(true);
        setErrorMessage(null);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                receipt_email: sanitizeTextInput(formData.email),
                shipping: {
                    name: `${sanitizeTextInput(formData.firstName)} ${sanitizeTextInput(formData.lastName)}`.trim(),
                    phone: sanitizeTextInput(formData.phone),
                    address: {
                        line1: sanitizeTextInput(formData.address),
                        city: sanitizeTextInput(formData.city),
                        state: sanitizeTextInput(formData.state),
                        postal_code: sanitizeTextInput(formData.zip),
                        country: formData.country || 'US',
                    },
                },
                return_url: `${window.location.origin}/checkout/success`,
            },
        });

        if (error) {
            setErrorMessage(
                error.type === 'card_error' || error.type === 'validation_error'
                    ? (error.message ?? 'Card error. Please check your details.')
                    : 'An unexpected error occurred. Please try again.'
            );
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.paymentForm}>
            <div className={styles.stripeBox}>
                <PaymentElement
                    id="payment-element"
                    options={{
                        layout: 'tabs',
                        fields: { billingDetails: { email: 'never' } },
                    }}
                />
            </div>

            {errorMessage && (
                <div className={styles.errorBanner} role="alert">
                    <span className={styles.errorIcon}>!</span>
                    <span>{errorMessage}</span>
                </div>
            )}

            <button
                type="submit"
                className={styles.submitBtn}
                disabled={isProcessing || !stripe || !elements}
                aria-busy={isProcessing}
            >
                {isProcessing ? (
                    <span className={styles.spinnerRow}>
                        <span className={styles.spinner} aria-hidden="true" />
                        Securing payment…
                    </span>
                ) : (
                    `Complete Order · ${formatPrice(totalPrice)}`
                )}
            </button>

            <p className={styles.secureNote}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                256-bit encrypted · Processed by Stripe · ORIN never stores card data
            </p>
        </form>
    );
};

// ── Field Component ──────────────────────────────────────────────────
const Field = ({
    label,
    name,
    type = 'text',
    placeholder,
    required,
    autoComplete,
    value,
    onChange,
    onBlur,
    error,
    touched,
}: {
    label: string;
    name: keyof FormData;
    type?: string;
    placeholder?: string;
    required?: boolean;
    autoComplete?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (name: keyof FormData) => void;
    error: string;
    touched: boolean;
}) => (
    <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel} htmlFor={name}>
            {label}{required && <span className={styles.req} aria-hidden="true"> *</span>}
        </label>
        <input
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            required={required}
            autoComplete={autoComplete}
            className={`${styles.field} ${touched && error ? styles.fieldError : ''} ${touched && !error && value ? styles.fieldOk : ''}`}
            value={value}
            onChange={onChange}
            onBlur={() => onBlur(name)}
            aria-invalid={touched && !!error}
            aria-describedby={touched && error ? `${name}-error` : undefined}
        />
        {touched && error && (
            <span id={`${name}-error`} className={styles.fieldErrorMsg} role="alert">{error}</span>
        )}
    </div>
);

// ── Main Checkout Page ───────────────────────────────────────────────
export default function CheckoutPage() {
    const { items, totalPrice, removeItem, updateQuantity } = useCartStore();
    const [mounted, setMounted] = useState(false);
    const [clientSecret, setClientSecret] = useState('');
    const [initError, setInitError] = useState('');
    const [retryCount, setRetryCount] = useState(0);

    const [formData, setFormData] = useState<FormData>({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: 'US',
    });

    const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});

    // Hydration guard
    useEffect(() => { setMounted(true); }, []);

    // Fetch PaymentIntent — runs whenever mounted state or cart items change
    const fetchIntent = useCallback(() => {
        if (!mounted || items.length === 0) return;
        setInitError('');
        setClientSecret('');

        fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: items.map(item => ({ productId: item.product.id, quantity: item.quantity })),
            }),
        })
            .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
            .then(data => setClientSecret(data.clientSecret))
            .catch(err => {
                console.error('[CHECKOUT_INIT]', err);
                setInitError('Unable to initialize secure checkout. Please try again.');
            });
    }, [mounted, items]);

    // Auto-fetch on mount + when items change + on manual retry
    useEffect(() => {
        if (!mounted) return;
        fetchIntent();
    }, [mounted, fetchIntent, retryCount]);

    const handleField = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleBlur = (name: keyof FormData) => {
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    // Called by PaymentForm before submit — marks all required fields touched
    const validateAll = () => {
        const requiredFields: (keyof FormData)[] = ['email', 'firstName', 'lastName', 'address', 'city', 'country'];
        const newTouched: Partial<Record<keyof FormData, boolean>> = { ...touched };
        requiredFields.forEach(f => { newTouched[f] = true; });
        setTouched(newTouched);
        return requiredFields.every(f => !getFieldError(f, formData[f]));
    };

    const cartTotal = mounted ? totalPrice() : 0;
    const totalQty = mounted ? items.reduce((s, i) => s + i.quantity, 0) : 0;

    // ── Missing Stripe key guard ──
    if (!stripePublishableKey) {
        return (
            <div className={styles.page}>
                <header className={styles.topBar}>
                    <Link href="/" className={styles.topBarLogo}>ORI<span>N</span></Link>
                </header>
                <div className={styles.emptyState}>
                    <p className={styles.emptyGlyph}>!</p>
                    <h2 className={styles.emptyTitle}>Checkout Unavailable</h2>
                    <p className={styles.emptyText}>Payment configuration is missing. Please contact support.</p>
                    <Link href="/products" className={styles.browseBtn}>Continue Shopping</Link>
                </div>
            </div>
        );
    }

    // ── Empty cart ──
    if (mounted && items.length === 0) {
        return (
            <div className={styles.page}>
                <header className={styles.topBar}>
                    <Link href="/" className={styles.topBarLogo}>ORI<span>N</span></Link>
                    <span className={styles.topBarTag}>Secure Checkout</span>
                    <LockIcon />
                </header>
                <div className={styles.emptyState}>
                    <p className={styles.emptyGlyph}>◇</p>
                    <h2 className={styles.emptyTitle}>Your cart is empty</h2>
                    <p className={styles.emptyText}>Discover something exceptional.</p>
                    <Link href="/products" className={styles.browseBtn}>Browse Collection</Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            {/* ── Top Bar ── */}
            <header className={styles.topBar}>
                <Link href="/" className={styles.topBarLogo}>ORI<span>N</span></Link>
                <span className={styles.topBarTag}>Secure Checkout</span>
                <LockIcon />
            </header>

            <div className={styles.grid}>
                {/* ── COL 1: Order Summary ── */}
                <section className={styles.col} aria-labelledby="col1-title">
                    <h2 className={styles.colHeader} id="col1-title">
                        <StepDot n={1} />
                        Order Summary
                        {mounted && <span className={styles.colCount}>{totalQty} {totalQty === 1 ? 'item' : 'items'}</span>}
                    </h2>

                    <div className={styles.itemList}>
                        {mounted && items.map(item => (
                            <div key={item.product.id} className={styles.cartItem}>
                                <div className={styles.cartItemThumb}>
                                    {item.product.images?.[0] ? (
                                        <Image
                                            src={item.product.images[0]}
                                            alt={item.product.name}
                                            fill
                                            className={styles.cartItemImg}
                                            sizes="72px"
                                        />
                                    ) : (
                                        <div className={styles.cartItemPlaceholder}>{item.product.name.charAt(0)}</div>
                                    )}
                                </div>

                                <div className={styles.cartItemInfo}>
                                    <p className={styles.cartItemName}>{item.product.name}</p>
                                    <p className={styles.cartItemSub}>{item.product.color.name}</p>
                                    <div className={styles.cartItemActions}>
                                        <div className={styles.qtyControl} role="group" aria-label="Quantity">
                                            <button className={styles.qtyBtn} onClick={() => updateQuantity(item.product.id, item.quantity - 1)} aria-label="Decrease quantity">−</button>
                                            <span className={styles.qtyVal}>{item.quantity}</span>
                                            <button className={styles.qtyBtn} onClick={() => updateQuantity(item.product.id, item.quantity + 1)} aria-label="Increase quantity">+</button>
                                        </div>
                                        <button className={styles.removeBtn} onClick={() => removeItem(item.product.id)}>Remove</button>
                                    </div>
                                </div>

                                <p className={styles.cartItemPrice}>{formatPrice(item.product.price * item.quantity)}</p>
                            </div>
                        ))}
                    </div>

                    <div className={styles.subtotalRow}>
                        <span className={styles.subtotalLabel}>Subtotal</span>
                        <span className={styles.subtotalVal}>{mounted ? formatPrice(cartTotal) : '—'}</span>
                    </div>
                    <div className={styles.shippingRow}>
                        <span className={styles.subtotalLabel}>Shipping</span>
                        <span className={styles.shippingFree}>Complimentary</span>
                    </div>
                    <div className={`${styles.subtotalRow} ${styles.totalHighlight}`}>
                        <span>Total (USD)</span>
                        <span>{mounted ? formatPrice(cartTotal) : '—'}</span>
                    </div>
                </section>

                {/* ── COL 2: Shipping Address ── */}
                <section className={styles.col} aria-labelledby="col2-title">
                    <h2 className={styles.colHeader} id="col2-title">
                        <StepDot n={2} />
                        Shipping Address
                    </h2>
                    <p className={styles.colNote}>Fields marked * are required</p>

                    <Field label="Email address" name="email" type="email" placeholder="you@example.com" required autoComplete="email"
                        value={formData.email} onChange={handleField} onBlur={handleBlur}
                        error={getFieldError('email', formData.email)} touched={!!touched.email} />

                    <div className={styles.fieldRow}>
                        <Field label="First name" name="firstName" required autoComplete="given-name"
                            value={formData.firstName} onChange={handleField} onBlur={handleBlur}
                            error={getFieldError('firstName', formData.firstName)} touched={!!touched.firstName} />
                        <Field label="Last name" name="lastName" required autoComplete="family-name"
                            value={formData.lastName} onChange={handleField} onBlur={handleBlur}
                            error={getFieldError('lastName', formData.lastName)} touched={!!touched.lastName} />
                    </div>

                    <Field label="Phone number" name="phone" type="tel" placeholder="+1 (555) 000-0000" autoComplete="tel"
                        value={formData.phone} onChange={handleField} onBlur={handleBlur}
                        error={getFieldError('phone', formData.phone)} touched={!!touched.phone} />

                    <Field label="Street address" name="address" placeholder="1 Leather Lane" required autoComplete="street-address"
                        value={formData.address} onChange={handleField} onBlur={handleBlur}
                        error={getFieldError('address', formData.address)} touched={!!touched.address} />

                    <div className={styles.fieldRow}>
                        <Field label="City" name="city" required autoComplete="address-level2"
                            value={formData.city} onChange={handleField} onBlur={handleBlur}
                            error={getFieldError('city', formData.city)} touched={!!touched.city} />
                        <Field label="State / Region" name="state" autoComplete="address-level1"
                            value={formData.state} onChange={handleField} onBlur={handleBlur}
                            error={getFieldError('state', formData.state)} touched={!!touched.state} />
                    </div>

                    <div className={styles.fieldRow}>
                        <Field label="ZIP / Postal code" name="zip" autoComplete="postal-code"
                            value={formData.zip} onChange={handleField} onBlur={handleBlur}
                            error={getFieldError('zip', formData.zip)} touched={!!touched.zip} />
                        {/* Country select */}
                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel} htmlFor="country">
                                Country <span className={styles.req} aria-hidden="true">*</span>
                            </label>
                            <div className={styles.selectWrapper}>
                                <select
                                    id="country"
                                    name="country"
                                    className={`${styles.field} ${styles.select}`}
                                    value={formData.country}
                                    onChange={handleField}
                                    onBlur={() => handleBlur('country')}
                                    autoComplete="country"
                                    required
                                >
                                    <option value="">Select country</option>
                                    {COUNTRIES.map(c => (
                                        <option key={c.code} value={c.code}>{c.name}</option>
                                    ))}
                                </select>
                                <svg className={styles.selectArrow} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── COL 3: Payment ── */}
                <section className={styles.col} aria-labelledby="col3-title">
                    <h2 className={styles.colHeader} id="col3-title">
                        <StepDot n={3} />
                        Payment Method
                        <span className={styles.stripeBadge} aria-label="Powered by Stripe">
                            <svg width="38" height="16" viewBox="0 0 60 25" fill="none" aria-hidden="true"><text x="0" y="20" fontFamily="system-ui,sans-serif" fontSize="18" fill="#6772e5" fontWeight="700">stripe</text></svg>
                        </span>
                    </h2>

                    {initError ? (
                        <div className={styles.initErrorBox}>
                            <div className={styles.errorBanner} role="alert">
                                <span className={styles.errorIcon}>!</span>
                                <span>{initError}</span>
                            </div>
                            <button className={styles.retryBtn} onClick={() => setRetryCount(n => n + 1)}>
                                Try Again
                            </button>
                        </div>
                    ) : clientSecret ? (
                        <Elements options={{ clientSecret, appearance: STRIPE_APPEARANCE, locale: 'en' }} stripe={stripePromise}>
                            <PaymentForm formData={formData} totalPrice={cartTotal} onValidate={validateAll} />
                        </Elements>
                    ) : (
                        <div className={styles.stripeLoading} aria-live="polite">
                            <span className={styles.spinner} aria-hidden="true" />
                            <span>Initializing secure payment…</span>
                        </div>
                    )}

                    {/* Order Details recap */}
                    <div className={styles.orderDetails} aria-label="Order details">
                        <h3 className={styles.orderDetailsTitle}>Order Details</h3>
                        {mounted && items.map(item => (
                            <div key={item.product.id} className={styles.detailRow}>
                                <span className={styles.detailName}>
                                    {item.quantity}× {item.product.name}
                                    <span className={styles.detailSub}> · {item.product.color.name}</span>
                                </span>
                                <span className={styles.detailPrice}>{formatPrice(item.product.price * item.quantity)}</span>
                            </div>
                        ))}
                        <div className={styles.detailRow}>
                            <span className={styles.detailName}>Shipping</span>
                            <span className={styles.detailFree}>Complimentary</span>
                        </div>
                        <div className={styles.detailTotal}>
                            <span>Total (USD)</span>
                            <span>{mounted ? formatPrice(cartTotal) : '—'}</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

// ── Small reusable atoms ─────────────────────────────────────────────
function StepDot({ n }: { n: number }) {
    return <span className={styles.stepNum} aria-hidden="true">{n}</span>;
}

function LockIcon() {
    return (
        <div className={styles.topBarLock} aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
        </div>
    );
}
