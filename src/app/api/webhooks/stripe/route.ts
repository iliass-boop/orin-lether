import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { inngest } from '@/inngest/client';

/* ============================================================
   Stripe Webhook Handler
   
   1. Verifies the Stripe-Signature header (prevents forged webhooks)
   2. On payment_intent.succeeded → sends event to Inngest
      (Inngest then calls fulfill-order + send-receipt with retries)
   3. Returns 200 immediately — Stripe requires < 5s response time
   
   Setup:
   - Add STRIPE_WEBHOOK_SECRET from Stripe Dashboard → Webhooks
   - For local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   ============================================================ */

// Must use the raw Stripe SDK (not our lazy proxy) for webhook verification
const stripeWebhook = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-01-28.clover',
});

export async function POST(req: NextRequest) {
    const rawBody = await req.text();
    const sig = req.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig) {
        return NextResponse.json({ error: 'Missing Stripe-Signature header' }, { status: 400 });
    }

    if (!webhookSecret) {
        console.error('[WEBHOOK] STRIPE_WEBHOOK_SECRET is not set');
        return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    // Verify signature — throws on mismatch
    let event: Stripe.Event;
    try {
        event = stripeWebhook.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error('[WEBHOOK_VERIFY_FAIL]', msg);
        return NextResponse.json({ error: `Webhook signature verification failed` }, { status: 400 });
    }

    // Route events to Inngest — returns immediately, Inngest handles retries
    switch (event.type) {
        case 'payment_intent.succeeded':
            await inngest.send({
                name: 'stripe/payment_intent.succeeded',
                data: { object: event.data.object },
            });
            console.log(`[WEBHOOK] payment_intent.succeeded → Inngest queued`);
            break;

        case 'payment_intent.payment_failed':
            // Future: notify the customer that payment failed
            console.warn(`[WEBHOOK] payment_intent.payment_failed: ${event.data.object.id}`);
            break;

        case 'charge.dispute.created':
            // Future: flag order for review
            console.warn(`[WEBHOOK] charge.dispute.created: ${event.data.object.id}`);
            break;

        default:
            // Acknowledge unknown events without error
            break;
    }

    // Always return 200 — Stripe will retry on any non-2xx response
    return NextResponse.json({ received: true });
}

// Note: In Next.js App Router, body parsers are not applied to route handlers
// by default, so req.text() returns the raw body — no config needed.
