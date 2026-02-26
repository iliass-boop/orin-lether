import { Resend } from 'resend';
import { OrderReceiptEmail } from '@/emails/OrderReceipt';

/* ============================================================
   Orin Leather — Email Delivery (Resend)
   
   sendOrderReceipt() is called by the Inngest send-receipt function.
   Swap the provider by replacing this file — the Inngest function
   stays unchanged.
   ============================================================ */

let _resend: Resend | null = null;

function getResend(): Resend {
    if (_resend) return _resend;
    const key = process.env.RESEND_API_KEY;
    if (!key) {
        throw new Error(
            'Missing RESEND_API_KEY. Get one free at https://resend.com'
        );
    }
    _resend = new Resend(key);
    return _resend;
}

export function isEmailConfigured(): boolean {
    return !!process.env.RESEND_API_KEY;
}

export interface ReceiptData {
    orderId: string;
    email: string;
    amount: number;           // cents
    currency: string;
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
}

export async function sendOrderReceipt(data: ReceiptData): Promise<void> {
    const resend = getResend();

    const from = process.env.RESEND_FROM_EMAIL ?? 'orders@orinleather.com';
    const amountFormatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: data.currency.toUpperCase(),
    }).format(data.amount / 100);

    const { error } = await resend.emails.send({
        from,
        to: data.email,
        subject: `Your Orin Leather order ${data.orderId} — ${amountFormatted}`,
        react: OrderReceiptEmail({
            orderId: data.orderId,
            amountFormatted,
            currency: data.currency,
            shipping: data.shipping,
            createdAt: data.createdAt,
        }),
    });

    if (error) {
        throw new Error(`Resend delivery failed: ${error.message}`);
    }
}
