'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

/* ============================================================
   Global Error Boundary
   Catches unhandled React errors at the root level.
   Sent to Sentry automatically.
   ============================================================ */

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <html lang="en">
            <body style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: '#0a0a0a',
                color: '#fff',
                fontFamily: 'system-ui, sans-serif',
                gap: '1.5rem',
                textAlign: 'center',
                padding: '2rem',
            }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#c8a96e' }}>
                    Something went wrong
                </h1>
                <p style={{ color: '#888', maxWidth: '480px', lineHeight: 1.6 }}>
                    An unexpected error occurred. Our team has been notified and is working on a fix.
                </p>
                <button
                    onClick={reset}
                    style={{
                        background: '#c8a96e',
                        color: '#0a0a0a',
                        border: 'none',
                        padding: '0.75rem 2rem',
                        borderRadius: '4px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '1rem',
                    }}
                >
                    Try again
                </button>
            </body>
        </html>
    );
}
