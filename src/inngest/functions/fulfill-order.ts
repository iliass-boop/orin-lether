import { inngest } from '../client';
import { appendOrder } from '@/lib/orders';

/* ============================================================
   Inngest Function: fulfill-order
   
   Triggered by: stripe/payment_intent.succeeded
   - Writes order to persistent store (orders.json / DB)
   - Emits orin/order.fulfilled so downstream jobs can subscribe
   - Retried automatically up to 3× with exponential backoff
   ============================================================ */

export const fulfillOrder = inngest.createFunction(
    {
        id: 'fulfill-order',
        name: 'Fulfill Order',
        retries: 3,
        // Exponential backoff: 30s → 2m → 8m between attempts
        cancelOn: [],
    },
    { event: 'stripe/payment_intent.succeeded' },
    async ({ event, step, logger }) => {
        const paymentIntent = event.data.object as {
            id: string;
            amount: number;
            currency: string;
            metadata?: Record<string, string>;
            receipt_email?: string;
            shipping?: {
                name?: string;
                address?: {
                    line1?: string;
                    city?: string;
                    state?: string;
                    postal_code?: string;
                    country?: string;
                };
            };
        };

        logger.info(`Fulfilling order for PaymentIntent ${paymentIntent.id}`);

        // Step 1: Persist the order record
        const order = await step.run('persist-order', async () => {
            const record = {
                id: `order_${Date.now()}`,
                paymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                email: paymentIntent.receipt_email ?? null,
                shipping: paymentIntent.shipping ?? null,
                status: 'fulfilled' as const,
                createdAt: new Date().toISOString(),
            };

            await appendOrder(record);
            return record;
        });

        logger.info(`Order ${order.id} persisted`);

        // Step 2: Emit the fulfilled event so send-receipt (and others) can react
        await step.sendEvent('emit-order-fulfilled', {
            name: 'orin/order.fulfilled',
            data: { order },
        });

        return { orderId: order.id, status: 'fulfilled' };
    }
);
