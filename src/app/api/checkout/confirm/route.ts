import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const payment_intent = searchParams.get('payment_intent');

    if (!payment_intent) {
        return new NextResponse(JSON.stringify({ error: 'Missing payment intent ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        // Retrieve the PaymentIntent from Stripe securely on the backend
        const intent = await stripe.paymentIntents.retrieve(payment_intent as string);

        return new NextResponse(JSON.stringify({
            status: intent.status,
            amount: intent.amount
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('[STRIPE_RETRIEVE_ERROR]', error);
        return new NextResponse(
            JSON.stringify({ error: 'Internal Server Error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
