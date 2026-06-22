# Rekomendasi Database Schema - BeebaneLabs

## Status Saat Ini (Supabase)

### Tabel yang SUDAH ada:
1. **users** - Data user (id, email, password, name, dob, role, tokens, plan)
2. **sessions** - Session tokens (token, user_id, expires_at)
3. **article_unlocks** - Artikel yang sudah di-unlock (user_id, article_slug, unlocked_at)

### Yang Perlu DITAMBAHKAN:

#### 1. reading_history
Melacak artikel yang sudah dibaca (bukan hanya di-unlock)

```sql
CREATE TABLE reading_history (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  article_slug TEXT NOT NULL,
  read_at TIMESTAMP DEFAULT NOW(),
  read_duration_seconds INT DEFAULT 0,
  UNIQUE(user_id, article_slug)
);
```

**Fungsi:**
- Track artikel mana yang sudah dibaca
- Hitung durasi baca
- Tampilkan "Terakhir dibaca" di profile
- Statistik reading activity

#### 2. user_activity
Log aktivitas user

```sql
CREATE TABLE user_activity (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'login', 'unlock', 'read', 'purchase'
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Fungsi:**
- Riwayat login
- Riwayat unlock artikel
- Riwayat pembelian token
- Audit trail untuk keamanan

#### 3. user_preferences
Pengaturan user

```sql
CREATE TABLE user_preferences (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark', -- 'dark' atau 'light'
  language TEXT DEFAULT 'id',
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Fungsi:**
- Simpan theme preference
- Simpan notification settings
- Sync preference antar device

#### 4. article_views (opsional - untuk analytics)
Counter views per artikel

```sql
CREATE TABLE article_views (
  id BIGSERIAL PRIMARY KEY,
  article_slug TEXT NOT NULL,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP DEFAULT NOW(),
  user_agent TEXT,
  ip_address INET
);
```

**Fungsi:**
- Hitung total views per artikel
- Analytics untuk admin
- Artikel populer

---

## Yang TIDAK perlu di-database:

### Tetap di localStorage (UI preference saja):
- `iothub_auth` - Session data (perlu untuk persistence)
- `cookie_consent` - Cookie consent (UI preference)
- `theme` - Theme preference (bisa di-sync ke user_preferences)

### Tidak perlu disimpan:
- `iothub_app_version` - Cache busting, tidak sensitif
- `iothub_access` - Sudah ada di users.plan

---

## Priority Implementasi:

1. **HIGH** - reading_history (untuk profile "Artikel Terakhir Dibaca")
2. **MEDIUM** - user_activity (untuk tab Aktivitas di profile)
3. **LOW** - user_preferences (untuk sync settings)
4. **LOW** - article_views (analytics)

---

## SQL Migration Script:

```sql
-- 1. Reading History
CREATE TABLE IF NOT EXISTS reading_history (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  article_slug TEXT NOT NULL,
  read_at TIMESTAMP DEFAULT NOW(),
  read_duration_seconds INT DEFAULT 0,
  UNIQUE(user_id, article_slug)
);

-- 2. User Activity
CREATE TABLE IF NOT EXISTS user_activity (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark',
  language TEXT DEFAULT 'id',
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_reading_history_user ON reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity(activity_type);
```
