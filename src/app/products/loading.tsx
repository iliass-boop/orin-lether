'use client';

export default function ProductsLoading() {
    return (
        <section
            style={{
                minHeight: '100vh',
                paddingTop: 'calc(var(--nav-height, 72px) + 3rem)',
                paddingBottom: '4rem',
                backgroundColor: 'var(--obsidian, #1A1A1A)',
            }}
        >
            <div className="container">
                {/* Header skeleton */}
                <div
                    style={{
                        width: '280px',
                        height: '40px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        borderRadius: 'var(--radius-sm, 4px)',
                        marginBottom: '2rem',
                        animation: 'pulse 1.8s ease-in-out infinite',
                    }}
                />

                {/* Filter bar skeleton */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            style={{
                                width: '100px',
                                height: '36px',
                                backgroundColor: 'rgba(255,255,255,0.04)',
                                borderRadius: 'var(--radius-sm, 4px)',
                                animation: 'pulse 1.8s ease-in-out infinite',
                                animationDelay: `${i * 0.1}s`,
                            }}
                        />
                    ))}
                </div>

                {/* Product grid skeleton */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '2rem',
                    }}
                >
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} style={{ animation: 'pulse 1.8s ease-in-out infinite', animationDelay: `${i * 0.1}s` }}>
                            {/* Image placeholder */}
                            <div
                                style={{
                                    width: '100%',
                                    aspectRatio: '3/4',
                                    backgroundColor: 'rgba(255,255,255,0.04)',
                                    borderRadius: 'var(--radius-md, 8px)',
                                    marginBottom: '1rem',
                                }}
                            />
                            {/* Title */}
                            <div
                                style={{
                                    width: '70%',
                                    height: '18px',
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    borderRadius: '4px',
                                    marginBottom: '0.5rem',
                                }}
                            />
                            {/* Price */}
                            <div
                                style={{
                                    width: '40%',
                                    height: '14px',
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    borderRadius: '4px',
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Pulse animation */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>
        </section>
    );
}
