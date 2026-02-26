import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import { products } from '@/lib/store';
import { toCents, CURRENCIES, type CurrencyCode } from '@/lib/currency';

// Define the expected request body
interface CheckoutRequest {
    items: {
        productId: string;
        quantity: number;
    }[];
    currency?: CurrencyCode;
}

// Security: Calculate order amount purely on the server. Never trust client prices.
// Returns null if any item has an invalid quantity or unknown product ID.
const calculateOrderAmountUSD = (items: CheckoutRequest['items']): number | null => {
    let total = 0;
    for (const item of items) {
        if (!Number.isInteger(item.quantity) || item.quantity < 1) return null;
        const product = products.find((p) => p.id === item.productId);
        if (!product) return null;
        total += product.price * item.quantity;
    }
    return total; // in USD dollars — currency conversion applied later
};

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as CheckoutRequest;
        const { items, currency: rawCurrency } = body;

        // 1. Validate currency (default to USD)
        const currency: CurrencyCode = rawCurrency && rawCurrency in CURRENCIES
            ? rawCurrency
            : 'USD';

        // 2. Validate the request
        if (!items || !Array.isArray(items) || items.length === 0) {
            return new NextResponse(JSON.stringify({ error: 'Invalid cart data' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 3. Server-side price calculation in USD, then convert to target currency
        const usdTotal = calculateOrderAmountUSD(items);

        if (usdTotal === null || usdTotal <= 0) {
            return new NextResponse(JSON.stringify({ error: 'Invalid order amount or item data' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 4. Convert price to target currency
        const amount = toCents(usdTotal, currency);

        // 5. Create a PaymentIntent with the final amount and currency.
        // Idempotency key: same cart + same currency + same 1-minute window = same intent
        const cartFingerprint = Buffer.from(JSON.stringify(items)).toString('base64');
        const timeBucket = Math.floor(Date.now() / 60000);
        const idempotencyKey = `checkout-${cartFingerprint}-${currency}-${timeBucket}`;

        const paymentIntent = await stripe.paymentIntents.create(
            {
                amount,
                currency: currency.toLowerCase(),
                automatic_payment_methods: { enabled: true },
            },
            { idempotencyKey }
        );

        // 4. Send the client secret back to the frontend
        return new NextResponse(
            JSON.stringify({
                clientSecret: paymentIntent.client_secret,
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );

    } catch (error: unknown) {
        // Log full error on server — never expose internal details to client
        console.error('[STRIPE_ERROR]', error);
        return new NextResponse(
            JSON.stringify({ error: 'Internal Server Error' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
