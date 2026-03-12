import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { isStripeConfigured } from '@/lib/env';
import { isRedisAvailable } from '@/lib/ratelimit';

/* ============================================================
   Health Check Endpoint — Production Readiness
   Skills: vercel-deployment, performance-optimizer
   
   Returns structured service status for monitoring/alerting.
   ============================================================ */

export const runtime = 'edge';

export async function GET() {
    const services = {
        supabase: isSupabaseConfigured() ? 'configured' : 'unconfigured',
        stripe: isStripeConfigured ? 'configured' : 'unconfigured',
        redis: isRedisAvailable ? 'configured' : 'unconfigured (using in-memory fallback)',
        sentry: process.env.SENTRY_DSN ? 'configured' : 'unconfigured',
        resend: process.env.RESEND_API_KEY ? 'configured' : 'unconfigured',
    };

    const allConfigured = Object.values(services).every((s) => s === 'configured');

    return NextResponse.json(
        {
            status: allConfigured ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            services,
            version: process.env.npm_package_version || '0.1.0',
            environment: process.env.NODE_ENV || 'development',
        },
        { status: 200 }
    );
}
