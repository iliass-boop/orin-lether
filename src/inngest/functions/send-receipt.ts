import { inngest } from '../client';
import { sendOrderReceipt, isEmailConfigured } from '@/lib/email';

/* ============================================================
   Inngest Function: send-receipt
   
   Triggered by: orin/order.fulfilled
   Sends a branded HTML email via Resend.
   
   To activate: add RESEND_API_KEY + RESEND_FROM_EMAIL to .env.local
   Free tier: 3,000 emails/month at resend.com
   ============================================================ */

export const sendReceipt = inngest.createFunction(
    {
        id: 'send-receipt',
        name: 'Send Order Receipt',
        retries: 2,
    },
    { event: 'orin/order.fulfilled' },
    async ({ event, step, logger }) => {
        const { order } = event.data as {
            order: {
                id: string;
                amount: number;
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
                createdAt: string;
            };
        };

        if (!order.email) {
            logger.warn(`Order ${order.id} has no email — skipping receipt`);
            return { skipped: true, reason: 'no-email' };
        }

        if (!isEmailConfigured()) {
            logger.warn('RESEND_API_KEY not set — skipping receipt (add to .env.local to activate)');
            return { skipped: true, reason: 'no-api-key' };
        }

        await step.run('send-email', async () => {
            await sendOrderReceipt({
                orderId: order.id,
                email: order.email!,
                amount: order.amount,
                currency: order.currency,
                shipping: order.shipping,
                createdAt: order.createdAt,
            });
        });

        logger.info(`Receipt sent to ${order.email} for order ${order.id}`);
        return { sent: true, orderId: order.id, email: order.email };
    }
);
