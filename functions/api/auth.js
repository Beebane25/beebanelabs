// Cloudflare Pages Function: Auth (Register & Login)
// URL: /api/auth

export async function onRequestPost(context) {
  const { request, env } = context;
  const SUPABASE_URL = env.SUPABASE_URL || '';
  const SUPABASE_KEY = env.SUPABASE_SERVICE_KEY || '';

  try {
    const body = await request.json();
    const action = body.action;
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';

    // Rate limiting (simple in-memory)
    const rateKey = `rate:${ip}`;
    const now = Date.now();
    if (!context.data.rateLimits) context.data.rateLimits = {};
    const rl = context.data.rateLimits;
    if (!rl[rateKey]) rl[rateKey] = [];
    rl[rateKey] = rl[rateKey].filter(t => now - t < 300000);
    if (rl[rateKey].length >= 5) {
      return cors(429, { error: 'Terlalu banyak percobaan. Coba lagi dalam 5 menit.' });
    }
    rl[rateKey].push(now);

    // === REGISTER ===
    if (action === 'register') {
      const email = (body.email || '').trim().toLowerCase();
      const name = (body.name || '').trim();
      const password = body.password || '';

      if (!email || !email.includes('@')) return cors(400, { error: 'Email tidak valid' });
      if (!name) return cors(400, { error: 'Nama harus diisi' });
      if (password.length < 8) return cors(400, { error: 'Password minimal 8 karakter' });
      if (!/[A-Z]/.test(password)) return cors(400, { error: 'Password harus mengandung huruf besar' });
      if (!/[0-9]/.test(password)) return cors(400, { error: 'Password harus mengandung angka' });

      // Check existing
      const existing = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users', `?email=eq.${email}&select=id`);
      if (existing && existing.length > 0) {
        return cors(400, { error: 'Email sudah terdaftar. Silakan login.' });
      }

      // Hash password
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
      const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
      const hashBits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
      const hashHex = Array.from(new Uint8Array(hashBits)).map(b => b.toString(16).padStart(2, '0')).join('');

      // Create user
      const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users', null, 'POST', {
        email, name, password_hash: `${saltHex}:${hashHex}`,
        plan: 'tokens', is_active: true, created_at: new Date().toISOString()
      });

      if (users && users.length > 0) {
        const token = crypto.getRandomValues(new Uint8Array(32));
        const tokenHex = Array.from(token).map(b => b.toString(16).padStart(2, '0')).join('');
        const expires = new Date(Date.now() + 7 * 86400000).toISOString();
        await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions', null, 'POST', {
          user_id: users[0].id, token: tokenHex, expires_at: expires
        });
        return cors(200, { success: true, message: 'Registrasi berhasil!', token: tokenHex, user: { email, name, plan: 'tokens' } });
      }
      return cors(500, { error: 'Gagal membuat akun' });
    }

    // === LOGIN ===
    if (action === 'login') {
      const email = (body.email || '').trim().toLowerCase();
      const password = body.password || '';
      if (!email || !password) return cors(400, { error: 'Email dan password harus diisi' });

      const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users', `?email=eq.${email}&select=id,email,name,password_hash,plan,is_active`);
      if (!users || users.length === 0) {
        return cors(401, { error: 'Email atau password salah' });
      }

      const user = users[0];
      if (!user.is_active) return cors(403, { error: 'Akun tidak aktif' });

      // Verify password
      const stored = user.password_hash;
      let valid = false;

      if (stored.includes(':')) {
        const [saltHex, pwHash] = stored.split(':');
        const salt = new Uint8Array(saltHex.match(/.{2}/g).map(b => parseInt(b, 16)));
        const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
        const hashBits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
        const checkHash = Array.from(new Uint8Array(hashBits)).map(b => b.toString(16).padStart(2, '0')).join('');
        valid = checkHash === pwHash;
      }

      if (!valid) return cors(401, { error: 'Email atau password salah' });

      const token = crypto.getRandomValues(new Uint8Array(32));
      const tokenHex = Array.from(token).map(b => b.toString(16).padStart(2, '0')).join('');
      const expires = new Date(Date.now() + 7 * 86400000).toISOString();
      await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions', null, 'POST', {
        user_id: user.id, token: tokenHex, expires_at: expires
      });
      await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users', `?email=eq.${email}`, 'PATCH', {
        last_login: new Date().toISOString()
      });

      return cors(200, { success: true, message: 'Login berhasil!', token: tokenHex, user: { email, name: user.name, plan: user.plan } });
    }

    // === LOGOUT ===
    if (action === 'logout') {
      const token = body.token;
      if (token) await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions', `?token=eq.${token}`, 'DELETE');
      return cors(200, { success: true });
    }

    // === CHECK ACCESS ===
    if (action === 'check-access') {
      const { token } = body;
      if (!token) return cors(400, { error: 'Token required' });

      const sessions = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions', `?token=eq.${token}&select=id,user_id,expires_at`);
      if (!sessions || sessions.length === 0) return cors(200, { access: false, plan: 'free' });

      if (new Date(sessions[0].expires_at) < new Date()) return cors(200, { access: false, plan: 'free', reason: 'expired' });

      const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users', `?id=eq.${sessions[0].user_id}&select=email,plan,is_active`);
      if (!users || users.length === 0 || !users[0].is_active) return cors(200, { access: false, plan: 'free' });

      return cors(200, { access: true, plan: users[0].plan });
    }

    return cors(400, { error: 'Action tidak valid' });
  } catch (e) {
    console.error('Auth error:', e);
    return cors(500, { error: 'Internal server error' });
  }
}

// Handle OPTIONS for CORS
export async function onRequestOptions() {
  return cors(200, '');
}

function cors(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }
  });
}

async function supabaseQuery(url, key, table, params = '', method = 'GET', data = null) {
  const fetchUrl = `${url}/rest/v1/${table}${params}`;
  const opts = { method, headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' } };
  if (data) opts.body = JSON.stringify(data);
  const resp = await fetch(fetchUrl, opts);
  return await resp.json();
}
