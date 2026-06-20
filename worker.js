// IoTHub Backend Worker
// Deploy sebagai Cloudflare Worker terpisah untuk API endpoints

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response('', { status: 200, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Route API requests
      if (path === '/api/auth') return handleAuth(request, env);
      if (path === '/api/create-payment') return handleCreatePayment(request, env);
      if (path === '/api/payment-webhook') return handleWebhook(request, env);
      if (path === '/api/check-access') return handleCheckAccess(request, env);

      return new Response('Not Found', { status: 404 });
    } catch (e) {
      console.error('Worker error:', e);
      return cors(500, { error: 'Internal server error' });
    }
  }
};

// === AUTH HANDLER ===
async function handleAuth(request, env) {
  if (request.method !== 'POST') return cors(405, { error: 'Method not allowed' });

  const body = await request.json();
  const action = body.action;
  const SUPABASE_URL = env.SUPABASE_URL;
  const SUPABASE_KEY = env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return cors(500, { error: 'Backend belum dikonfigurasi. Set environment variables di Cloudflare.' });
  }

  // Register
  if (action === 'register') {
    const email = (body.email || '').trim().toLowerCase();
    const name = (body.name || '').trim();
    const password = body.password || '';

    if (!email || !email.includes('@')) return cors(400, { error: 'Email tidak valid' });
    if (!name) return cors(400, { error: 'Nama harus diisi' });
    if (password.length < 8) return cors(400, { error: 'Password minimal 8 karakter' });

    // Check existing
    const existing = await supaQuery(SUPABASE_URL, SUPABASE_KEY, 'users', `?email=eq.${email}&select=id`);
    if (existing?.length > 0) return cors(400, { error: 'Email sudah terdaftar' });

    // Hash password
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltHex = buf2hex(salt);
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
    const hash = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256);

    const users = await supaQuery(SUPABASE_URL, SUPABASE_KEY, 'users', null, 'POST', {
      email, name, password_hash: `${saltHex}:${buf2hex(hash)}`,
      plan: 'tokens', is_active: true, created_at: new Date().toISOString()
    });

    if (users?.length > 0) {
      const token = buf2hex(crypto.getRandomValues(new Uint8Array(32)));
      await supaQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions', null, 'POST', {
        user_id: users[0].id, token, expires_at: new Date(Date.now() + 7*86400000).toISOString()
      });
      return cors(200, { success: true, token, user: { email, name, plan: 'tokens' } });
    }
    return cors(500, { error: 'Gagal membuat akun' });
  }

  // Login
  if (action === 'login') {
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';
    if (!email || !password) return cors(400, { error: 'Email dan password harus diisi' });

    const users = await supaQuery(SUPABASE_URL, SUPABASE_KEY, 'users',
      `?email=eq.${email}&select=id,email,name,password_hash,plan,is_active`);
    if (!users?.length) return cors(401, { error: 'Email atau password salah' });
    if (!users[0].is_active) return cors(403, { error: 'Akun tidak aktif' });

    const stored = users[0].password_hash;
    let valid = false;
    if (stored.includes(':')) {
      const [saltHex, pwHash] = stored.split(':');
      const salt = new Uint8Array(saltHex.match(/.{2}/g).map(b => parseInt(b, 16)));
      const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
      const hash = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
      valid = buf2hex(hash) === pwHash;
    }

    if (!valid) return cors(401, { error: 'Email atau password salah' });

    const token = buf2hex(crypto.getRandomValues(new Uint8Array(32)));
    await supaQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions', null, 'POST', {
      user_id: users[0].id, token, expires_at: new Date(Date.now() + 7*86400000).toISOString()
    });

    return cors(200, { success: true, token, user: { email, name: users[0].name, plan: users[0].plan } });
  }

  // Logout
  if (action === 'logout') {
    if (body.token) await supaQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions', `?token=eq.${body.token}`, 'DELETE');
    return cors(200, { success: true });
  }

  // Check Access
  if (action === 'check-access') {
    const { token } = body;
    if (!token) return cors(400, { error: 'Token required' });
    const sessions = await supaQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions', `?token=eq.${token}&select=id,user_id,expires_at`);
    if (!sessions?.length) return cors(200, { access: false });
    if (new Date(sessions[0].expires_at) < new Date()) return cors(200, { access: false, reason: 'expired' });
    const users = await supaQuery(SUPABASE_URL, SUPABASE_KEY, 'users', `?id=eq.${sessions[0].user_id}&select=plan,is_active`);
    if (!users?.length || !users[0].is_active) return cors(200, { access: false });
    return cors(200, { access: true, plan: users[0].plan });
  }

  return cors(400, { error: 'Action tidak valid' });
}

