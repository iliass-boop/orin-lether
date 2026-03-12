import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

/* ============================================================
   Stripe Webhook Handler — Enterprise Grade
   Skills: stripe-integration, api-security-best-practices
   
   Security:
   1. Verifies Stripe-Signature header (prevents forged webhooks)
   2. Idempotent: tracks processed event.id to prevent duplicates
   3. On payment_intent.succeeded → sends event to Inngest
   4. Returns 200 immediately — Stripe requires < 5s response time
   
   Setup:
   - Add STRIPE_WEBHOOK_SECRET from Stripe Dashboard → Webhooks
   - For local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   ============================================================ */

// Lazy Stripe instance — prevents build-time crash when STRIPE_SECRET_KEY is absent.
let _stripeWebhook: Stripe | null = null;

function getStripeWebhook(): Stripe {
    if (_stripeWebhook) return _stripeWebhook;
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
    _stripeWebhook = new Stripe(key, { apiVersion: '2026-01-28.clover' });
    return _stripeWebhook;
}

// ── Idempotency: In-memory processed event set ────────────────────────
// In production with multiple instances, use Redis/Supabase instead.
// Stripe retries webhooks up to ~7 days, so we keep a sliding window.
const PROCESSED_EVENTS = new Set<string>();
const MAX_PROCESSED_EVENTS = 10_000;

function isEventProcessed(eventId: string): boolean {
    return PROCESSED_EVENTS.has(eventId);
}

function markEventProcessed(eventId: string): void {
    PROCESSED_EVENTS.add(eventId);
    // Prevent unbounded memory growth: evict oldest entries
    if (PROCESSED_EVENTS.size > MAX_PROCESSED_EVENTS) {
        const first = PROCESSED_EVENTS.values().next().value;
        if (first) PROCESSED_EVENTS.delete(first);
    }
}

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

    // ── Verify signature ──────────────────────────────────────────────
    let event: Stripe.Event;
    try {
        event = getStripeWebhook().webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error('[WEBHOOK_VERIFY_FAIL]', msg);
        return NextResponse.json({ error: `Webhook signature verification failed` }, { status: 400 });
    }

    // ── Idempotency check ─────────────────────────────────────────────
    if (isEventProcessed(event.id)) {
        console.log(`[WEBHOOK] Duplicate event ${event.id} — skipping`);
        return NextResponse.json({ received: true, deduplicated: true });
    }
    markEventProcessed(event.id);

    // ── Route events ──────────────────────────────────────────────────
    switch (event.type) {
        case 'payment_intent.succeeded': {
            const intent = event.data.object as Stripe.PaymentIntent;
            console.log(`[WEBHOOK] payment_intent.succeeded: ${intent.id} ($${(intent.amount / 100).toFixed(2)} ${intent.currency.toUpperCase()})`);

            // 1. Send to Inngest for background fulfillment (with retries)
            try {
                const { inngest } = await import('@/inngest/client');
                await inngest.send({
                    name: 'stripe/payment_intent.succeeded',
                    data: { object: event.data.object },
                });
                console.log(`[WEBHOOK] → Inngest queued for fulfillment`);
            } catch (inngestError) {
                // Don't fail the webhook if Inngest is not configured
                console.warn('[WEBHOOK] Inngest not available, skipping background job:', inngestError);
            }

            // 2. Send receipt email via Resend
            try {
                const customerEmail = intent.receipt_email || null;
                
                if (customerEmail && process.env.RESEND_API_KEY) {
                    const { Resend } = await import('resend');
                    const { OrderReceiptEmail } = await import('@/emails/OrderReceipt');
                    const resend = new Resend(process.env.RESEND_API_KEY);
                    
                    await resend.emails.send({
                        from: 'Orin Leather <orders@orinleather.com>',
                        to: [customerEmail],
                        subject: `Orin Leather — Order Receipt ${intent.id.slice(-6).toUpperCase()}`,
                        react: OrderReceiptEmail({
                            orderId: intent.id,
                            amountFormatted: (intent.amount / 100).toLocaleString('en-US', { style: 'currency', currency: intent.currency.toUpperCase() }),
                            currency: intent.currency,
                            shipping: intent.shipping ? {
                                name: intent.shipping.name,
                                address: intent.shipping.address ? {
                                    line1: intent.shipping.address.line1 || undefined,
                                    city: intent.shipping.address.city || undefined,
                                    state: intent.shipping.address.state || undefined,
                                    postal_code: intent.shipping.address.postal_code || undefined,
                                    country: intent.shipping.address.country || undefined,
                                } : undefined
                            } : null,
                            createdAt: new Date(intent.created * 1000).toISOString(),
                        })
                    });
                    console.log(`[WEBHOOK] Receipt email sent to ${customerEmail}`);
                }
            } catch (emailError) {
                // Never fail the webhook for email errors — Inngest handles retry
                console.error('[WEBHOOK] Failed to send receipt email:', emailError);
            }
            break;
        }

        case 'payment_intent.payment_failed': {
            const failedIntent = event.data.object as Stripe.PaymentIntent;
            const lastError = failedIntent.last_payment_error;
            console.warn(`[WEBHOOK] payment_intent.payment_failed: ${failedIntent.id}`, {
                code: lastError?.code,
                message: lastError?.message,
                type: lastError?.type,
            });
            // Future: notify customer, flag for review
            break;
        }

        case 'charge.dispute.created': {
            console.warn(`[WEBHOOK] charge.dispute.created: ${event.data.object.id}`);
            // Future: flag order for review, send alert to admin
            break;
        }

        case 'charge.refunded': {
            console.log(`[WEBHOOK] charge.refunded: ${event.data.object.id}`);
            // Future: update order status in Supabase
            break;
        }

        default:
            // Acknowledge unknown events without error
            console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
            break;
    }

    // Always return 200 — Stripe will retry on any non-2xx response
    return NextResponse.json({ received: true });
}

// Note: In Next.js App Router, body parsers are not applied to route handlers
// by default, so req.text() returns the raw body — no config needed.
