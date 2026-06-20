// Netlify Function: Auth (Register & Login)
// Endpoint: /.netlify/functions/auth

const crypto = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

const HEADERS = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Prefer': 'return=representation'
};

async function supabaseQuery(table, method = 'GET', data = null, params = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}${params}`;
  const opts = { method, headers: HEADERS };
  if (data) { opts.body = JSON.stringify(data); }
  const resp = await fetch(url, opts);
  return await resp.json();
}

function cors(status, data) {
  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://iothub25.netlify.app',
      'Access-Control-Allow-Headers': 'Content-Type, X-CSRF-Token',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    },
    body: JSON.stringify(data)
  };
}

// Rate limiter (in-memory)
const rateLimits = {};
function checkRateLimit(ip) {
  const now = Date.now();
  const key = ip;
  if (!rateLimits[key]) rateLimits[key] = [];
  rateLimits[key] = rateLimits[key].filter(t => now - t < 300000); // 5 min window
  if (rateLimits[key].length >= 5) return false;
  rateLimits[key].push(now);
  return true;
}

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return cors(200, '');
  }
  if (event.httpMethod !== 'POST') {
    return cors(405, { error: 'Method not allowed' });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const action = body.action;
    const ip = event.headers['x-forwarded-for'] || 'unknown';

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

      const existing = await supabaseQuery('users', 'GET', null, `?email=eq.${email}&select=id`);
      if (existing && existing.length > 0) {
        return cors(400, { error: 'Email sudah terdaftar. Silakan login.' });
      }

      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256').toString('hex');
      const storedHash = `${salt}:${hash}`;

      const users = await supabaseQuery('users', 'POST', {
        email, name, password_hash: storedHash,
        plan: 'free', is_active: true,
        created_at: new Date().toISOString()
      });

      if (users && users.length > 0) {
        const user = users[0];
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 7 * 86400000).toISOString();
        await supabaseQuery('sessions', 'POST', {
          user_id: user.id, token, expires_at: expires
        });
        return cors(200, { success: true, message: 'Registrasi berhasil!', token, user: { email, name, plan: 'free' } });
      }
      return cors(500, { error: 'Gagal membuat akun' });
    }

    // === LOGIN ===
    if (action === 'login') {
      const email = (body.email || '').trim().toLowerCase();
      const password = body.password || '';
      if (!email || !password) return cors(400, { error: 'Email dan password harus diisi' });

      if (!checkRateLimit(ip)) {
        return cors(429, { error: 'Terlalu banyak percobaan. Coba lagi dalam 5 menit.' });
      }

      const users = await supabaseQuery('users', 'GET', null, `?email=eq.${email}&select=id,email,name,password_hash,plan,is_active`);
      if (!users || users.length === 0) {
        crypto.pbkdf2Sync('dummy', 'dummy', 100000, 64, 'sha256');
        return cors(401, { error: 'Email atau password salah' });
      }

      const user = users[0];
      if (!user.is_active) return cors(403, { error: 'Akun tidak aktif' });

      const stored = user.password_hash;
      let valid = false;

      if (stored.includes(':')) {
        const [salt, pwHash] = stored.split(':');
        const check = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256').toString('hex');
        if (crypto.timingSafeEqual(Buffer.from(check), Buffer.from(pwHash))) {
          valid = true;
        } else {
          crypto.pbkdf2Sync('dummy', 'dummy', 100000, 64, 'sha256');
        }
      } else {
        const check = crypto.createHash('sha256').update(password).digest('hex');
        if (check === stored) {
          valid = true;
          const newSalt = crypto.randomBytes(16).toString('hex');
          const newHash = crypto.pbkdf2Sync(password, newSalt, 100000, 64, 'sha256').toString('hex');
          await supabaseQuery('users', 'PATCH', { password_hash: `${newSalt}:${newHash}` }, `?email=eq.${email}`);
        }
      }

      if (!valid) return cors(401, { error: 'Email atau password salah' });

      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 7 * 86400000).toISOString();
      await supabaseQuery('sessions', 'POST', { user_id: user.id, token, expires_at: expires });
      await supabaseQuery('users', 'PATCH', { last_login: new Date().toISOString() }, `?email=eq.${email}`);

      return cors(200, { success: true, message: 'Login berhasil!', token, user: { email, name: user.name, plan: user.plan } });
    }

    // === LOGOUT ===
    if (action === 'logout') {
      const token = body.token;
      if (token) {
        await supabaseQuery('sessions', 'DELETE', null, `?token=eq.${token}`);
      }
      return cors(200, { success: true });
    }

    // === CHECK ACCESS ===
    if (action === 'check-access') {
      const { email, token } = body;
      if (!token) return cors(400, { error: 'Token required' });

      const sessions = await supabaseQuery('sessions', 'GET', null, `?token=eq.${token}&select=id,user_id,expires_at`);
      if (!sessions || sessions.length === 0) return cors(200, { access: false, plan: 'free' });

      const session = sessions[0];
      if (new Date(session.expires_at) < new Date()) {
        await supabaseQuery('sessions', 'DELETE', null, `?token=eq.${token}`);
        return cors(200, { access: false, plan: 'free', reason: 'expired' });
      }

      const userId = session.user_id;
      const users = await supabaseQuery('users', 'GET', null, `?id=eq.${userId}&select=email,plan,is_active,plan_expires`);
      if (!users || users.length === 0 || !users[0].is_active) {
        return cors(200, { access: false, plan: 'free' });
      }

      const user = users[0];
      if (email && user.email !== email.toLowerCase()) {
        return cors(403, { error: 'Unauthorized' });
      }

      return cors(200, { access: true, plan: user.plan, expires: user.plan_expires });
    }

    return cors(400, { error: 'Action tidak valid' });
  } catch (e) {
    console.error('Auth error:', e);
    return cors(500, { error: 'Internal server error' });
  }
};
