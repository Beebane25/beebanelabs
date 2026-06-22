-- ============================================
-- MIGRATION: Tambah Tabel Baru + Fix Schema
-- Untuk Supabase PostgreSQL
-- ============================================

-- Pastikan users table punya kolom yang diperlukan
-- (Cek dulu apakah kolom sudah ada)
DO $$ 
BEGIN
  -- Tambah kolom tokens jika belum ada
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'tokens') THEN
    ALTER TABLE users ADD COLUMN tokens INTEGER DEFAULT 5;
  END IF;
  
  -- Tambah kolom role jika belum ada
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
    ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));
  END IF;
  
  -- Tambah kolom dob jika belum ada
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'dob') THEN
    ALTER TABLE users ADD COLUMN dob DATE;
  END IF;
END $$;

-- ============================================
-- 1. ARTICLE UNLOCKS (sudah ada, cek saja)
-- ============================================
-- Tabel ini sudah ada di database
-- CREATE TABLE IF NOT EXISTS article_unlocks (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   user_id UUID REFERENCES users(id) ON DELETE CASCADE,
--   article_slug TEXT NOT NULL,
--   unlocked_at TIMESTAMPTZ DEFAULT NOW(),
--   UNIQUE(user_id, article_slug)
-- );

-- ============================================
-- 2. READING HISTORY (baru)
-- ============================================
CREATE TABLE IF NOT EXISTS reading_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  article_slug TEXT NOT NULL,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  read_duration_seconds INTEGER DEFAULT 0,
  UNIQUE(user_id, article_slug)
);

-- ============================================
-- 3. USER ACTIVITY (baru)
-- ============================================
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('login', 'logout', 'unlock', 'read', 'purchase', 'password_change')),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. USER PREFERENCES (baru)
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  language TEXT DEFAULT 'id',
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_reading_history_user ON reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_slug ON reading_history(article_slug);
CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created ON user_activity(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- Service role (API) punya akses penuh
-- ============================================

-- Reading History Policies
CREATE POLICY "service_all_reading_history" ON reading_history 
  FOR ALL USING (true) WITH CHECK (true);

-- User Activity Policies
CREATE POLICY "service_all_user_activity" ON user_activity 
  FOR ALL USING (true) WITH CHECK (true);

-- User Preferences Policies
CREATE POLICY "service_all_user_preferences" ON user_preferences 
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- FUNCTION: Auto-create user_preferences saat user baru
-- ============================================
CREATE OR REPLACE FUNCTION create_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_preferences (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk auto-create preferences
DROP TRIGGER IF EXISTS on_user_created ON users;
CREATE TRIGGER on_user_created
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_preferences();

-- ============================================
-- FUNCTION: Log activity saat unlock artikel
-- ============================================
CREATE OR REPLACE FUNCTION log_unlock_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_activity (user_id, activity_type, description, metadata)
  VALUES (
    NEW.user_id, 
    'unlock', 
    'Membuka artikel: ' || NEW.article_slug,
    jsonb_build_object('article_slug', NEW.article_slug)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk log unlock
DROP TRIGGER IF EXISTS on_article_unlocked ON article_unlocks;
CREATE TRIGGER on_article_unlocked
  AFTER INSERT ON article_unlocks
  FOR EACH ROW
  EXECUTE FUNCTION log_unlock_activity();

-- ============================================
-- SELESAI
-- ============================================
-- Jalankan query ini di Supabase SQL Editor
-- Semua tabel baru akan punya RLS enabled
-- Service role (untuk API) punya akses penuh
