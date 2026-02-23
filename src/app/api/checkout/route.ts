import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import { products } from '@/lib/store'; // To securely validate prices on the server

// Define the expected request body
interface CheckoutRequest {
    items: {
        productId: string;
        quantity: number;
    }[];
}

// Security: Calculate order amount purely on the server. Never trust client prices.
const calculateOrderAmount = (items: CheckoutRequest['items']): number => {
    let total = 0;
    for (const item of items) {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
            total += product.price * item.quantity;
        }
    }
    // Stripe expects amounts in the smallest currency unit (e.g., cents for USD)
    return total * 100;
};

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as CheckoutRequest;
        const { items } = body;

        // 1. Validate the request
        if (!items || !Array.isArray(items) || items.length === 0) {
            return new NextResponse(JSON.stringify({ error: 'Invalid cart data' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 2. Server-side price calculation
        const amount = calculateOrderAmount(items);

        if (amount <= 0) {
            return new NextResponse(JSON.stringify({ error: 'Invalid order amount' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 3. Create a PaymentIntent with the final amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            // In the latest api versions, automatic_payment_methods is mostly preferred over explicit payment_method_types
            automatic_payment_methods: {
                enabled: true,
            },
        });

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

    } catch (error: any) {
        console.error('[STRIPE_ERROR]', error);
        return new NextResponse(
            JSON.stringify({ error: 'Internal Server Error', message: error.message }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
