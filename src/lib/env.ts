import { z } from 'zod';

/* ============================================================
   Orin Leather — Environment Validation (Zod)
   
   Ensures required environment variables are present at runtime.
   Provides graceful defaults or fallback flags in development.
   ============================================================ */

const envSchema = z.object({
    // Supabase (PostgreSQL + Auth)
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

    // Stripe
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
    STRIPE_SECRET_KEY: z.string().min(1).optional(),
    STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),

    // Redis Rate Limiting (Upstash)
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

    // Background Jobs (Inngest)
    INNGEST_EVENT_KEY: z.string().min(1).optional(),
    INNGEST_SIGNING_KEY: z.string().min(1).optional(),

    // Emails (Resend)
    RESEND_API_KEY: z.string().min(1).optional(),
    CONTACT_EMAIL_ADDRESS: z.string().email().default('hello@orinleather.com'),
});

// Parse the environment
export const env = envSchema.parse(process.env);

// Helpers to cleanly check if services are configured
export const isSupabaseConfigured = Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
);

export const isStripeConfigured = Boolean(
    env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && env.STRIPE_SECRET_KEY
);

export const isRedisConfigured = Boolean(
    env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
);
