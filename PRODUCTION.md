# Orin Leather — Production Launch Guide

> Follow these steps in order. Each step links to the relevant dashboard.

---

## Step 1: Deploy to Vercel (5 min)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (from project root)
vercel --prod
```

During deploy, Vercel will ask for env vars. Use `.env.local.example` as your reference.

Or connect via UI: [vercel.com/new](https://vercel.com/new) → Import Git Repository → `iliass-boop/orin-lether`

---

## Step 2: Upstash Redis — Rate Limiting (2 min)

1. Go to [console.upstash.com](https://console.upstash.com) → **Create Database**
2. Name: `orin-ratelimit`, Type: **Global** (lowest latency worldwide)
3. Copy **REST URL** and **REST Token**
4. Add to Vercel: Dashboard → Project → Settings → Environment Variables:
   ```
   UPSTASH_REDIS_REST_URL=https://...
   UPSTASH_REDIS_REST_TOKEN=...
   ```

✅ **Result**: Rate limiting activates globally — 100 req/min general, 5 req/min on checkout.

---

## Step 3: Supabase Database (5 min)

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Region: Choose closest to your users (EU Central for Europe)
3. Once created → **SQL Editor** → paste contents of `supabase/schema.sql` → **Run**
4. Go to **Settings → API**:
   - Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy **service_role** key (not anon!) → `SUPABASE_SERVICE_ROLE_KEY`
5. Add both to Vercel environment variables

✅ **Result**: Orders stored in PostgreSQL — concurrent-safe, queryable, backed up.

---

## Step 4: Stripe Webhook (3 min)

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. URL: `https://yourdomain.com/api/webhooks/stripe`
4. Events to subscribe:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.dispute.created`
5. Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET` in Vercel

✅ **Result**: Every successful payment triggers order fulfillment + receipt email via Inngest.

---

## Step 5: Inngest (3 min)

1. Go to [app.inngest.com](https://app.inngest.com) → **New App**
2. App ID: `orin-leather`
3. Settings → **Event Keys** → copy key → `INNGEST_EVENT_KEY`
4. Settings → **Signing Keys** → copy key → `INNGEST_SIGNING_KEY`
5. Add to Vercel env vars, then redeploy
6. In Inngest dashboard → **Apps** → **Sync** → URL: `https://yourdomain.com/api/inngest`

✅ **Result**: `fulfill-order` and `send-receipt` run with automatic retries in production.

---

## Step 6: Sentry Error Monitoring (3 min)

1. Go to [sentry.io](https://sentry.io) → **New Project** → **Next.js**
2. Copy **DSN** → `NEXT_PUBLIC_SENTRY_DSN`
3. Go to Settings → Auth Tokens → Create token → `SENTRY_AUTH_TOKEN`
4. Add to Vercel env vars:
   ```
   NEXT_PUBLIC_SENTRY_DSN=https://...@o....ingest.sentry.io/...
   SENTRY_ORG=your-org
   SENTRY_PROJECT=orin-leather
   SENTRY_AUTH_TOKEN=sntrys_...
   ```

✅ **Result**: All errors captured with stack traces, performance monitoring active.

---

## Step 7: Resend Email (3 min)

1. Go to [resend.com](https://resend.com) → **Add API Key**
2. Copy key → `RESEND_API_KEY`
3. Go to **Domains** → **Add Domain** → verify your sending domain (e.g., `orinleather.com`)
4. Set `RESEND_FROM_EMAIL=orders@orinleather.com`

✅ **Result**: Branded order receipt emails sent automatically after every purchase.

---

## Step 8: Custom Domain

1. Vercel Dashboard → Project → **Domains** → Add `orinleather.com`
2. Follow DNS instructions (CNAME or A record)
3. SSL certificate auto-provisioned by Vercel (Let's Encrypt)

---

## Post-Launch Checklist

- [ ] Place a real test order end-to-end
- [ ] Verify receipt email arrives
- [ ] Check Inngest dashboard — `fulfill-order` job shows as completed
- [ ] Check Sentry — no unexpected errors
- [ ] Run smoke test: `k6 run -e BASE_URL=https://yourdomain.com load-tests/smoke.js`
- [ ] Set up Sentry alerts (error rate > 1% → email/Slack notification)
