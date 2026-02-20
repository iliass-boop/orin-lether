import Link from 'next/link';

export default function NotFound() {
    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                backgroundColor: 'var(--ivory)',
                padding: 'var(--space-xl)',
            }}
        >
            <p
                style={{
                    fontFamily: 'var(--font-accent)',
                    fontSize: 'var(--text-lg)',
                    fontStyle: 'italic',
                    color: 'var(--saddle)',
                    marginBottom: 'var(--space-md)',
                }}
            >
                Lost in the workshop
            </p>
            <h1
                style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-6xl)',
                    color: 'var(--obsidian)',
                    lineHeight: 1.1,
                    marginBottom: 'var(--space-md)',
                }}
            >
                404
            </h1>
            <p
                style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-lg)',
                    color: 'var(--obsidian)',
                    opacity: 0.6,
                    marginBottom: 'var(--space-2xl)',
                    maxWidth: 420,
                    lineHeight: 1.7,
                }}
            >
                This page doesn&apos;t exist — but everything else we make does. Let&apos;s get you back on track.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                <Link href="/" className="btn btn-primary">
                    Go Home
                </Link>
                <Link href="/products" className="btn btn-secondary">
                    Shop Collection
                </Link>
            </div>
        </div>
    );
}
