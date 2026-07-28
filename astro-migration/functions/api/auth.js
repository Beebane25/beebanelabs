/**
 * Cloudflare Pages Function — /api/auth
 * Handles login, register, logout via Supabase Auth
 *
 * Required Environment Variables (set in CF Pages Dashboard → Settings → Environment):
 *   SUPABASE_URL      = https://nbungbznljbiddlwyvbd.supabase.co
 *   SUPABASE_ANON_KEY = your-anon-key-here
 *   SUPABASE_SERVICE_KEY = your-service-role-key-here (for admin operations)
 */

const ALLOWED_ORIGINS = ['https://beebanelabs.pages.dev', 'https://beebanelabs.id', 'https://www.beebanelabs.id'];

function getCorsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-CSRF-Token',
    'Content-Type': 'application/json',
  };
}

function jsonResponse(data, status = 200, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: getCorsHeaders(origin),
  });
}

async function supabaseRequest(url, key, path, options = {}) {
  const res = await fetch(`${url}${path}`, {
    ...options,
    headers: {
      'apikey': key,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
      ...(options.headers || {}),
    },
  });
  return res.json();
}

export async function onRequestPost(context) {

  const { request, env } = context;
  const _origin = request.headers.get('origin') || '';

  const SUPABASE_URL = env.SUPABASE_URL || 'https://nbungbznljbiddlwyvbd.supabase.co';
  // Try ANON_KEY first, fall back to SERVICE_KEY (both work for auth)
  const SUPABASE_KEY = env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_KEY || '';

  if (!SUPABASE_KEY) {
    return jsonResponse({
      success: false,
      message: 'Server belum dikonfigurasi. Hubungi admin.',
    }, 500, _origin);
  }

  let body;
  try {
    body = await request.json();

    // Input type validation (prevent NoSQL injection)
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return jsonResponse({ success: false, message: 'Input tidak valid' }, 400, _origin);
    }
    if (body.email && typeof body.email !== 'string') {
      return jsonResponse({ success: false, message: 'Email harus berupa teks' }, 400, _origin);
    }
    if (body.password && typeof body.password !== 'string') {
      return jsonResponse({ success: false, message: 'Password harus berupa teks' }, 400, _origin);
    }
    if (body.name && typeof body.name !== 'string') {
      return jsonResponse({ success: false, message: 'Nama harus berupa teks' }, 400, _origin);
    }
  } catch {
    return jsonResponse({ success: false, message: 'Invalid request body' }, 400, _origin);
  }

  const { action, email, password, name } = body;

  try {
    switch (action) {
      case 'login': {
        if (!email || !password) {
          return jsonResponse({ success: false, message: 'Email dan password harus diisi' }, 400, _origin);
        }

        const loginRes = await supabaseRequest(SUPABASE_URL, SUPABASE_KEY, '/auth/v1/token?grant_type=password', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        if (loginRes.error) {
          return jsonResponse({
            success: false,
            message: loginRes.error_description || loginRes.msg || 'Email atau password salah',
          }, 401, _origin);
        }

        // Get user profile
        const userRes = await supabaseRequest(SUPABASE_URL, SUPABASE_KEY, '/auth/v1/user', {
          headers: { 'Authorization': `Bearer ${loginRes.access_token}` },
        });

        return jsonResponse({
          success: true,
          user: {
            id: userRes.id || loginRes.user?.id,
            email: email,
            name: userRes.user_metadata?.name || email.split('@')[0],
            tokens: 5, // Default tokens
          },
          token: loginRes.access_token,
        });
      }

      case 'register': {
        if (!email || !password || !name) {
          return jsonResponse({ success: false, message: 'Semua field harus diisi' }, 400, _origin);
        }

        if (password.length < 8) {
          return jsonResponse({ success: false, message: 'Password minimal 8 karakter' }, 400, _origin);
        }

        const regRes = await supabaseRequest(SUPABASE_URL, SUPABASE_KEY, '/auth/v1/signup', {
          method: 'POST',
          body: JSON.stringify({
            email,
            password,
            data: { name },
          }),
        });

        if (regRes.error) {
          return jsonResponse({
            success: false,
            message: regRes.error_description || regRes.msg || 'Gagal mendaftar',
          }, 400, _origin);
        }

        return jsonResponse({
          success: true,
          message: 'Registrasi berhasil! Silakan cek email untuk verifikasi.',
          user: {
            id: regRes.user?.id,
            email: email,
            name: name,
            tokens: 5,
          },
          token: regRes.access_token || null,
        });
      }

      case 'logout': {
        const token = body.token;
        if (token) {
          // Try to sign out from Supabase (fire-and-forget)
          try {
            await supabaseRequest(SUPABASE_URL, SUPABASE_KEY, '/auth/v1/logout', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` },
            });
          } catch {}
        }
        return jsonResponse({ success: true }, 200, origin, _origin);
      }

      case 'getSession': {
        const token = body.token;
        if (!token) {
          return jsonResponse({ success: false, message: 'No token provided' }, 401, _origin);
        }

        const sessionRes = await supabaseRequest(SUPABASE_URL, SUPABASE_KEY, '/auth/v1/user', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (sessionRes.error) {
          return jsonResponse({ success: false, message: 'Session expired' }, 401, _origin);
        }

        return jsonResponse({
          success: true,
          user: {
            id: sessionRes.id,
            email: sessionRes.email,
            name: sessionRes.user_metadata?.name || sessionRes.email?.split('@')[0],
            tokens: 5,
          },
        });
      }

      default:
        return jsonResponse({ success: false, message: 'Invalid action' }, 400, _origin);
    }
  } catch (err) {
    console.error('Auth error:', err);
    return jsonResponse({
      success: false,
      message: 'Server error. Coba lagi nanti.',
    }, 500, _origin);
  }
}

export async function onRequestOptions(context) {
  const _origin = context.request.headers.get('origin') || '';
  return new Response(null, { status: 204, headers: getCorsHeaders(_origin) });
}
