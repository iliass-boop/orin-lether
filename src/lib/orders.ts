import fs from 'fs';
import path from 'path';
import { getSupabaseAdmin, isSupabaseConfigured } from './supabase';

/* ============================================================
   Orin Leather — Order Store

   Strategy:
   - Supabase (PostgreSQL) when env vars are configured → production
   - JSON-lines file fallback → local development (zero config)

   To switch to Supabase:
   1. Create project at supabase.com
   2. Run supabase/schema.sql in the SQL editor
   3. Add NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to .env.local
   ============================================================ */

export interface Order {
    id: string;
    paymentIntentId: string;
    amount: number;           // cents
    currency: string;
    email: string | null;
    shipping: {
        name?: string;
        address?: {
            line1?: string;
            city?: string;
            state?: string;
            postal_code?: string;
            country?: string;
        };
    } | null;
    status: 'fulfilled' | 'refunded' | 'failed' | 'disputed';
    createdAt: string;        // ISO 8601
}

// ── Supabase helpers ──────────────────────────────────────────────────────────

async function insertOrderSupabase(order: Order): Promise<void> {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('orders').insert({
        id: order.id,
        payment_intent_id: order.paymentIntentId,
        amount: order.amount,
        currency: order.currency,
        email: order.email,
        shipping: order.shipping,
        status: order.status,
        created_at: order.createdAt,
    });
    if (error) throw new Error(`Supabase insert failed: ${error.message}`);
}

async function readOrdersSupabase(): Promise<Order[]> {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw new Error(`Supabase read failed: ${error.message}`);

    return (data ?? []).map((row) => ({
        id: row.id,
        paymentIntentId: row.payment_intent_id,
        amount: row.amount,
        currency: row.currency,
        email: row.email,
        shipping: row.shipping,
        status: row.status,
        createdAt: row.created_at,
    }));
}

async function findByPaymentIntentSupabase(paymentIntentId: string): Promise<Order | undefined> {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('payment_intent_id', paymentIntentId)
        .single();

    if (error || !data) return undefined;

    return {
        id: data.id,
        paymentIntentId: data.payment_intent_id,
        amount: data.amount,
        currency: data.currency,
        email: data.email,
        shipping: data.shipping,
        status: data.status,
        createdAt: data.created_at,
    };
}

// ── File-based fallback helpers ───────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

async function insertOrderFile(order: Order): Promise<void> {
    await fs.promises.mkdir(DATA_DIR, { recursive: true });
    const line = JSON.stringify(order) + '\n';
    await fs.promises.appendFile(ORDERS_FILE, line, 'utf-8');
}

async function readOrdersFile(): Promise<Order[]> {
    try {
        const content = await fs.promises.readFile(ORDERS_FILE, 'utf-8');
        return content
            .trim()
            .split('\n')
            .filter(Boolean)
            .map((line) => JSON.parse(line) as Order);
    } catch (err: unknown) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
        throw err;
    }
}

async function findByPaymentIntentFile(paymentIntentId: string): Promise<Order | undefined> {
    const orders = await readOrdersFile();
    return orders.find((o) => o.paymentIntentId === paymentIntentId);
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Persist an order. Uses Supabase in production, file store locally. */
export async function appendOrder(order: Order): Promise<void> {
    if (isSupabaseConfigured()) {
        await insertOrderSupabase(order);
    } else {
        console.warn('[orders] Supabase not configured — using local file store');
        await insertOrderFile(order);
    }
}

/** Read all orders (latest first). */
export async function readOrders(): Promise<Order[]> {
    return isSupabaseConfigured() ? readOrdersSupabase() : readOrdersFile();
}

/** Find a single order by PaymentIntent ID. */
export async function findOrderByPaymentIntent(paymentIntentId: string): Promise<Order | undefined> {
    return isSupabaseConfigured()
        ? findByPaymentIntentSupabase(paymentIntentId)
        : findByPaymentIntentFile(paymentIntentId);
}
