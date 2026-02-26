import * as Sentry from '@sentry/nextjs';

/* ============================================================
   Sentry — Browser / Client Config
   Captures unhandled errors, React rendering errors, and
   Core Web Vitals performance data.
   ============================================================ */

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Set tracesSampleRate to 1.0 to capture 100% of transactions.
    // In production, reduce to 0.1 (10%) to manage volume.
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Session replay — records what users did before an error
    // 10% of all sessions, 100% of sessions with errors
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    integrations: [
        Sentry.replayIntegration({
            maskAllText: true,    // GDPR: mask all text in replays
            blockAllMedia: false,
        }),
    ],

    environment: process.env.NODE_ENV,

    // Only initialize in production — avoids noise in dev
    enabled: process.env.NODE_ENV === 'production',
});
