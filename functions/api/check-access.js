// Cloudflare Pages Function: Check Access
// URL: /api/check-access

export async function onRequestPost(context) {
  const { request, env } = context;
  const SUPABASE_URL = env.SUPABASE_URL || '';
  const SUPABASE_KEY = env.SUPABASE_SERVICE_KEY || '';

  try {
    const body = await request.json();
    const { token } = body;

    if (!token) return cors(400, { error: 'Token required' });

    const sessions = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions', `?token=eq.${token}&select=id,user_id,expires_at`);
    if (!sessions || sessions.length === 0) return cors(200, { access: false, plan: 'tokens' });

    if (new Date(sessions[0].expires_at) < new Date()) return cors(200, { access: false, plan: 'tokens', reason: 'expired' });

    const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users', `?id=eq.${sessions[0].user_id}&selectemail,plan,is_active`);
    if (!users || users.length === 0 || !users[0].is_active) return cors(200, { access: false, plan: 'tokens' });

    return cors(200, { access: true, plan: users[0].plan });
  } catch (e) {
    // Error logged for debugging
    console.error('Check access error:', e);
    return cors(500, { error: 'Internal server error' });
  }
}

export async function onRequestOptions() { return cors(200, ''); }

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
