/**
 * Cloudflare Pages Function — /api/google-auth
 * Handles Google OAuth callback — creates/links user in Supabase
 *
 * Required Environment Variables:
 *   SUPABASE_URL or hardcoded below
 *   SUPABASE_SERVICE_KEY (for admin operations)
 */

const SUPABASE_URL = 'https://nbungbznljbiddlwyvbd.supabase.co';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://beebanelabs.pages.dev',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: CORS_HEADERS,
  });
}

async function supabaseQuery(url, key, table, params = '') {
  const res = await fetch(`${url}/rest/v1/${table}${params}`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
  });
  return res.json();
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const SUPABASE_KEY = env.SUPABASE_SERVICE_KEY || '';

  if (!SUPABASE_KEY) {
    return jsonResponse({ success: false, error: 'Server belum dikonfigurasi' }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ success: false, error: 'Invalid request' }, 400);
  }

  const { email, name, avatar, google_id, supabase_token } = body;

  if (!email) {
    return jsonResponse({ success: false, error: 'Email required' }, 400);
  }

  try {
    // 1. Check if user already exists
    const existing = await supabaseQuery(
      SUPABASE_URL, SUPABASE_KEY, 'users',
      `?email=eq.${encodeURIComponent(email)}&select=*`
    );

    let user;

    if (Array.isArray(existing) && existing.length > 0) {
      // User exists — update last_login and return
      user = existing[0];

      // Update last login
      await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${user.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ last_login: new Date().toISOString() }),
      });
    } else {
      // 2. Create new user
      const newUser = {
        email: email,
        name: name || email.split('@')[0],
        password_hash: 'google_oauth_' + google_id, // No password for OAuth users
        plan: 'free',
        is_active: true,
        tokens: 5, // Initial free tokens
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      };

      const created = await supabaseQuery(
        SUPABASE_URL, SUPABASE_KEY, 'users',
        ''
      );

      const createRes = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(newUser),
      });

      const createdUsers = await createRes.json();
      if (Array.isArray(createdUsers) && createdUsers.length > 0) {
        user = createdUsers[0];
      } else {
        return jsonResponse({ success: false, error: 'Gagal membuat akun' }, 500);
      }
    }

    // 3. Create a session token
    const sessionToken = crypto.randomUUID ? crypto.randomUUID() :
      Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0')).join('');

    // Store session
    await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions', '');
    await fetch(`${SUPABASE_URL}/rest/v1/sessions`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: user.id,
        token: sessionToken,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }),
    });

    // 4. Return session to client
    return jsonResponse({
      success: true,
      session: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name || name,
          tokens: user.tokens || 5,
          plan: user.plan || 'free',
        },
        token: sessionToken,
      },
    });

  } catch (err) {
    console.error('Google auth error:', err);
    return jsonResponse({
      success: false,
      error: 'Database error: ' + (err.message || 'Unknown'),
    }, 500);
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
