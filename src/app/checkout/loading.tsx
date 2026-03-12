'use client';

export default function CheckoutLoading() {
    return (
        <section
            style={{
                minHeight: '100vh',
                paddingTop: 'calc(var(--nav-height, 72px) + 2rem)',
                paddingBottom: '4rem',
                backgroundColor: 'var(--obsidian, #1A1A1A)',
            }}
        >
            <div
                className="container"
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 0.8fr',
                    gap: '3rem',
                    maxWidth: '1100px',
                }}
            >
                {/* Checkout form skeleton */}
                <div>
                    <div
                        style={{
                            width: '180px',
                            height: '32px',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            borderRadius: '4px',
                            marginBottom: '2rem',
                            animation: 'pulse 1.8s ease-in-out infinite',
                        }}
                    />
                    {/* Form fields */}
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            style={{
                                width: '100%',
                                height: '48px',
                                backgroundColor: 'rgba(255,255,255,0.03)',
                                borderRadius: 'var(--radius-sm, 4px)',
                                marginBottom: '1rem',
                                animation: 'pulse 1.8s ease-in-out infinite',
                                animationDelay: `${i * 0.1}s`,
                            }}
                        />
                    ))}
                    {/* Payment section */}
                    <div
                        style={{
                            width: '160px',
                            height: '24px',
                            backgroundColor: 'rgba(255,255,255,0.04)',
                            borderRadius: '4px',
                            marginTop: '2rem',
                            marginBottom: '1rem',
                            animation: 'pulse 1.8s ease-in-out infinite',
                            animationDelay: '0.5s',
                        }}
                    />
                    <div
                        style={{
                            width: '100%',
                            height: '120px',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            borderRadius: 'var(--radius-md, 8px)',
                            animation: 'pulse 1.8s ease-in-out infinite',
                            animationDelay: '0.6s',
                        }}
                    />
                </div>

                {/* Order summary skeleton */}
                <div
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        borderRadius: 'var(--radius-md, 8px)',
                        padding: '2rem',
                        height: 'fit-content',
                    }}
                >
                    <div
                        style={{
                            width: '140px',
                            height: '20px',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            borderRadius: '4px',
                            marginBottom: '1.5rem',
                            animation: 'pulse 1.8s ease-in-out infinite',
                        }}
                    />
                    {[1, 2].map((i) => (
                        <div
                            key={i}
                            style={{
                                display: 'flex',
                                gap: '1rem',
                                marginBottom: '1rem',
                                animation: 'pulse 1.8s ease-in-out infinite',
                                animationDelay: `${i * 0.15}s`,
                            }}
                        >
                            <div
                                style={{
                                    width: '64px',
                                    height: '64px',
                                    backgroundColor: 'rgba(255,255,255,0.04)',
                                    borderRadius: 'var(--radius-sm, 4px)',
                                    flexShrink: 0,
                                }}
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{ width: '80%', height: '14px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '4px', marginBottom: '0.5rem' }} />
                                <div style={{ width: '50%', height: '12px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '4px' }} />
                            </div>
                        </div>
                    ))}
                    {/* Total */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ width: '60px', height: '16px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '4px', animation: 'pulse 1.8s ease-in-out infinite' }} />
                            <div style={{ width: '80px', height: '16px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', animation: 'pulse 1.8s ease-in-out infinite' }} />
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
                @media (max-width: 768px) {
                    .container { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </section>
    );
}
