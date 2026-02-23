import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is missing. Please set the environment variable.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-01-28.clover', // Use the latest API version or your account's default
    appInfo: {
        name: 'Orin Leather',
        version: '0.1.0',
    },
});

export default stripe;
