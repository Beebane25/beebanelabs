// Cloudflare Pages Function: Auth (Register & Login)
// URL: /api/auth
// Security-hardened version with input sanitization, CORS whitelist, rate limiting

const ALLOWED_ORIGINS = ['https://beebanelabs.pages.dev', 'https://beebanelabs.id', 'https://www.beebanelabs.id'];

// Rate limiting configuration
// Supabase table required: rate_limit_log (see SQL below)
// If table doesn't exist, falls back to in-memory (per-instance, less reliable)
// CREATE TABLE rate_limit_log (
//   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//   ip text NOT NULL,
//   endpoint text NOT NULL DEFAULT 'login',
//   created_at timestamptz DEFAULT now()
// );
// CREATE INDEX idx_rate_limit_ip_endpoint ON rate_limit_log(ip, endpoint, created_at);

const MAX_LOGIN_ATTEMPTS = 5;
const MAX_REGISTER_PER_IP = 3;
const REGISTER_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

// Disposable email domain blacklist
const BLOCKED_EMAIL_DOMAINS = [
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', 'guerrillamailblock.com',
  'tempmail.com', 'throwaway.email', 'yopmail.com', 'sharklasers.com', 'grr.la',
  'dispostable.com', 'trashmail.com', 'trashmail.net', 'trashmail.me',
  '10minutemail.com', 'temp-mail.org', 'temp-mail.com', 'fakeinbox.com',
  'tempinbox.com', 'mohmal.com', 'burnermail.io', 'harakirimail.com',
  'maildrop.cc', 'mailnesia.com', 'guerrillamail.info', 'guerrillamail.de',
  'guerillamail.com', 'guerrillamail.org', 'spamgourmet.com', 'mytemp.email',
  'emailondeck.com', 'mintemail.com', 'tmail.ws', 'tmpmail.net',
  'tmpmail.org', 'throwam.com', 'mailcatch.com', 'tempail.com',
  'tempr.email', 'discard.email', 'discardmail.com', 'mailsac.com',
  'getnada.com', 'maildrop.cc', 'inboxbear.com', 'mailexpire.com',
  'temporary-mail.net', 'trashymail.com', 'trashymail.net', 'wegwerfmail.de',
  '020.co.uk', '0815.ru', '0clickemail.com', '0wnd.net', '0wnd.org'
];

// In-memory rate limit cache (best-effort, supplemented by Supabase)
const rateLimitCache = new Map();

// In-memory CAPTCHA challenge store (5 min expiry, cleaned periodically)
const captchaStore = new Map();

async function checkRateLimit(supabaseUrl, supabaseKey, ip, endpoint = 'login') {
  const now = Date.now();
  const windowStart = new Date(now - RATE_LIMIT_WINDOW_MS).toISOString();
  
  // Try Supabase first (persistent across cold starts)
  try {
    const encodedIp = encodeURIComponent(ip);
    const attempts = await supabaseQuery(
      supabaseUrl, supabaseKey, 'rate_limit_log',
      `?ip=eq.${encodedIp}&endpoint=eq.${endpoint}&created_at=gte.${windowStart}&select=id`
    );
    // If Supabase returns an array (table exists), use it
    if (Array.isArray(attempts)) {
      if (attempts.length >= MAX_LOGIN_ATTEMPTS) {
        return { allowed: false, remaining: 0 };
      }
      return { allowed: true, remaining: MAX_LOGIN_ATTEMPTS - attempts.length };
    }
    // If Supabase returns error (table doesn't exist), fall through to in-memory
  } catch (e) {
    // Supabase unavailable, fall through to in-memory
  }
  
  // Fallback: in-memory rate limiting (per-instance, best-effort)
  const key = `${ip}:${endpoint}`;
  const cached = rateLimitCache.get(key) || [];
  const recent = cached.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  rateLimitCache.set(key, recent);
  if (recent.length >= MAX_LOGIN_ATTEMPTS) {
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: MAX_LOGIN_ATTEMPTS - recent.length };
}

