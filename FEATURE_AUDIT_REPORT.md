# AUDIT FITUR MENYELURUH — BeebaneLabs
### Tanggal: 23 Juni 2026
### Target: https://iothub.pages.dev
### Repo: github.com/Beebane25/beebanelabs
### Stack: Cloudflare Pages + Supabase REST API + Midtrans

---

## RINGKASAN EKSEKUTIF

| Severity | Jumlah |
|----------|--------|
| CRITICAL | 3 |
| HIGH | 4 |
| MEDIUM | 6 |
| LOW | 5 |
| INFO | 3 |
| **TOTAL** | **21** |

---

## TEMUAN CRITICAL

### 1. [CRITICAL] SRI Hash Mismatch — Semua JavaScript Gagal Load

**Severity:** CRITICAL | **Dampak:** Website 100% non-functional

**Apa yang terjadi:**
File `index.html` memiliki Subresource Integrity (SRI) hash yang TIDAK cocok dengan file `app.js` yang ter-deploy. Browser memblokir script karena hash verification gagal.

**Langkah Menemukan:**
```bash
# 1. Download deployed JS
curl -s "https://iothub.pages.dev/js/app.js" -o deployed_app.js

# 2. Hitung hash aktual
openssl dgst -sha384 -binary deployed_app.js | openssl base64 -A
# Output: IZ5dDDKKZ4HI6KiZ2Bx3FZHt4jZFdHacyTDIWPV+OYYrfncfZgu/vSfSrPBjiGiz

# 3. Cek hash di HTML
grep "integrity" index.html
# Output: integrity="sha384-3LC+6jrDCkDuBVP/zw1UTZp5hsei66MST3Aq2lQuW2VNBTrRnZlaG4AEarfVz4Lr"

# 4. TIDAK COCOK → browser blokir script
```

**Verifikasi di Browser:**
```javascript
typeof PaywallSystem    // "undefined" ← SEHARUSNYA "object"
typeof AuthSystem       // "undefined" ← SEHARUSNYA "object"
typeof Toast            // "undefined" ← SEHARUSNYA "object"
typeof renderGroupedArticles // "undefined" ← SEHARUSNYA "function"
```

**Dampak:**
- ❌ Artikel "Tutorial Paling Populer" TIDAK render (grid kosong)
- ❌ Login/Register TIDAK berfungsi
- ❌ Token/Paywall system TIDAK berfungsi
- ❌ Toast notifications TIDAK berfungsi
- ❌ Cookie consent TIDAK muncul
- ❌ Theme toggle TIDAK berfungsi
- ❌ Share buttons TIDAK di-inject
- ❌ Table of Contents TIDAK di-inject
- ❌ Copy code buttons TIDAK berfungsi
- ❌ Learning Path TIDAK render
- ❌ Article filter TIDAK berfungsi
- ❌ Navbar auth area TIDAK render

**Rekomendasi:**
```bash
# HAPUS atribut integrity dan crossorigin dari SEMUA HTML files
# Di index.html, ganti:
# <script src="js/app.js?v=7.6" integrity="sha384-..." crossorigin="anonymous">
# Menjadi:
# <script src="js/app.js?v=7.11">
```
SRI hash sulit dipertahankan untuk static sites yang sering update. Hapus SRI kecuali ada build pipeline yang otomatis compute hash.

---

### 2. [CRITICAL] API Keys Supabase & Midtrans Ter-expose di Git History

**Severity:** CRITICAL | **Dampak:** Full database access, payment manipulation

**Apa yang terjadi:**
File `wrangler.toml` berisi:
- `SUPABASE_URL` — endpoint database
- `SUPABASE_SERVICE_KEY` — service role key (full access, bypasses RLS)
- `MIDTRANS_SERVER_KEY` — payment gateway key
- `MIDTRANS_IS_PRODUCTION` — flag production/sandbox

File ini pernah di-commit ke git (3 kali):
```
8673968 Rebrand: IoTHub -> BeebaneLabs
915d4d1 feat: server-side token system + security fix
cdbc55e Add wrangler.toml for local dev environment variables
```

**Langkah Menemukan:**
```bash
# 1. Cek apakah wrangler.toml pernah di-commit
git log --all --oneline -- wrangler.toml
# 3 commits ditemukan

# 2. Isi wrangler.toml saat ini
cat wrangler.toml
# SUPABASE_URL = "https://nbungbznljbiddlwyvbd.supabase.co"
# SUPABASE_SERVICE_KEY = "sb_publishable_XX4t1V_Ur7U82qmQW6HNkw_Y8kTtiTQ"
# MIDTRANS_SERVER_KEY = "Mid-server-HCBkVMSxPouPg0Cm0vy5hlEa"

# 3. File sudah di .gitignore tapi MASIH ADA di git history
git show 8673968:wrangler.toml
```

