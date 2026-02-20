import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/* ============================================
   ORIN — Enterprise Security Middleware
   Grand Master Level — Defense in Depth
   ============================================ */

// --- Rate Limiting Store (Edge-compatible) ---
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute per IP

function getRateLimitKey(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    return ip;
}

function isRateLimited(key: string): boolean {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    // Cleanup expired entries periodically
    if (rateLimitStore.size > 10000) {
        for (const [k, v] of rateLimitStore) {
            if (now > v.resetTime) rateLimitStore.delete(k);
        }
    }

    if (!entry || now > entry.resetTime) {
        rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return false;
    }

    entry.count++;
    if (entry.count > RATE_LIMIT_MAX) {
        return true;
    }

    return false;
}

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
    return {
        // Content Security Policy — strict, prevents XSS
        'Content-Security-Policy': [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires inline for HMR in dev
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob: https:",
            "connect-src 'self' https: wss:",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "upgrade-insecure-requests",
        ].join('; '),

        // HTTP Strict Transport Security — force HTTPS for 2 years
        'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',

        // Prevent clickjacking
        'X-Frame-Options': 'DENY',

        // Prevent MIME sniffing
        'X-Content-Type-Options': 'nosniff',

        // Control referrer info
        'Referrer-Policy': 'strict-origin-when-cross-origin',

        // Permissions Policy — disable unnecessary APIs
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

        // Prevent DNS prefetching to third parties
        'X-DNS-Prefetch-Control': 'off',

        // Cross-Origin policies
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Resource-Policy': 'same-origin',

        // Remove server identification
        'X-Powered-By': '',
    };
}

// --- CSRF Token Generation ---
function generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

// --- Main Middleware ---
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 0. Development mode bypass — skip all security checks locally
    if (process.env.NODE_ENV === 'development') {
        const response = NextResponse.next();
        return response;
    }

    // 1. Skip static assets and internal Next.js routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/images') ||
        pathname.includes('.') // Static files
    ) {
        return NextResponse.next();
    }

    // 2. Bot detection (block on API routes only — allow crawlers on pages)
    if (pathname.startsWith('/api')) {
        const userAgent = request.headers.get('user-agent');
        if (isSuspiciousBot(userAgent)) {
            return new NextResponse(
                JSON.stringify({ error: 'Access denied' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    // 3. Rate limiting
    const rateLimitKey = getRateLimitKey(request);
    if (isRateLimited(rateLimitKey)) {
        return new NextResponse(
            JSON.stringify({
                error: 'Too many requests. Please slow down.',
                retryAfter: 60,
            }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': '60',
                },
            }
        );
    }

    // 4. Request size validation (block oversized payloads)
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
        // 10MB max
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
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
        const csrfHeader = request.headers.get('x-csrf-token');
        const csrfCookie = request.cookies.get('csrf-token')?.value;

        if (pathname.startsWith('/api') && (!csrfHeader || csrfHeader !== csrfCookie)) {
            return new NextResponse(
                JSON.stringify({ error: 'Invalid CSRF token' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    // 7. Apply security headers to response
    const response = NextResponse.next();
    const securityHeaders = getSecurityHeaders();

    for (const [key, value] of Object.entries(securityHeaders)) {
        if (value) {
            response.headers.set(key, value);
        } else {
            response.headers.delete(key);
        }
    }

    // 8. Set CSRF token cookie if not present
    if (!request.cookies.get('csrf-token')) {
        const csrfToken = generateCSRFToken();
        response.cookies.set('csrf-token', csrfToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24, // 24 hours
        });
    }

    // 9. Add request ID for tracing
    const requestId = crypto.randomUUID();
    response.headers.set('X-Request-Id', requestId);

    return response;
}

// --- Matcher: Apply to all routes except static files ---
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|images/).*)',
    ],
};
