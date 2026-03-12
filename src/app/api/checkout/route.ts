import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import { getProducts } from '@/lib/data/products';
import { toCents, CURRENCIES, type CurrencyCode } from '@/lib/currency';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/ratelimit';

// Using default Node.js runtime — Stripe SDK requires Node APIs (crypto, http).

// Maximum request body size (10 KB) — prevents abuse via oversized payloads
const MAX_BODY_SIZE = 10 * 1024;

// 1. Zod Schema for strict input validation
const checkoutSchema = z.object({
    items: z.array(
        z.object({
            productId: z.string().min(1),
            quantity: z.number().int().positive().max(99), // Prevent unreasonable quantities
        })
    ).min(1, 'Cart cannot be empty'),
    currency: z.enum(Object.keys(CURRENCIES) as [CurrencyCode, ...CurrencyCode[]]).optional().default('USD'),
});

type CheckoutRequest = z.infer<typeof checkoutSchema>;

export async function POST(req: NextRequest) {
    try {
        // ── Rate limiting (5 requests/min per IP) ─────────────────────
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        const rl = await checkRateLimit(ip, 'checkout');

        if (rl.limited) {
            return NextResponse.json(
                { error: 'Too many checkout attempts. Please try again shortly.' },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
                        'X-RateLimit-Limit': String(rl.limit),
                        'X-RateLimit-Remaining': '0',
                    },
                }
            );
        }

        // ── Request size validation ───────────────────────────────────
        const bodyText = await req.text();
        if (!bodyText) {
            return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
        }
        if (bodyText.length > MAX_BODY_SIZE) {
            return NextResponse.json({ error: 'Request too large' }, { status: 413 });
        }

        let bodyJson;
        try {
            bodyJson = JSON.parse(bodyText);
        } catch {
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        // 2. Validate the request with Zod
        const parsed = checkoutSchema.safeParse(bodyJson);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid cart data', details: parsed.error.format() },
                { status: 400 }
            );
        }

        const { items, currency } = parsed.data;

        // 3. Fetch canonical product data from Supabase/Store (Async)
        const products = await getProducts();

        // 4. Server-side price calculation in USD
        let usdTotal = 0;
        for (const item of items) {
            const product = products.find((p) => p.id === item.productId);
            if (!product) {
                return NextResponse.json({ error: `Unknown product: ${item.productId}` }, { status: 400 });
            }
            usdTotal += product.price * item.quantity;
        }

        if (usdTotal <= 0) {
            return NextResponse.json({ error: 'Invalid order amount' }, { status: 400 });
        }

        // 5. Convert price to target currency
        const amount = toCents(usdTotal, currency);

        // 6. Create a PaymentIntent with the final amount and currency.
        // Idempotency key: same cart + same currency + same 1-minute window = same intent
        const cartFingerprint = btoa(JSON.stringify(items)); // Buffer.from is not Edge-compatible by default, btoa works
        const timeBucket = Math.floor(Date.now() / 60000);
        const idempotencyKey = `checkout-${cartFingerprint}-${currency}-${timeBucket}`;

        // Ensure Stripe is properly configured before calling API
        if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV !== 'production') {
            console.error('[STRIPE_CHECKOUT] Missing STRIPE_SECRET_KEY, skipping Intent creation.');
            return NextResponse.json({ error: 'Checkout disabled locally without stripe keys' }, { status: 503 });
        }

        const paymentIntent = await stripe.paymentIntents.create(
            {
                amount,
                currency: currency.toLowerCase(),
                automatic_payment_methods: { enabled: true },
            },
            { idempotencyKey }
        );

        // 7. Send the client secret back to the frontend
        return NextResponse.json({ clientSecret: paymentIntent.client_secret }, { status: 200 });

    } catch (error: unknown) {
        // Log full error on server — never expose internal details to client
        console.error('[STRIPE_CHECKOUT_ERROR]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
