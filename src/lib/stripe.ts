import Stripe from 'stripe';

// Lazy Stripe initialisation — the module can be safely imported by any server
// route without crashing when STRIPE_SECRET_KEY is absent (e.g. routes that
// do not use Stripe in dev). The key is validated at the point of first use.
let _stripe: Stripe | null = null;

function getStripe(): Stripe {
    if (_stripe) return _stripe;

    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
        throw new Error('STRIPE_SECRET_KEY is missing. Please set the environment variable.');
    }

    _stripe = new Stripe(key, {
        apiVersion: '2026-01-28.clover',
        appInfo: { name: 'Orin Leather', version: '0.1.0' },
    });

    return _stripe;
}

// Proxy keeps call-sites identical to the previous `stripe.paymentIntents.create(…)` API.
const stripe = new Proxy({} as Stripe, {
    get(_target, prop) {
        return (getStripe() as unknown as Record<string | symbol, unknown>)[prop as string];
    },
});

export default stripe;