// === PAYMENT HANDLER ===
async function handleCreatePayment(request, env) {
  if (request.method !== 'POST') return cors(405, { error: 'Method not allowed' });

  const body = await request.json();
  const { email, plan } = body;
  const PLAN_PRICES = { token5: 50000, token10: 90000 };
  const MIDTRANS_KEY = env.MIDTRANS_SERVER_KEY;

  if (!email || !email.includes('@')) return cors(400, { error: 'Email tidak valid' });
  if (!plan || !PLAN_PRICES[plan]) return cors(400, { error: 'Plan tidak valid' });
  if (!MIDTRANS_KEY) return cors(500, { error: 'Payment gateway belum dikonfigurasi' });

  const amount = PLAN_PRICES[plan];
  const orderId = `IOHUB-${Date.now()}-${buf2hex(crypto.getRandomValues(new Uint8Array(4)))}`;

  const auth = btoa(MIDTRANS_KEY + ':');
  const resp = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${auth}` },
    body: JSON.stringify({
      transaction_details: { order_id: orderId, gross_amount: amount },
      customer_details: { email },
      item_details: [{ id: plan, price: amount, quantity: 1, name: 'IoTHub Token' }],
      callbacks: { finish: new URL(request.url).origin }
    })
  });

  const result = await resp.json();
  if (result.token) return cors(200, { success: true, token: result.token, order_id: orderId });
  return cors(500, { error: 'Gagal membuat transaksi' });
}

// === WEBHOOK HANDLER ===
async function handleWebhook(request, env) {
  if (request.method !== 'POST') return new Response('OK');
  const body = await request.json();
  const { order_id, gross_amount, transaction_status, customer_details } = body;

  if (transaction_status === 'capture' || transaction_status === 'settlement') {
    const email = customer_details?.email;
    if (!email) return new Response('OK');

    const users = await supaQuery(env.SUPABASE_URL, env.SUPABASE_KEY, 'users', `?email=eq.${email}&select=id`);
    if (users?.length) {
      const plan = gross_amount >= 90000 ? 'token10' : 'token5';
      await supaQuery(env.SUPABASE_URL, env.SUPABASE_KEY, 'users', `?id=eq.${users[0].id}`, 'PATCH', {
        plan, plan_expires: '2099-12-31T23:59:59+00:00'
      });
      await supaQuery(env.SUPABASE_URL, env.SUPABASE_KEY, 'payments', null, 'POST', {
        user_id: users[0].id, order_id, amount: gross_amount, currency: 'IDR',
        plan, provider: 'midtrans', status: transaction_status, paid_at: new Date().toISOString()
      });
    }
  }
  return new Response('OK');
}

// === CHECK ACCESS HANDLER ===
async function handleCheckAccess(request, env) {
  if (request.method !== 'POST') return cors(405, { error: 'Method not allowed' });
  const body = await request.json();
  const { token } = body;
  if (!token) return cors(400, { error: 'Token required' });

  const sessions = await supaQuery(env.SUPABASE_URL, env.SUPABASE_KEY, 'sessions', `?token=eq.${token}&select=id,user_id,expires_at`);
  if (!sessions?.length) return cors(200, { access: false });
  if (new Date(sessions[0].expires_at) < new Date()) return cors(200, { access: false, reason: 'expired' });

  const users = await supaQuery(env.SUPABASE_URL, env.SUPABASE_KEY, 'users', `?id=eq.${sessions[0].user_id}&select=plan,is_active`);
  if (!users?.length || !users[0].is_active) return cors(200, { access: false });
  return cors(200, { access: true, plan: users[0].plan });
}

// === HELPERS ===
function cors(status, data) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } });
}

async function supaQuery(url, key, table, params = '', method = 'GET', data = null) {
  const opts = { method, headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' } };
  if (data) opts.body = JSON.stringify(data);
  const resp = await fetch(`${url}/rest/v1/${table}${params}`, opts);
  return await resp.json();
}

function buf2hex(buf) { return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''); }