async function recordAttempt(supabaseUrl, supabaseKey, ip, endpoint = 'login') {
  const now = Date.now();
  
  // Record in Supabase (persistent)
  try {
    await supabaseQuery(supabaseUrl, supabaseKey, 'rate_limit_log', '', 'POST', {
      ip, endpoint, created_at: new Date(now).toISOString()
    });
  } catch (e) {
    // Fallback to in-memory
    const key = `${ip}:${endpoint}`;
    const cached = rateLimitCache.get(key) || [];
    cached.push(now);
    rateLimitCache.set(key, cached);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const SUPABASE_URL = env.SUPABASE_URL || '';
  const SUPABASE_KEY = env.SUPABASE_SERVICE_KEY || '';
  const origin = request.headers.get('origin') || '';
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';

  // CSRF: Block non-allowed origins (defense-in-depth)
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return cors(403, { error: 'Origin tidak diizinkan' }, origin);
  }

  try {
    const body = await request.json();
    const action = body.action;
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';

    // === REGISTER ===
    if (action === 'register') {
      // Type validation: prevent NoSQL injection
      if (typeof body.email !== 'string' || typeof body.password !== 'string') {
        return cors(400, { error: 'Input tidak valid' }, origin);
      }
      const email = (body.email || '').trim().toLowerCase();
      const name = sanitizeName(body.name || '');
      const password = body.password || '';

      // Rate limiting: max 5 register attempts per IP per 5 minutes
      const rateCheck = await checkRateLimit(SUPABASE_URL, SUPABASE_KEY, ip, 'register');
      if (!rateCheck.allowed) {
        return cors(429, { error: 'Terlalu banyak percobaan. Coba lagi dalam 5 menit.' }, origin);
      }

      // IP-based account creation limit: max 3 accounts per IP per 24 hours
      const registerWindowStart = new Date(Date.now() - REGISTER_WINDOW_MS).toISOString();
      try {
        const recentRegisters = await supabaseQuery(
          SUPABASE_URL, SUPABASE_KEY, 'rate_limit_log',
          `?ip=eq.${encodeURIComponent(ip)}&endpoint=eq.register_success&created_at=gte.${registerWindowStart}&select=id`
        );
        if (Array.isArray(recentRegisters) && recentRegisters.length >= MAX_REGISTER_PER_IP) {
          return cors(429, { error: 'Batas pembuatan akun tercapai (maksimal 3 akun per 24 jam). Coba lagi besok.' }, origin);
        }
      } catch (e) {
        // If rate_limit_log table doesn't exist, continue without IP limit
      }

      // Input validation
      if (!email) return cors(400, { error: 'Email harus diisi' }, origin);
      // Strict email regex - prevents XSS injection (CWE-79, CWE-20)
      if (!/^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/.test(email.toLowerCase())) return cors(400, { error: 'Format email tidak valid. Contoh: nama@gmail.com' }, origin);
      if (!name || name.length < 2) return cors(400, { error: 'Nama harus diisi (minimal 2 karakter)' }, origin);
      if (name.length > 100) return cors(400, { error: 'Nama maksimal 100 karakter' }, origin);
      if (password.length < 8) return cors(400, { error: 'Password tidak memenuhi syarat (minimal 8 karakter, huruf besar, angka, dan simbol)' }, origin);
      if (password.length > 128) return cors(400, { error: 'Password maksimal 128 karakter' }, origin);
      if (!/[A-Z]/.test(password)) return cors(400, { error: 'Password tidak memenuhi syarat' }, origin);
      if (!/[0-9]/.test(password)) return cors(400, { error: 'Password tidak memenuhi syarat' }, origin);
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return cors(400, { error: 'Password tidak memenuhi syarat' }, origin);

      // Cloudflare Turnstile verification (if secret key configured and widget loaded)
      const turnstileToken = body.turnstile_token || '';
      const turnstileSecret = env.TURNSTILE_SECRET_KEY || '';
      if (turnstileSecret && turnstileToken) {
        try {
          const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ secret: turnstileSecret, response: turnstileToken, remoteip: ip })
          });
          const verifyData = await verifyRes.json();
          if (!verifyData.success) {
            return cors(400, { error: 'Verifikasi CAPTCHA gagal. Coba lagi.' }, origin);
          }
        } catch (e) {
          console.error('Turnstile verification error:', e.message);
        }
      }
      
      // Honeypot check: field "website" should be empty (hidden from humans, filled by bots)
      if (body.website) {
        return cors(400, { error: 'Registrasi ditolak.' }, origin);
      }
      
      // Server-side math CAPTCHA (if Turnstile not available)
      if (!turnstileToken) {
        const captchaAnswer = body.captcha_answer;
        const captchaToken = body.captcha_token || '';
        if (!captchaAnswer || !captchaToken) {
          // Generate and return a captcha challenge
          const a = Math.floor(Math.random() * 10) + 1;
          const b = Math.floor(Math.random() * 10) + 1;
          const op = Math.random() > 0.5 ? '+' : '-';
          const answer = op === '+' ? a + b : a - b;
          const challenge = `${a} ${op} ${b}`;
          // Encode answer in a simple signed token (HMAC-like)
          const captchaId = crypto.getRandomValues(new Uint8Array(16));
          const captchaIdHex = Array.from(captchaId).map(x => x.toString(16).padStart(2,'0')).join('');
          // Store challenge temporarily (in-memory, 5 min expiry)
          captchaStore.set(captchaIdHex, { answer, expires: Date.now() + 300000 });
          return cors(200, { 
            error: 'Selesaikan CAPTCHA terlebih dahulu.',
            captcha: { id: captchaIdHex, question: `${challenge} = ?` }
          }, origin);
        }
        // Verify math captcha answer
        const stored = captchaStore.get(captchaToken);
        if (!stored || stored.expires < Date.now()) {
          captchaStore.delete(captchaToken);
          return cors(400, { error: 'CAPTCHA expired. Muat ulang halaman.' }, origin);
        }
        if (parseInt(captchaAnswer) !== stored.answer) {
          captchaStore.delete(captchaToken);
          return cors(400, { error: 'Jawaban CAPTCHA salah. Coba lagi.' }, origin);
        }
        captchaStore.delete(captchaToken); // One-time use
      }

      // Block disposable/temporary email domains
      const emailDomain = email.split('@')[1];
      if (BLOCKED_EMAIL_DOMAINS.includes(emailDomain)) {
        return cors(400, { error: 'Gunakan email permanen untuk registrasi. Email temporary tidak diizinkan.' }, origin);
      }

      // Check existing (URL-encoded email)
      const encodedEmail = encodeURIComponent(email);
      const existing = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users', `?email=eq.${encodedEmail}&select=id`);
      if (existing && existing.length > 0) {
        return cors(400, { error: 'Email sudah terdaftar. Silakan login.' }, origin);
      }

      // Hash password (PBKDF2)
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
      const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
      const hashBits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
      const hashHex = Array.from(new Uint8Array(hashBits)).map(b => b.toString(16).padStart(2, '0')).join('');

      // Create user
      const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users', '', 'POST', {
        email, name, password_hash: `${saltHex}:${hashHex}`,
        is_active: true, created_at: new Date().toISOString()
      });

      if (users && users.length > 0) {
        const token = crypto.getRandomValues(new Uint8Array(32));
        const tokenHex = Array.from(token).map(b => b.toString(16).padStart(2, '0')).join('');
        const expires = new Date(Date.now() + 7 * 86400000).toISOString();
        await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions', '', 'POST', {
          user_id: users[0].id, token: tokenHex, expires_at: expires
        });
        // Record successful registration for IP tracking
        await recordAttempt(SUPABASE_URL, SUPABASE_KEY, ip, 'register_success');
        await recordAttempt(SUPABASE_URL, SUPABASE_KEY, ip, 'register');
        return cors(200, { success: true, message: 'Registrasi berhasil!', token: tokenHex, user: { id: users[0].id, email, name, auth_provider: 'local' } }, origin);
      }
      return cors(500, { error: 'Gagal membuat akun' }, origin);
    }

    // === LOGIN ===
    if (action === 'login') {
      // Type validation: prevent NoSQL injection
      if (typeof body.email !== 'string' || typeof body.password !== 'string') {
        return cors(400, { error: 'Input tidak valid' }, origin);
      }
      const email = (body.email || '').trim().toLowerCase();
      const password = body.password || '';
      if (!email || !password) return cors(400, { error: 'Email dan password harus diisi' }, origin);
      if (password.length > 128) return cors(400, { error: 'Password terlalu panjang' }, origin);

      // Rate limiting check (Supabase-backed, 5 attempts per 5 minutes)
      const rateCheck = await checkRateLimit(SUPABASE_URL, SUPABASE_KEY, ip, 'login');
      if (!rateCheck.allowed) {
        return cors(429, { error: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 5 menit.' }, origin);
      }

      const encodedEmail = encodeURIComponent(email);
      const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users', `?email=eq.${encodedEmail}&select=id,email,name,password_hash,is_active,created_at`);
      if (!users || users.length === 0) {
        await recordAttempt(SUPABASE_URL, SUPABASE_KEY, ip, 'login');
        return cors(401, { error: 'Email atau password salah' }, origin);
      }

      const user = users[0];
      if (!user.is_active) return cors(403, { error: 'Akun tidak aktif' }, origin);

      // Verify password (constant-time comparison)
      const stored = user.password_hash;
      let valid = false;
      if (stored && stored.includes(':')) {
        const [saltHex, pwHash] = stored.split(':');
        const salt = new Uint8Array(saltHex.match(/.{2}/g).map(b => parseInt(b, 16)));
        const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
        const hashBits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
        const checkHash = Array.from(new Uint8Array(hashBits)).map(b => b.toString(16).padStart(2, '0')).join('');
        valid = constantTimeCompare(checkHash, pwHash);
      }

      if (!valid) {
        await recordAttempt(SUPABASE_URL, SUPABASE_KEY, ip, 'login');
        return cors(401, { error: 'Email atau password salah' }, origin);
      }

      const token = crypto.getRandomValues(new Uint8Array(32));
      const tokenHex = Array.from(token).map(b => b.toString(16).padStart(2, '0')).join('');
      const expires = new Date(Date.now() + 7 * 86400000).toISOString();
      await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions', '', 'POST', {
        user_id: user.id, token: tokenHex, expires_at: expires
      });
      const encodedLoginEmail = encodeURIComponent(email);
      await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users', `?email=eq.${encodedLoginEmail}`, 'PATCH', {
        last_login: new Date().toISOString()
      });

      return cors(200, { success: true, message: 'Login berhasil!', token: tokenHex, user: { id: user.id, email, name: user.name, auth_provider: 'local', created_at: user.created_at } }, origin);
    }

    // === LOGOUT ===
    if (action === 'logout') {
      const token = body.token;
      if (token && typeof token === 'string' && token.length <= 128) {
        const encodedToken = encodeURIComponent(token);
        await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions', `?token=eq.${encodedToken}`, 'DELETE');
      }
      return cors(200, { success: true }, origin);
    }

    // === CHECK ACCESS ===
    if (action === 'check-access') {
      const { token } = body;
      if (!token || typeof token !== 'string') return cors(400, { error: 'Token required' }, origin);

      const encodedToken = encodeURIComponent(token);
      const sessions = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions', `?token=eq.${encodedToken}&select=id,user_id,expires_at`);
      if (!sessions || sessions.length === 0) return cors(200, { access: false, plan: 'free' }, origin);
      if (new Date(sessions[0].expires_at) < new Date()) return cors(200, { access: false, plan: 'free', reason: 'expired' }, origin);

      const encodedUserId = encodeURIComponent(sessions[0].user_id);
      const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users', `?id=eq.${encodedUserId}&select=email,is_active`);
      if (!users || users.length === 0 || !users[0].is_active) return cors(200, { access: false, plan: 'free' }, origin);

      return cors(200, { access: true, plan: users[0].plan }, origin);
    }

    // === CHANGE PASSWORD ===
    if (action === 'change-password') {
      const { token, oldPassword, newPassword } = body;
      if (!token || typeof token !== 'string' || token.length > 128) return cors(400, { error: 'Token tidak valid' }, origin);
      if (!oldPassword || !newPassword) return cors(400, { error: 'Password lama dan baru harus diisi' }, origin);
      if (newPassword.length < 8) return cors(400, { error: 'Password baru minimal 8 karakter' }, origin);
      if (newPassword.length > 128) return cors(400, { error: 'Password baru maksimal 128 karakter' }, origin);
      if (!/[A-Z]/.test(newPassword)) return cors(400, { error: 'Password harus mengandung huruf besar' }, origin);
      if (!/[0-9]/.test(newPassword)) return cors(400, { error: 'Password harus mengandung angka' }, origin);
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) return cors(400, { error: 'Password harus mengandung simbol' }, origin);

      // Rate limiting
      const pwRateCheck = await checkRateLimit(SUPABASE_URL, SUPABASE_KEY, ip, 'change-password');
      if (!pwRateCheck.allowed) return cors(429, { error: 'Terlalu banyak percobaan. Coba lagi dalam 5 menit.' }, origin);

      // Validate session
      const encodedToken = encodeURIComponent(token);
      const sessions = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions', `?token=eq.${encodedToken}&select=id,user_id,expires_at`);
      if (!sessions || sessions.length === 0) return cors(401, { error: 'Session tidak valid' }, origin);
      if (new Date(sessions[0].expires_at) < new Date()) return cors(401, { error: 'Session expired' }, origin);

      const userId = sessions[0].user_id;
      const encodedUserId = encodeURIComponent(userId);

      // Get user with password hash
      const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users', `?id=eq.${encodedUserId}&select=id,password_hash`);
      if (!users || users.length === 0) return cors(404, { error: 'User tidak ditemukan' }, origin);

      // Verify old password
      const stored = users[0].password_hash;
      if (stored === 'google_oauth') return cors(400, { error: 'Akun Google tidak bisa ganti password. Gunakan login Google.' }, origin);

      let valid = false;
      if (stored && stored.includes(':')) {
        const [saltHex, pwHash] = stored.split(':');
        const salt = new Uint8Array(saltHex.match(/.{2}/g).map(b => parseInt(b, 16)));
        const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(oldPassword), { name: 'PBKDF2' }, false, ['deriveBits']);
        const hashBits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
        const checkHash = Array.from(new Uint8Array(hashBits)).map(b => b.toString(16).padStart(2, '0')).join('');
        valid = constantTimeCompare(checkHash, pwHash);
      }
      if (!valid) {
        await recordAttempt(SUPABASE_URL, SUPABASE_KEY, ip, 'change-password');
        return cors(401, { error: 'Password lama salah' }, origin);
      }

      // Hash new password
      const newSalt = crypto.getRandomValues(new Uint8Array(16));
      const newSaltHex = Array.from(newSalt).map(b => b.toString(16).padStart(2, '0')).join('');
      const newKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(newPassword), { name: 'PBKDF2' }, false, ['deriveBits']);
      const newHashBits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: newSalt, iterations: 100000, hash: 'SHA-256' }, newKey, 256);
      const newHashHex = Array.from(new Uint8Array(newHashBits)).map(b => b.toString(16).padStart(2, '0')).join('');

      // Update password
      await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users', `?id=eq.${encodedUserId}`, 'PATCH', {
        password_hash: `${newSaltHex}:${newHashHex}`
      });

      // Invalidate all OTHER sessions (security: force re-login everywhere)
      await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions', `?user_id=eq.${encodedUserId}&token=neq.${encodedToken}`, 'DELETE');

      return cors(200, { success: true, message: 'Password berhasil diubah!' }, origin);
    }

    // === UPDATE PROFILE ===
    if (action === 'update-profile') {
      const { token, name, dob } = body;
      if (!token || typeof token !== 'string' || token.length > 128) return cors(400, { error: 'Token tidak valid' }, origin);

      // Validate session
      const encodedToken = encodeURIComponent(token);
      const sessions = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions', `?token=eq.${encodedToken}&select=id,user_id,expires_at`);
      if (!sessions || sessions.length === 0) return cors(401, { error: 'Session tidak valid' }, origin);
      if (new Date(sessions[0].expires_at) < new Date()) return cors(401, { error: 'Session expired' }, origin);

      const userId = sessions[0].user_id;
      const encodedUserId = encodeURIComponent(userId);

      // Build update object
      const updates = {};
      if (name !== undefined) {
        const sanitizedName = sanitizeName(name);
        if (sanitizedName.length < 2) return cors(400, { error: 'Nama minimal 2 karakter' }, origin);
        if (sanitizedName.length > 100) return cors(400, { error: 'Nama maksimal 100 karakter' }, origin);
        updates.name = sanitizedName;
      }
      if (dob !== undefined) {
        // Validate date format (YYYY-MM-DD)
        if (dob && !/^\d{4}-\d{2}-\d{2}$/.test(dob)) return cors(400, { error: 'Format tanggal lahir tidak valid' }, origin);
        updates.dob = dob || null;
      }

      if (Object.keys(updates).length === 0) return cors(400, { error: 'Tidak ada data yang diubah' }, origin);

      // Update user
      const result = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users', `?id=eq.${encodedUserId}`, 'PATCH', updates);

      // Return updated user data
      const updatedUsers = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users', `?id=eq.${encodedUserId}&select=id,email,name,dob,created_at`);
      const updatedUser = updatedUsers && updatedUsers[0] ? updatedUsers[0] : {};

      return cors(200, {
        success: true,
        message: 'Profil berhasil diupdate!',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          dob: updatedUser.dob,
          created_at: updatedUser.created_at
        }
      }, origin);
    }

    // === DELETE ACCOUNT ===
    if (action === 'delete-account') {
      const { token, password } = body;
      if (!token || typeof token !== 'string' || token.length > 128) return cors(400, { error: 'Token tidak valid' }, origin);
      if (!password) return cors(400, { error: 'Password diperlukan untuk hapus akun' }, origin);

      // Rate limiting
      const delRateCheck = await checkRateLimit(SUPABASE_URL, SUPABASE_KEY, ip, 'delete-account');
      if (!delRateCheck.allowed) return cors(429, { error: 'Terlalu banyak percobaan. Coba lagi dalam 5 menit.' }, origin);

      // Validate session
      const encodedToken = encodeURIComponent(token);
      const sessions = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions', `?token=eq.${encodedToken}&select=id,user_id,expires_at`);
      if (!sessions || sessions.length === 0) return cors(401, { error: 'Session tidak valid' }, origin);
      if (new Date(sessions[0].expires_at) < new Date()) return cors(401, { error: 'Session expired' }, origin);

      const userId = sessions[0].user_id;
      const encodedUserId = encodeURIComponent(userId);

      // Get user with password hash
      const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users', `?id=eq.${encodedUserId}&select=id,password_hash,email`);
      if (!users || users.length === 0) return cors(404, { error: 'User tidak ditemukan' }, origin);

      // Verify password (re-authentication)
      const stored = users[0].password_hash;
      if (stored === 'google_oauth') {
        // Google users: skip password check, but require confirmation
        if (body.confirm !== 'HAPUS AKUN SAYA') {
          return cors(400, { error: 'Ketik "HAPUS AKUN SAYA" untuk konfirmasi' }, origin);
        }
      } else {
        // Regular users: verify password
        let valid = false;
        if (stored && stored.includes(':')) {
          const [saltHex, pwHash] = stored.split(':');
          const salt = new Uint8Array(saltHex.match(/.{2}/g).map(b => parseInt(b, 16)));
          const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
          const hashBits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
          const checkHash = Array.from(new Uint8Array(hashBits)).map(b => b.toString(16).padStart(2, '0')).join('');
          valid = constantTimeCompare(checkHash, pwHash);
        }
        if (!valid) {
          await recordAttempt(SUPABASE_URL, SUPABASE_KEY, ip, 'delete-account');
          return cors(401, { error: 'Password salah' }, origin);
        }
      }

      // Delete user data (order matters for foreign keys)
      await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions', `?user_id=eq.${encodedUserId}`, 'DELETE');
      await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'article_unlocks', `?user_id=eq.${encodedUserId}`, 'DELETE');
      try {
        await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'quiz_results', `?user_id=eq.${encodedUserId}`, 'DELETE');
        await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'reading_history', `?user_id=eq.${encodedUserId}`, 'DELETE');
        await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'user_activity', `?user_id=eq.${encodedUserId}`, 'DELETE');
      } catch (e) {
        // Tables might not exist, continue
      }

      // Delete user record
      await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users', `?id=eq.${encodedUserId}`, 'DELETE');

      return cors(200, { success: true, message: 'Akun berhasil dihapus. Semua data telah dihapus permanen.' }, origin);
    }

    return cors(400, { error: 'Action tidak valid' }, origin);
  } catch (e) {
    // Error logged for debugging
    console.error('Auth error:', e.message || e);
    return cors(500, { error: 'Internal server error' }, origin);
  }
}

