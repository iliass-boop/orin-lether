import { createBrowserClient } from '@supabase/ssr';
import { env } from '../env';

export function createClient() {
    // Only attempt to start the client if the env vars are available
    if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return null;
    }

    return createBrowserClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}
