import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/* ============================================================
   Orin Leather — Distributed Rate Limiters (Upstash Redis)
   Replaces the broken in-memory Map that fails in serverless.

   Algorithm: Sliding Window
   - No thundering-herd at window boundary
   - Accurate across all Edge / serverless instances globally
   ============================================================ */

// Lazy-initialize Redis so the module is safe to import in any context.
let redis: Redis | null = null;

function getRedis(): Redis {
    if (redis) return redis;

    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        throw new Error(
            'Missing Upstash env vars: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN. ' +
            'Create a free database at https://console.upstash.com and add them to .env.local'
        );
    }

    redis = new Redis({ url, token });
    return redis;
}

// ── General limiter ───────────────────────────────────────────────────────
// 100 requests per 60-second sliding window per IP.
// Applies to all API routes except checkout.
let _generalLimiter: Ratelimit | null = null;

export function getGeneralLimiter(): Ratelimit {
    if (_generalLimiter) return _generalLimiter;
    _generalLimiter = new Ratelimit({
        redis: getRedis(),
        limiter: Ratelimit.slidingWindow(100, '60 s'),
        prefix: 'rl:general',
        analytics: true, // record usage data visible in Upstash console
    });
    return _generalLimiter;
}

// ── Checkout limiter ──────────────────────────────────────────────────────
// 5 requests per 60-second sliding window per IP.
// Tight limit prevents card-testing attacks (brute-force card numbers).
let _checkoutLimiter: Ratelimit | null = null;

export function getCheckoutLimiter(): Ratelimit {
    if (_checkoutLimiter) return _checkoutLimiter;
    _checkoutLimiter = new Ratelimit({
        redis: getRedis(),
        limiter: Ratelimit.slidingWindow(5, '60 s'),
        prefix: 'rl:checkout',
        analytics: true,
    });
    return _checkoutLimiter;
}

/**
 * Returns true if the given IP has hit the rate limit.
 * Also returns limit metadata for Retry-After and X-RateLimit-* headers.
 */
export async function checkRateLimit(
    ip: string,
    isCheckout: boolean
): Promise<{
    limited: boolean;
    limit: number;
    remaining: number;
    resetAt: number; // Unix timestamp (ms)
}> {
    const limiter = isCheckout ? getCheckoutLimiter() : getGeneralLimiter();
    const { success, limit, remaining, reset } = await limiter.limit(ip);
    return {
        limited: !success,
        limit,
        remaining,
        resetAt: reset, // already a Unix timestamp in ms
    };
}
