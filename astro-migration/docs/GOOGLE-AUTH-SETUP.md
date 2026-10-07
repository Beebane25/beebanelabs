# Panduan Setup Google Login - BeebaneLabs

## Yang Perlu Dilakukan di Dashboard

### 1. Google Cloud Console (console.cloud.google.com)

```
1. Buka https://console.cloud.google.com
2. Buat Project baru (atau pakai yang ada)
3. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
4. Application type: Web application
5. Name: BeebaneLabs
6. Authorized JavaScript origins:
   - https://beebanelabs.pages.dev
   - http://localhost:8788 (untuk dev/testing)
7. Authorized redirect URIs:
   - https://beebanelabs.pages.dev  (Supabase redirect)
8. Klik Create → Copy Client ID dan Client Secret
```

### 2. Supabase Dashboard (supabase.com)

```
1. Buka https://supabase.com → Pilih project BeebaneLabs
2. Authentication → Providers → Google
3. Enable Google provider
4. Masukkan:
   - Client ID: [dari Google Cloud Console]
   - Client Secret: [dari Google Cloud Console]
5. Klik Save
6. Copy URL dan Anon Key dari:
   Settings → API → Project URL dan anon public key
```

### 3. Update Kode (sudah saya siapkan)

File yang perlu diedit: `js/app.js`

Cari baris ini dan ganti dengan nilai dari Supabase Dashboard:

```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co';  // Ganti ini
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';  // Ganti ini
```

### 4. Environment Variables di Cloudflare Pages

```
1. Buka Cloudflare Dashboard → Pages → BeebaneLabs project
2. Settings → Environment variables
3. Pastikan variabel ini ada:
   - SUPABASE_URL
   - SUPABASE_SERVICE_KEY
   (Sudah ada dari setup sebelumnya)
```

### 5. Commit & Push

```bash
cd "C:\Users\user\Documents\pribadi\web adsence"
git add -A
git commit -m "feat: add Google OAuth login"
git push origin main
```

## Arsitektur Flow

```
User klik "Masuk dengan Google"
  → supabase.auth.signInWithOAuth({ provider: 'google' })
  → Redirect ke Google consent screen
  → User pilih akun Google
  → Google redirect ke Supabase callback
  → Supabase create session
  → Redirect balik ke BeebaneLabs
  → JavaScript detect OAuth callback (URL hash #access_token=...)
  → POST /api/google-auth dengan email, name, google_id
  → Backend: create/find user di custom users table
  → Backend: generate session token
  → Frontend: simpan session di localStorage (AuthSystem)
  → Selesai! User ter-login
```

## Fitur yang Didapat

- ✅ Login dengan 1 klik (tidak perlu ingat password)
- ✅ Auto-create akun baru (5 token gratis)
- ✅ Jika email sudah terdaftar → link ke akun yang ada
- ✅ Session 7 hari (sama seperti login manual)
- ✅ Kompatibel dengan sistem token/paywall yang ada
- ✅ Avatar dari Google (opsional)

## Security Notes

- Supabase handle OAuth flow (aman)
- Backend validasi email format (prevent XSS)
- Session token 32-byte random (sama kuatnya dengan login manual)
- Email diobfuscate sebelum simpan di localStorage
- Google tidak punya akses ke data BeebaneLabs lainnya
