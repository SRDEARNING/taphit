-- Taphit Supabase Schema

-- Users
CREATE TABLE IF NOT EXISTS users (
    wallet_address TEXT PRIMARY KEY,
    display_name TEXT,
    referrer_wallet TEXT REFERENCES users(wallet_address),
    total_wagered NUMERIC DEFAULT 0,
    total_won NUMERIC DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    referral_earnings NUMERIC DEFAULT 0,
    platform_balance NUMERIC DEFAULT 0,
    demo_balance NUMERIC DEFAULT 100,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    onchain_address TEXT UNIQUE,
    user_wallet TEXT REFERENCES users(wallet_address),
    asset TEXT NOT NULL,
    direction TEXT NOT NULL,
    stake_amount NUMERIC NOT NULL,
    multiplier NUMERIC NOT NULL,
    price_zone_low NUMERIC NOT NULL,
    price_zone_high NUMERIC NOT NULL,
    entry_price NUMERIC NOT NULL,
    expiry_timestamp TIMESTAMPTZ NOT NULL,
    settlement_price NUMERIC,
    status TEXT DEFAULT 'pending',
    payout_amount NUMERIC DEFAULT 0,
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    settled_at TIMESTAMPTZ,
    transaction_signature TEXT
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_wallet TEXT REFERENCES users(wallet_address),
    type TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    solana_signature TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referral events
CREATE TABLE IF NOT EXISTS referral_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_wallet TEXT REFERENCES users(wallet_address),
    referred_wallet TEXT REFERENCES users(wallet_address),
    order_id UUID REFERENCES orders(id),
    amount NUMERIC NOT NULL,
    paid_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_wallet);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_expiry ON orders(expiry_timestamp) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_wallet);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own data" ON users FOR SELECT USING (wallet_address = current_setting('app.current_user'));
CREATE POLICY "Users read own orders" ON orders FOR SELECT USING (user_wallet = current_setting('app.current_user'));
CREATE POLICY "Users read own transactions" ON transactions FOR SELECT USING (user_wallet = current_setting('app.current_user'));
