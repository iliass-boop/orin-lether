import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/ratelimit';

/* ============================================================
   ORIN — Enterprise Security Middleware
   Grand Master Level — Defense in Depth
   
   Rate Limiting: Upstash Redis (distributed, works globally)
   ============================================================ */

// --- Suspicious Bot Detection ---
const BLOCKED_USER_AGENTS = [
    /curl/i,
    /wget/i,
    /python-requests/i,
    /scrapy/i,
    /phantomjs/i,
    /headlesschrome/i,
    /selenium/i,
    /puppeteer/i,
];

function isSuspiciousBot(userAgent: string | null): boolean {
    if (!userAgent) return true; // No UA = suspicious
    return BLOCKED_USER_AGENTS.some((pattern) => pattern.test(userAgent));
}

// --- Security Headers ---
function getSecurityHeaders(): Record<string, string> {
    const isDev = process.env.NODE_ENV === 'development';
    return {
        // Content Security Policy — strict, prevents XSS
        'Content-Security-Policy': [
            "default-src 'self'",
            `script-src 'self' 'unsafe-inline' https://js.stripe.com ${isDev ? "'unsafe-eval'" : ""}`,
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob: https:",
            // Fix: tighten connect-src — restrict ws/wss and broad https: to dev only
            isDev
                ? "connect-src 'self' https://api.stripe.com https: ws: wss:"
                : "connect-src 'self' https://api.stripe.com",
            "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "upgrade-insecure-requests",
        ].join('; '),

        'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': [
            'camera=()',
            'microphone=()',
            'geolocation=()',
            'payment=self',
            'usb=()',
            'bluetooth=()',
            'gyroscope=()',
            'magnetometer=()',
            'accelerometer=()',
        ].join(', '),
        'X-DNS-Prefetch-Control': 'off',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Resource-Policy': 'same-origin',
        'X-Powered-By': '',
    };
}

// --- CSRF Token Generation ---
function generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

// --- Extract real IP from request ---
// Fix: prefer server-populated, hard-to-spoof headers before x-forwarded-for;
// avoid shared 'unknown' bucket that collapses all anonymous users.
function getClientIp(request: NextRequest): string {
    const cfIp = request.headers.get('cf-connecting-ip');
    const realIp = request.headers.get('x-real-ip');
    const forwarded = request.headers.get('x-forwarded-for')
        ?.split(',')
        .map((v) => v.trim())
        .find(Boolean);
    const ip = cfIp ?? realIp ?? forwarded;
    if (ip) return ip;
    // Non-colliding fallback — never merges all anon users into one rate-limit key
    const ua = request.headers.get('user-agent') ?? 'no-ua';
    return 'anon-' + ua.slice(0, 64);
}

// --- Main Middleware (async for Redis calls) ---
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isDev = process.env.NODE_ENV === 'development';

    // 1. Skip static assets and internal Next.js routes
    // Use an extension regex so routes like /api/v2.0/resource are NOT bypassed
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/images') ||
        // Fix: exclude /api paths — prevents /api/foo.json from bypassing middleware
        (!pathname.startsWith('/api') && /\.(?:[a-z0-9]{1,8})$/i.test(pathname))
    ) {
        return NextResponse.next();
    }

    // 2. Bot detection — API routes only, not in dev
    if (!isDev && pathname.startsWith('/api')) {
        const userAgent = request.headers.get('user-agent');
        if (isSuspiciousBot(userAgent)) {
            return new NextResponse(
                JSON.stringify({ error: 'Access denied' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    // 3. Distributed Rate Limiting (Upstash Redis — works across ALL serverless instances)
    // Falls back gracefully to allowing the request if Redis env vars are not configured.
    if (!isDev && pathname.startsWith('/api')) {
        try {
            const ip = getClientIp(request);
            const variant = pathname.startsWith('/api/checkout')
                ? 'checkout' as const
                : pathname.startsWith('/api/newsletter')
                    ? 'newsletter' as const
                    : 'general' as const;
            const { limited, limit, remaining, resetAt } = await checkRateLimit(ip, variant);

            if (limited) {
                // Fix: clamp to minimum 1 to prevent 0 or negative Retry-After values
                const retryAfterSeconds = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
                return new NextResponse(
                    JSON.stringify({
                        error: 'Too many requests. Please slow down.',
                        retryAfter: retryAfterSeconds,
                    }),
                    {
                        status: 429,
                        headers: {
                            'Content-Type': 'application/json',
                            'Retry-After': String(retryAfterSeconds),
                            'X-RateLimit-Limit': String(limit),
                            'X-RateLimit-Remaining': '0',
                            'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
                        },
                    }
                );
            }
        } catch (err) {
            // If Redis is down or misconfigured, log but don't block the user.
            // Availability > security in degraded mode.
            console.error('[RATE_LIMIT_ERROR]', err);
        }
    }

    // 4. Request size validation (block oversized payloads)
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
        return new NextResponse(
            JSON.stringify({ error: 'Request too large' }),
            { status: 413, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // 5. Block suspicious paths (path traversal attempts)
    if (
        pathname.includes('..') ||
        pathname.includes('//') ||
        pathname.includes('\\') ||
        /\.(env|git|sql|bak|config|ini|log)$/i.test(pathname)
    ) {
        return new NextResponse(null, { status: 404 });
    }

    // 6. CSRF protection for state-changing methods
    const CSRF_EXEMPT = ['/api/checkout', '/api/webhooks'];
    const isCsrfExempt = CSRF_EXEMPT.some((p) => pathname.startsWith(p));

    if (!isCsrfExempt && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
        const csrfHeader = request.headers.get('x-csrf-token');
        const csrfCookie = request.cookies.get('csrf-token')?.value;

        if (pathname.startsWith('/api') && (!csrfHeader || csrfHeader !== csrfCookie)) {
            return new NextResponse(
                JSON.stringify({ error: 'Invalid CSRF token' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    // 7. Apply security headers
    const securityHeaders = getSecurityHeaders();

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('Content-Security-Policy', securityHeaders['Content-Security-Policy']);

    const response = NextResponse.next({ request: { headers: requestHeaders } });

    for (const [key, value] of Object.entries(securityHeaders)) {
        if (value) {
            response.headers.set(key, value);
        } else {
            response.headers.delete(key);
        }
    }

    // 8. Set CSRF token cookie if not present
    // httpOnly MUST be false — JS reads it for the double-submit CSRF pattern
    if (!request.cookies.get('csrf-token')) {
        const csrfToken = generateCSRFToken();
        response.cookies.set('csrf-token', csrfToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24, // 24 hours
        });
    }

    // 9. Add request ID for distributed tracing
    const requestId = crypto.randomUUID();
    response.headers.set('X-Request-Id', requestId);

    return response;
}

// --- Matcher ---
export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|images/).*)'],
};
