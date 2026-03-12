'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import Link from 'next/link';

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { clearCart } = useCartStore();

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [amount, setAmount] = useState<number | null>(null);

    const paymentIntent = searchParams.get('payment_intent');

    useEffect(() => {
        if (!paymentIntent) {
            router.push('/');
            return;
        }

        // Verify the payment intent status on our secure backend
        fetch(`/api/checkout/confirm?payment_intent=${paymentIntent}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === 'succeeded') {
                    setStatus('success');
                    setAmount(data.amount / 100); // Convert from cents
                    clearCart(); // Securely clear the cart only upon success
                } else {
                    setStatus('error');
                }
            })
            .catch(() => {
                setStatus('error');
            });
    }, [paymentIntent, clearCart, router]);

    if (status === 'loading') {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <p>Verifying secure payment...</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
                <h1 style={{ color: '#d32f2f', marginBottom: '1rem' }}>Payment Verification Failed</h1>
                <p style={{ marginBottom: '2rem' }}>We could not verify your payment. Please contact support.</p>
                <Link href="/checkout" style={{ padding: '10px 20px', background: '#333', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>
                    Return to Checkout
                </Link>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '2rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#4CAF50', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', color: 'white' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>

            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#333' }}>Payment Successful!</h1>
            <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem', maxWidth: '600px' }}>
                Thank you for your order. Your secure payment of <strong>${amount?.toFixed(2)}</strong> has been processed successfully.
                We have received your order and will begin processing it shortly.
            </p>

            <Link href="/" style={{ padding: '15px 30px', background: '#A0764A', color: '#fff', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                Return to Home
            </Link>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
