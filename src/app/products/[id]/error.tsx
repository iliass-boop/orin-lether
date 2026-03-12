'use client';

export default function ProductDetailError({
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
                    Product unavailable
                </h2>
                <p
                    style={{
                        color: 'var(--stone, #D4CFC4)',
                        fontSize: 'var(--text-base, 1rem)',
                        lineHeight: 1.6,
                        marginBottom: '2rem',
                    }}
                >
                    We couldn&apos;t load this product. It may have been removed or is temporarily unavailable.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        onClick={reset}
                        className="btn btn-primary"
                        style={{
                            padding: '0.875rem 2rem',
                            fontSize: 'var(--text-sm, 0.875rem)',
                        }}
                    >
                        TRY AGAIN
                    </button>
                    <a
                        href="/products"
                        className="btn"
                        style={{
                            padding: '0.875rem 2rem',
                            fontSize: 'var(--text-sm, 0.875rem)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            color: 'var(--ivory, #FDFBF7)',
                        }}
                    >
                        BROWSE ALL
                    </a>
                </div>
            </div>
        </section>
    );
}
