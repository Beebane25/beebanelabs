// Cloudflare Pages Function: Google Auth Bridge
// URL: /api/google-auth
// Handles Supabase Google OAuth → existing AuthSystem mapping
// Creates user in custom users table if not exists, returns session token

const ALLOWED_ORIGINS = ['https://beebanelabs.pages.dev', 'https://beebanelabs.id', 'https://www.beebanelabs.id'];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'Content-Type, X-CSRF-Token',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
}

async function supabaseQuery(url, key, table, params = '', method = 'GET', body = null) {
  const endpoint = `${url}/rest/v1/${table}${params}`;
  const headers = {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal'
  };
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const resp = await fetch(endpoint, opts);
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Supabase ${method} ${table}: ${resp.status} ${err}`);
  }
  return resp.status === 204 ? [] : resp.json();
}

function generateSessionToken() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const origin = request.headers.get('Origin') || '';
  const headers = corsHeaders(origin);

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  try {
    const SUPABASE_URL = env.SUPABASE_URL || '';
    const SUPABASE_KEY = env.SUPABASE_SERVICE_KEY || '';

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
        status: 500, headers
      });
    }

    const body = await request.json();
    const { email, name, avatar, google_id, supabase_token } = body;

    // Validate required fields
    if (!email || !google_id) {
      return new Response(JSON.stringify({ error: 'Email dan Google ID wajib diisi' }), {
        status: 400, headers
      });
    }

    // Validate email format (strict regex - prevents XSS)
    if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email.toLowerCase())) {
      return new Response(JSON.stringify({ error: 'Format email tidak valid' }), {
        status: 400, headers
      });
    }

    const encodedEmail = btoa(email.toLowerCase().split('').reverse().join(''));

    // Check if user exists
    let users;
    try {
      users = await supabaseQuery(
        SUPABASE_URL, SUPABASE_KEY, 'users',
        `?email=eq.${encodeURIComponent(encodedEmail)}&select=id,email,name,role,tokens`
      );
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Database error' }), {
        status: 500, headers
      });
    }

    let user;
    let isNewUser = false;

    if (users && users.length > 0) {
      // User exists - update Google ID if not set
      user = users[0];
      
      // Update name and avatar if changed
      try {
        await supabaseQuery(
          SUPABASE_URL, SUPABASE_KEY, 'users',
          `?id=eq.${user.id}`, 'PATCH',
          {
            name: name || user.name,
            updated_at: new Date().toISOString()
          }
        );
      } catch (e) {
        // Non-critical, continue
      }
    } else {
      // New user - create account
      isNewUser = true;
      const INITIAL_TOKENS = 5;

      try {
        const newUsers = await supabaseQuery(
          SUPABASE_URL, SUPABASE_KEY, 'users', '', 'POST',
          {
            email: encodedEmail,
            name: name || email.split('@')[0],
            password_hash: 'google_oauth',  // No password for Google users
            role: 'user',
            tokens: INITIAL_TOKENS,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        );
        user = newUsers[0];
      } catch (e) {
        return new Response(JSON.stringify({ error: 'Gagal membuat akun' }), {
          status: 500, headers
        });
      }
    }

    // Generate session token
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    // Create session
    try {
      await supabaseQuery(
        SUPABASE_URL, SUPABASE_KEY, 'sessions', '', 'POST',
        {
          user_id: user.id,
          token: sessionToken,
          expires_at: expiresAt,
          created_at: new Date().toISOString()
        }
      );
    } catch (e) {
      // Session creation failed, but user exists - still return success
    }

    // Return session data compatible with AuthSystem
    return new Response(JSON.stringify({
      success: true,
      isNewUser: isNewUser,
      session: {
        user: {
          id: user.id,
          email: email.toLowerCase(),
          name: name || user.name || email.split('@')[0],
          avatar: avatar || '',
          role: user.role || 'user',
          tokens: user.tokens || 5,
          auth_provider: 'google'
        },
        token: sessionToken,
        _createdAt: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: {
        ...headers,
        'Cache-Control': 'no-store'
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers
    });
  }
}

export async function onRequestOptions(context) {
  const origin = context.request.headers.get('Origin') || '';
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin)
  });
}