**Dampak:**
- Attacker bisa akses SEMUA data di Supabase (users, sessions, payments)
- Attacker bisa bypass RLS policies
- Attacker bisa manipulasi payment webhooks
- Attacker bisa tambah token untuk akun sendiri

**Rekomendasi:**
1. **ROTATE SEMUA KEYS SEKARANG** di Supabase Dashboard dan Midtrans Dashboard
2. Gunakan `git filter-branch` atau BFG Repo-Cleaner untuk hapus dari history
3. Set keys hanya di Cloudflare Dashboard (Environment Variables)
4. Jangan pernah commit secrets — gunakan `.env.local` yang di-gitignore

---

### 3. [CRITICAL] check-access.js — SQL Injection Risk + CORS Wildcard

**Severity:** CRITICAL | **Dampak:** Unauthorized data access, CORS bypass

**File:** `functions/api/check-access.js`

**Langkah Menemukan:**
```bash
# 1. Cek CORS policy di check-access.js
grep "Access-Control-Allow-Origin" functions/api/check-access.js
# Output: 'Access-Control-Allow-Origin': '*'

# 2. Bandingkan dengan auth.js
grep "Access-Control-Allow-Origin" functions/api/auth.js
# Output: Whitelist-based

# 3. Cek SQL query di check-access.js
grep "select" functions/api/check-access.js
# Output: ?id=eq.${sessions[0].user_id}&selectemail,plan,is_active
# ↑ ADA TYPO: "selectemail" seharusnya "select=email" (missing = sign)

# 4. Token tidak di-encode
grep "token" functions/api/check-access.js | head -3
# const sessions = await supabaseQuery(..., `?token=eq.${token}&select=...`);
# ↑ Token langsung di-concatenate tanpa encodeURIComponent
```

**Dampak:**
- CORS `*` = website MANAPUN bisa akses API ini
- SQL query error karena typo `selectemail` (seharusnya `select=email`)
- Token tidak di-encode = potential injection via special characters

**Rekomendasi:**
1. Ganti `Access-Control-Allow-Origin: *` dengan whitelist
2. Fix typo: `&selectemail,plan,is_active` → `&select=email,plan,is_active`
3. Tambah `encodeURIComponent(token)` pada query
4. Tambah input validation (max length, type check)

---

## TEMUAN HIGH

### 4. [HIGH] CORS Policy Tidak Konsisten

**Severity:** HIGH

| Endpoint | CORS Policy |
|----------|-------------|
| `/api/auth` | Whitelist (`iothub.pages.dev`, `beebanelabs.id`) |
| `/api/tokens` | Whitelist |
| `/api/create-payment` | Whitelist |
| `/api/payment-webhook` | `api.midtrans.com` only |
| `/api/check-access` | **`*` (WILDCARD)** |
| `/api/reading-history` | **`origin \|\| '*'` (fallback wildcard)** |
| `/api/unlocked-articles` | **`origin \|\| '*'` (fallback wildcard)** |
| `/api/user-activity` | **`origin \|\| '*'` (fallback wildcard)** |

**Langkah Menemukan:**
```bash
# Test CORS dengan arbitrary origin
curl -sI -H "Origin: http://evil.com" \
  -X POST "https://iothub.pages.dev/api/check-access" \
  -H "Content-Type: application/json" \
  -d '{"token":"test"}' | grep -i "access-control"

# check-access: Access-Control-Allow-Origin: * (BAD)
# auth: Access-Control-Allow-Origin: https://iothub.pages.dev (GOOD)
```

**Rekomendasi:** Samakan semua endpoint menggunakan whitelist yang sama.

---

### 5. [HIGH] ALLOWED_ORIGINS Menggunakan Domain Lama

**Severity:** HIGH

Semua Cloudflare Functions memiliki:
```javascript
const ALLOWED_ORIGINS = ['https://iothub.pages.dev', 'https://beebanelabs.id'];
```

Masalah:
- Domain `beebanelabs.id` belum tentu ter-point ke Cloudflare Pages
- Jika domain diaktifkan, CORS akan menolak karena origin tidak match
- Harusnya juga include domain baru jika ada