export async function onRequestOptions(context) {
  const origin = context.request.headers.get('origin') || '';
  return cors(200, '', origin);
}

// === SECURITY HELPERS ===

function sanitizeName(name) {
  if (typeof name !== 'string') return '';
  return name
    .replace(/<[^>]*>/g, '')           // strip HTML tags
    .replace(/[<>"'&]/g, '')           // strip dangerous chars
    .trim()
    .substring(0, 100);                 // max 100 chars
}

function constantTimeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) {
    // Still iterate to prevent timing leak
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ (i < b.length ? b.charCodeAt(i) : 0);
    }
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

function cors(status, data, origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': allowed,
      'Access-Control-Allow-Headers': 'Content-Type, X-CSRF-Token',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  });
}

async function supabaseQuery(url, key, table, params = '', method = 'GET', data = null) {
  params = params || '';  // defensive guard against null
  const fetchUrl = `${url}/rest/v1/${table}${params}`;
  const opts = {
    method,
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  };
  if (data) opts.body = JSON.stringify(data);
  const resp = await fetch(fetchUrl, opts);
  const result = await resp.json();
  if (!resp.ok) {
    // Error logged for debugging
    console.error('Supabase error:', resp.status, JSON.stringify(result).substring(0, 200));
  }
  return result;
}
