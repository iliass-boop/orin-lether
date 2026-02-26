import { createClient, SupabaseClient } from '@supabase/supabase-js';

/* ============================================================
   Orin Leather — Supabase Admin Client (Server-only)

   Uses the SERVICE ROLE key — full database access.
   NEVER import this in client components or expose to the browser.
   ============================================================ */

let _client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
    if (_client) return _client;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error(
            'Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. ' +
            'See .env.local.example for setup instructions.'
        );
    }

    _client = createClient(url, key, {
        auth: {
            // Service-role clients don't need session management
            persistSession: false,
            autoRefreshToken: false,
        },
    });

    return _client;
}

/** True when Supabase is configured (env vars present). */
export function isSupabaseConfigured(): boolean {
    return !!(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
}