**Rekomendasi:**
```javascript
const ALLOWED_ORIGINS = [
  'https://iothub.pages.dev',
  'https://beebanelabs.id',
  'https://www.beebanelabs.id'
];
```

---

### 6. [HIGH] Frontend vs Backend Password Policy Mismatch

**Severity:** HIGH | **Dampak:** User confusion, failed registrations

| Aspek | Frontend (HTML) | Backend (auth.js) |
|-------|-----------------|-------------------|
| Min length | 6 karakter | 8 karakter |
| Huruf besar | Tidak required | **Required** |
| Angka | Tidak required | **Required** |
| Simbol | Tidak required | **Required** |

**Langkah Menemukan:**
```bash
# Frontend requirement
grep "minlength" js/app.js
# minlength="6"
grep "Minimal" js/app.js
# 'Minimal 6 karakter'

# Backend requirement
grep "Password" functions/api/auth.js
# Password minimal 8 karakter
# Password harus mengandung huruf besar
# Password harus mengandung angka
# Password harus mengandung simbol
```

**Dampak:** User isi password "abcdef" → frontend accept → backend reject dengan error yang confusing.

**Rekomendasi:** Update frontend validation untuk match backend: 8+ chars, uppercase, number, symbol.

---

### 7. [HIGH] Rate Limiting Tidak Di-import

**Severity:** HIGH

File `functions/api/_rate-limit.js` mendefinisikan rate limiter, TAPI tidak ada function yang meng-import-nya.

```bash
# Cek apakah _rate-limit.js di-import
grep -l "_rate-limit" functions/api/*.js
# (empty - tidak ada yang import)
```

Rate limiting di `auth.js` menggunakan in-memory `Map()` yang:
- Reset pada setiap cold start (Cloudflare Workers stateless)
- Tidak persisten antar requests
- Mudah di-bypass dengan menunggu cold start

**Rekomendasi:** Gunakan Cloudflare's built-in Rate Limiting Rules di dashboard, atau implementasi Durable Objects.

---

## TEMUAN MEDIUM

### 8. [MEDIUM] robots.txt Masih Referensi Branding Lama

**Severity:** MEDIUM

```
Sitemap: https://iothub.id/sitemap.xml
# IoTHub - Tutorial Teknologi IoT
```

**Rekomendasi:** Update ke `https://beebanelabs.id/sitemap.xml` dan ganti komentar.

---

### 9. [MEDIUM] OG Meta Tags Referensi URL Lama

**Severity:** MEDIUM

```html
<meta property="og:url" content="https://beebane25.github.io/iothub/">
<meta property="og:image" content="https://beebane25.github.io/iothub/images/og-default.svg">
<meta name="twitter:image" content="https://beebane25.github.io/iothub/images/og-default.svg">
```

Masih mengarah ke GitHub Pages lama, bukan `iothub.pages.dev` atau `beebanelabs.id`.

**Rekomendasi:** Update semua OG URLs ke domain production.

---

### 10. [MEDIUM] Version Inconsistency di Multiple Places

**Severity:** MEDIUM

| Component | Version |
|-----------|---------|
| CSS `style.css?v` | v7.10 |
| JS `app.js?v` | v7.6 |
| `APP_VERSION` di JS | 3.0.0 |
| `/* v2.2.0 */` comment | v2.2.0 |

4 versi berbeda untuk 2 file = confusing untuk maintenance.

**Rekomendasi:** Satu versi scheme. Contoh: gunakan `APP_VERSION` sebagai single source of truth.

---

### 11. [MEDIUM] Newsletter Subscribe Endpoint Tidak Ada

**Severity:** MEDIUM

Frontend memanggil `/api/subscribe` tapi function ini TIDAK ADA:
```javascript
const res = await fetch(API_BASE + '/api/subscribe', { ... });
```

Karena endpoint tidak ada, frontend selalu fallback ke fake success:
```javascript
catch (err) {
  btn.textContent = '✓ Tersubscribe!';  // PALSU - email tidak tersimpan
}
```

User mengira berhasil subscribe tapi email tidak pernah tersimpan.

**Rekomendasi:** Buat `/api/subscribe` function yang menyimpan email ke Supabase, atau hapus form newsletter.

---

### 12. [MEDIUM] Session Token Tidak Di-encode di Beberapa Tempat

**Severity:** MEDIUM

Di `check-access.js`:
```javascript
const sessions = await supabaseQuery(..., `?token=eq.${token}&select=...`);
// Token langsung di-concatenate tanpa encodeURIComponent
```

