'use client';

export default function ProductDetailLoading() {
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
                    gridTemplateColumns: '1fr 1fr',
                    gap: '3rem',
                    alignItems: 'start',
                }}
            >
                {/* Image gallery skeleton */}
                <div>
                    <div
                        style={{
                            width: '100%',
                            aspectRatio: '1',
                            backgroundColor: 'rgba(255,255,255,0.04)',
                            borderRadius: 'var(--radius-md, 8px)',
                            animation: 'pulse 1.8s ease-in-out infinite',
                        }}
                    />
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                style={{
                                    width: '72px',
                                    height: '72px',
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    borderRadius: 'var(--radius-sm, 4px)',
                                    animation: 'pulse 1.8s ease-in-out infinite',
                                    animationDelay: `${i * 0.1}s`,
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Product info skeleton */}
                <div style={{ paddingTop: '1rem' }}>
                    {/* Breadcrumb */}
                    <div
                        style={{
                            width: '200px',
                            height: '12px',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            borderRadius: '4px',
                            marginBottom: '1.5rem',
                            animation: 'pulse 1.8s ease-in-out infinite',
                        }}
                    />
                    {/* Title */}
                    <div
                        style={{
                            width: '80%',
                            height: '32px',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            borderRadius: '4px',
                            marginBottom: '0.75rem',
                            animation: 'pulse 1.8s ease-in-out infinite',
                            animationDelay: '0.1s',
                        }}
                    />
                    {/* Price */}
                    <div
                        style={{
                            width: '120px',
                            height: '24px',
                            backgroundColor: 'rgba(255,255,255,0.04)',
                            borderRadius: '4px',
                            marginBottom: '2rem',
                            animation: 'pulse 1.8s ease-in-out infinite',
                            animationDelay: '0.2s',
                        }}
                    />
                    {/* Description lines */}
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            style={{
                                width: `${90 - i * 10}%`,
                                height: '14px',
                                backgroundColor: 'rgba(255,255,255,0.03)',
                                borderRadius: '4px',
                                marginBottom: '0.75rem',
                                animation: 'pulse 1.8s ease-in-out infinite',
                                animationDelay: `${(i + 2) * 0.1}s`,
                            }}
                        />
                    ))}
                    {/* Add to cart button skeleton */}
                    <div
                        style={{
                            width: '100%',
                            height: '52px',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            borderRadius: 'var(--radius-sm, 4px)',
                            marginTop: '2rem',
                            animation: 'pulse 1.8s ease-in-out infinite',
                            animationDelay: '0.5s',
                        }}
                    />
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
