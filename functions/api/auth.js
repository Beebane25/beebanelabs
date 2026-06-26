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
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

// In-memory rate limit cache (best-effort, supplemented by Supabase)
const rateLimitCache = new Map();

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

  // Rate limiting check (Supabase-backed, persistent across cold starts)
  const rateCheck = await checkRateLimit(SUPABASE_URL, SUPABASE_KEY, ip, 'login');
  if (!rateCheck.allowed) {
    return cors(429, { error: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 5 menit.' }, origin);
  }

  try {
    const body = await request.json();
    const action = body.action;
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';

    // === REGISTER ===
    if (action === 'register') {
      const email = (body.email || '').trim().toLowerCase();
      const name = sanitizeName(body.name || '');
      const password = body.password || '';

      // Input validation
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return cors(400, { error: 'Email tidak valid' }, origin);
      if (!name || name.length < 2) return cors(400, { error: 'Nama harus diisi (minimal 2 karakter)' }, origin);
      if (name.length > 100) return cors(400, { error: 'Nama maksimal 100 karakter' }, origin);
      if (password.length < 8) return cors(400, { error: 'Password tidak memenuhi syarat (minimal 8 karakter, huruf besar, angka, dan simbol)' }, origin);
      if (password.length > 128) return cors(400, { error: 'Password maksimal 128 karakter' }, origin);
      if (!/[A-Z]/.test(password)) return cors(400, { error: 'Password tidak memenuhi syarat' }, origin);
      if (!/[0-9]/.test(password)) return cors(400, { error: 'Password tidak memenuhi syarat' }, origin);
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return cors(400, { error: 'Password tidak memenuhi syarat' }, origin);

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
        plan: 'free', is_active: true, tokens: 5, created_at: new Date().toISOString()
      });

      if (users && users.length > 0) {
        const token = crypto.getRandomValues(new Uint8Array(32));
        const tokenHex = Array.from(token).map(b => b.toString(16).padStart(2, '0')).join('');
        const expires = new Date(Date.now() + 7 * 86400000).toISOString();
        await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions', '', 'POST', {
          user_id: users[0].id, token: tokenHex, expires_at: expires
        });
        return cors(200, { success: true, message: 'Registrasi berhasil!', token: tokenHex, user: { email, name, plan: 'free', tokens: 5 } }, origin);
      }
      return cors(500, { error: 'Gagal membuat akun' }, origin);
    }

    // === LOGIN ===
    if (action === 'login') {
      const email = (body.email || '').trim().toLowerCase();
      const password = body.password || '';
      if (!email || !password) return cors(400, { error: 'Email dan password harus diisi' }, origin);
      if (password.length > 128) return cors(400, { error: 'Password terlalu panjang' }, origin);

      const encodedEmail = encodeURIComponent(email);
      const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users', `?email=eq.${encodedEmail}&select=id,email,name,password_hash,plan,tokens,is_active`);
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

      return cors(200, { success: true, message: 'Login berhasil!', token: tokenHex, user: { email, name: user.name, plan: user.plan, tokens: user.tokens } }, origin);
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
      const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users', `?id=eq.${encodedUserId}&select=email,plan,is_active`);
      if (!users || users.length === 0 || !users[0].is_active) return cors(200, { access: false, plan: 'free' }, origin);

      return cors(200, { access: true, plan: users[0].plan }, origin);
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