Sedangkan di `auth.js` dan `tokens.js` sudah benar:
```javascript
const encodedToken = encodeURIComponent(token);
```

**Rekomendasi:** Konsisten gunakan `encodeURIComponent()` di semua endpoint.

---

### 13. [MEDIUM] Sitemap Tidak Update

**Severity:** MEDIUM

`sitemap.xml` mungkin masih referensi URL lama (iothub.pages.dev atau beebane25.github.io/iothub). Perlu verifikasi dan update.

---

## TEMUAN LOW

### 14. [LOW] Missing X-Permitted-Cross-Domain-Policies Header

### 15. [LOW] CSP Menggunakan unsafe-inline dan unsafe-eval

```http
Content-Security-Policy: script-src 'self' 'unsafe-inline' 'unsafe-eval'
```
`unsafe-eval` sangat longgar — memungkinkan XSS via `eval()`.

### 16. [LOW] Error Messages Terlalu Detail di Auth

Backend mengembalikan pesan spesifik:
- "Email sudah terdaftar" → email enumeration
- "Password harus mengandung huruf besar" → password policy disclosure

### 17. [LOW] Session Token 7 Hari Terlalu Lama

Token session valid selama 7 hari. Untuk static site dengan paywall, 24-48 jam lebih aman.

### 18. [LOW] Missing HttpOnly Flag pada Client-Side Session

Session disimpan di localStorage (bukan HttpOnly cookie). XSS bisa curi session token.

---

## TEMUAN INFO

### 19. [INFO] AdSense Slots Kosong

3 ad slot placeholders di index.html (top, mid, bottom) belum diisi.

### 20. [INFO] YouTube & Discord Links Belum Aktif

Footer social links ke YouTube dan Discord masih `href="#"`.

### 21. [INFO] 42 File HTML Uncommitted Changes

```
 M 404.html
 M about.html
 M articles/*.html (21 files)
 M contact.html
 M kategori/*.html (11 files)
 ... (42 files total)
```

Perubahan signifikan belum di-commit dan push.

---

## FITUR YANG SUDAH BAIIK ✅

1. **Security Headers Lengkap** — HSTS, CSP, X-Frame-Options, X-Content-Type-Options, dll
2. **PBKDF2 Password Hashing** — 100,000 iterations + SHA-256 (strong)
3. **Constant-Time Password Comparison** — Timing attack protection
4. **Input Sanitization** — HTML tag stripping, length limits
5. **Server-Side Token System** — Tidak bergantung localStorage untuk data sensitif
6. **Payment Signature Verification** — Midtrans webhook di-verify dengan HMAC-SHA512
7. **Idempotent Payment Processing** — Check sebelum insert, prevent double-credit
8. **Race Condition Handling** — Optimistic locking untuk token deduction
9. **Session Expiry Enforcement** — Client-side 7-day session limit
10. **CSRF Token Pattern** — Double-submit pattern implemented
11. **Email Obfuscation** — Base64 reversed encoding di localStorage
12. **Cache Strategy** — HTML no-cache, JS/CSS cached 1 hour
13. **Cookie Consent** — GDPR-style banner
14. **Reduced Motion Support** — `prefers-reduced-motion` respected
15. **Search with XSS Protection** — Input sanitized sebelum render

---

## PRIORITAS PERBAIKAN

| Prioritas | Temuan | Effort |
|-----------|--------|--------|
| 🔴 1 | SRI Hash → Hapus integrity attribute | 10 menit |
| 🔴 2 | Rotate API keys (Supabase + Midtrans) | 30 menit |
| 🔴 3 | Fix check-access.js (CORS + typo) | 5 menit |
| 🟡 4 | Samakan CORS policy semua endpoint | 15 menit |
| 🟡 5 | Update ALLOWED_ORIGINS | 5 menit |
| 🟡 6 | Fix password policy mismatch | 10 menit |
| 🟡 7 | Implement proper rate limiting | 30 menit |
| 🟢 8 | Update robots.txt, OG tags, sitemap | 15 menit |
| 🟢 9 | Fix version inconsistency | 10 menit |
| 🟢 10 | Create/remove subscribe endpoint | 15 menit |
| 🟢 11 | Commit & push 42 pending changes | 5 menit |

---

*Audit dilakukan oleh Hermes Agent dengan web-security-audit + dogfood skills.*
*Target: iothub.pages.dev | Source: local repo di C:\Users\user\Documents\pribadi\web adsence*
