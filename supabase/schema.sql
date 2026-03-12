-- Orin Leather — Supabase Database Schema
-- Paste this into: Supabase Dashboard → SQL Editor → Run

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id              TEXT PRIMARY KEY,
    payment_intent_id TEXT UNIQUE NOT NULL,
    amount          INTEGER NOT NULL,       -- in cents (e.g., 12500 = $125.00)
    currency        TEXT NOT NULL DEFAULT 'usd',
    email           TEXT,
    shipping        JSONB,                  -- { name, address: { line1, city, state, postal_code, country } }
    status          TEXT NOT NULL DEFAULT 'fulfilled'
                    CHECK (status IN ('fulfilled', 'refunded', 'failed', 'disputed')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS orders_payment_intent_idx ON orders (payment_intent_id);
CREATE INDEX IF NOT EXISTS orders_email_idx ON orders (email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row-level security (lock table to service role only — no public access)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Only the service role key (server-side) can read/write
CREATE POLICY "Service role full access"
    ON orders FOR ALL
    USING (auth.role() = 'service_role');

-- ── Future tables ─────────────────────────────────────────────────────────────
-- Add products table here when moving away from the in-code product catalog
-- CREATE TABLE IF NOT EXISTS products ( ... );
