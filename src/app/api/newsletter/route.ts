import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/ratelimit';

/* ============================================================
   Newsletter Subscription API
   Skills: api-security-best-practices, zod-validation-expert
   
   Security:
   - Rate limited: 3 requests per 60s per IP
   - Zod-validated email input
   - Request size limited to 1 KB
   ============================================================ */

const MAX_BODY_SIZE = 1024; // 1 KB — email payload should be tiny

const newsletterSchema = z.object({
    email: z.string().email('Please enter a valid email address').max(255),
});

export async function POST(req: NextRequest) {
    try {
        // ── Rate limiting (3 requests/min per IP) ─────────────────────
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        const rl = await checkRateLimit(ip, 'newsletter');

        if (rl.limited) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
                        'X-RateLimit-Limit': String(rl.limit),
                        'X-RateLimit-Remaining': '0',
                    },
                }
            );
        }

        // ── Request size validation ───────────────────────────────────
        const bodyText = await req.text();
        if (!bodyText) {
            return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
        }
        if (bodyText.length > MAX_BODY_SIZE) {
            return NextResponse.json({ error: 'Request too large' }, { status: 413 });
        }

        let bodyJson;
        try {
            bodyJson = JSON.parse(bodyText);
        } catch {
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        // ── Validate with Zod ─────────────────────────────────────────
        const parsed = newsletterSchema.safeParse(bodyJson);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message || 'Invalid email format' },
                { status: 400 }
            );
        }

        const { email } = parsed.data;

        // In production: add email to mailing list provider (Resend, Mailchimp, etc.)
        console.log(`[NEWSLETTER] New subscription: ${email}`);

        // Simulate API call to mailing list provider
        await new Promise((resolve) => setTimeout(resolve, 300));

        return NextResponse.json(
            { message: 'Successfully subscribed to the newsletter' },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error('[NEWSLETTER_ERROR]', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
