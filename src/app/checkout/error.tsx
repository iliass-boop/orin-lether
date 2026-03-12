'use client';

export default function CheckoutError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <section
            style={{
                minHeight: '60vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 'var(--nav-height, 72px)',
                backgroundColor: 'var(--obsidian, #1A1A1A)',
            }}
        >
            <div style={{ textAlign: 'center', maxWidth: '480px', padding: '2rem' }}>
                <h2
                    style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 'var(--text-3xl, 2rem)',
                        color: 'var(--ivory, #FDFBF7)',
                        marginBottom: '1rem',
                    }}
                >
                    Checkout interrupted
                </h2>
                <p
                    style={{
                        color: 'var(--stone, #D4CFC4)',
                        fontSize: 'var(--text-base, 1rem)',
                        lineHeight: 1.6,
                        marginBottom: '0.5rem',
                    }}
                >
                    Something went wrong during checkout. Your payment has not been processed.
                </p>
                <p
                    style={{
                        color: 'var(--stone, #D4CFC4)',
                        fontSize: 'var(--text-sm, 0.875rem)',
                        opacity: 0.7,
                        marginBottom: '2rem',
                    }}
                >
                    Your cart items are still saved.
                </p>
                <button
                    onClick={reset}
                    className="btn btn-primary"
                    style={{
                        padding: '0.875rem 2.5rem',
                        fontSize: 'var(--text-sm, 0.875rem)',
                    }}
                >
                    RETRY CHECKOUT
                </button>
            </div>
        </section>
    );
}
