import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/* ============================================================
   Orin Leather — Distributed Rate Limiters (Upstash Redis)
   
   Algorithm: Sliding Window (no thundering-herd at window boundary)
   Fallback: In-memory Map for development without Redis

   Skills: api-security-best-practices, stripe-integration
   ============================================================ */

// ── Redis availability check ──────────────────────────────────────────
export const isRedisAvailable = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

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

// ── In-memory fallback for development ────────────────────────────────
// Simple sliding window using a Map. Works per-instance only (not shared
// across serverless invocations), but sufficient for local development.
const memoryStore = new Map<string, { count: number; resetAt: number }>();

function inMemoryRateLimit(
    key: string,
    maxRequests: number,
    windowMs: number
): { limited: boolean; limit: number; remaining: number; resetAt: number } {
    const now = Date.now();
    const entry = memoryStore.get(key);

    if (!entry || now > entry.resetAt) {
        memoryStore.set(key, { count: 1, resetAt: now + windowMs });
        return { limited: false, limit: maxRequests, remaining: maxRequests - 1, resetAt: now + windowMs };
    }

    entry.count += 1;
    const limited = entry.count > maxRequests;
    return {
        limited,
        limit: maxRequests,
        remaining: Math.max(0, maxRequests - entry.count),
        resetAt: entry.resetAt,
    };
}

// Clean stale entries every 5 minutes to prevent memory leak
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of memoryStore) {
            if (now > entry.resetAt) memoryStore.delete(key);
        }
    }, 5 * 60 * 1000);
}

// ── General limiter ───────────────────────────────────────────────────────
// 100 requests per 60-second sliding window per IP.
let _generalLimiter: Ratelimit | null = null;

export function getGeneralLimiter(): Ratelimit {
    if (_generalLimiter) return _generalLimiter;
    _generalLimiter = new Ratelimit({
        redis: getRedis(),
        limiter: Ratelimit.slidingWindow(100, '60 s'),
        prefix: 'rl:general',
        analytics: true,
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

// ── Newsletter limiter ─────────────────────────────────────────────────
// 3 requests per 60-second sliding window per IP.
let _newsletterLimiter: Ratelimit | null = null;

export function getNewsletterLimiter(): Ratelimit {
    if (_newsletterLimiter) return _newsletterLimiter;
    _newsletterLimiter = new Ratelimit({
        redis: getRedis(),
        limiter: Ratelimit.slidingWindow(3, '60 s'),
        prefix: 'rl:newsletter',
        analytics: true,
    });
    return _newsletterLimiter;
}

/**
 * Returns true if the given IP has hit the rate limit.
 * Falls back to in-memory rate limiting when Redis is not configured.
 */
export async function checkRateLimit(
    ip: string,
    variant: 'general' | 'checkout' | 'newsletter' = 'general'
): Promise<{
    limited: boolean;
    limit: number;
    remaining: number;
    resetAt: number; // Unix timestamp (ms)
}> {
    // In-memory fallback when Redis is not configured
    if (!isRedisAvailable) {
        const configs = {
            general:    { max: 100, windowMs: 60_000 },
            checkout:   { max: 5,   windowMs: 60_000 },
            newsletter: { max: 3,   windowMs: 60_000 },
        };
        const cfg = configs[variant];
        return inMemoryRateLimit(`${variant}:${ip}`, cfg.max, cfg.windowMs);
    }

    const limiters = {
        general: getGeneralLimiter,
        checkout: getCheckoutLimiter,
        newsletter: getNewsletterLimiter,
    };
    const limiter = limiters[variant]();
    const { success, limit, remaining, reset } = await limiter.limit(ip);
    return {
        limited: !success,
        limit,
        remaining,
        resetAt: reset,
    };
}
