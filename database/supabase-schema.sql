-- ============================================
-- IoTHub Database Schema for Supabase
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. USERS TABLE
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'monthly', 'yearly')),
  plan_expires TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- 2. SESSIONS TABLE
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- 3. VIEWS TABLE (log reading activity)
CREATE TABLE views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  article TEXT NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_hash TEXT
);

-- 4. SUBSCRIBERS TABLE (newsletter)
CREATE TABLE subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  source TEXT DEFAULT 'website'
);

-- 5. ARTICLES TABLE (metadata)
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT,
  difficulty TEXT CHECK (difficulty IN ('pemula', 'menengah', 'lanjut')),
  is_free BOOLEAN DEFAULT false,
  read_time INTEGER,
  published_at DATE
);

-- 6. PAYMENTS TABLE
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  order_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'IDR',
  plan TEXT NOT NULL,
  provider TEXT DEFAULT 'midtrans',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'capture', 'settlement', 'expire', 'cancel', 'deny')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_views_user ON views(user_id);
CREATE INDEX idx_views_article ON views(article);
CREATE INDEX idx_views_session ON views(session_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_order ON payments(order_id);

-- RLS (Row Level Security) - Enable for production
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE views ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Public read access for articles
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read articles" ON articles FOR SELECT USING (true);

-- Users can read their own data
CREATE POLICY "Users read own data" ON users FOR SELECT USING (auth.uid() = id);

-- Service role full access (for backend)
CREATE POLICY "Service role full access" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role views" ON views FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role subscribers" ON subscribers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role payments" ON payments FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- IMPORT DATA FROM CSV
-- ============================================
-- Run these AFTER creating tables:
-- 1. Go to Supabase Table Editor
-- 2. Click each table
-- 3. Click "Insert" → "Import from CSV"
-- 4. Select the corresponding .csv file
-- ============================================
