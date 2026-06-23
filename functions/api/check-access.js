// Cloudflare Pages Function: Check Access
// URL: /api/check-access
// FIXED: CORS whitelist, SQL typo, token encoding, input validation

const ALLOWED_ORIGINS = ['https://iothub.pages.dev', 'https://beebanelabs.id', 'https://www.beebanelabs.id'];

export async function onRequestPost(context) {
  const { request, env } = context;
  const SUPABASE_URL = env.SUPABASE_URL || '';
  const SUPABASE_KEY = env.SUPABASE_SERVICE_KEY || '';
  const origin = request.headers.get('origin') || '';

  try {
    const body = await request.json();
    const { token } = body;

    // FIX: Input validation with max length and type check
    if (!token || typeof token !== 'string' || token.length > 128) {
      return cors(400, { error: 'Token required' }, origin);
    }

    // FIX: URL-encode token before using in query
    const encodedToken = encodeURIComponent(token);
    const sessions = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions',
      `?token=eq.${encodedToken}&select=id,user_id,expires_at`);

    if (!sessions || sessions.length === 0) return cors(200, { access: false, plan: 'free' }, origin);

    if (new Date(sessions[0].expires_at) < new Date()) {
      return cors(200, { access: false, plan: 'free', reason: 'expired' }, origin);
    }

    // FIX: SQL typo - was "&selectemail" (missing =), now "&select=email"
    const encodedUserId = encodeURIComponent(sessions[0].user_id);
    const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users',
      `?id=eq.${encodedUserId}&select=email,plan,is_active`);
    if (!users || users.length === 0 || !users[0].is_active) {
      return cors(200, { access: false, plan: 'free' }, origin);
    }

    return cors(200, { access: true, plan: users[0].plan }, origin);
  } catch (e) {
    console.error('Check access error:', e);
    return cors(500, { error: 'Internal server error' }, origin);
  }
}

export async function onRequestOptions(context) {
  const origin = context.request.headers.get('origin') || '';
  return cors(200, '', origin);
}

// FIX: Use whitelist instead of wildcard
function cors(status, data, origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': allowed,
      'Access-Control-Allow-Headers': 'Content-Type',
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
  if (!resp.ok) console.error('Supabase error:', resp.status, JSON.stringify(result).substring(0, 200));
  return result;
}
