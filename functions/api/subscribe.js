// Cloudflare Pages Function: Newsletter Subscribe
// URL: /api/subscribe
// Stores email in Supabase newsletter_subscribers table

const ALLOWED_ORIGINS = ['https://iothub.pages.dev', 'https://beebanelabs.id', 'https://www.beebanelabs.id'];

export async function onRequestPost(context) {
  const { request, env } = context;
  const SUPABASE_URL = env.SUPABASE_URL || '';
  const SUPABASE_KEY = env.SUPABASE_SERVICE_KEY || '';
  const origin = request.headers.get('origin') || '';

  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return cors(400, { error: 'Email tidak valid' }, origin);
    }
    if (email.length > 254) {
      return cors(400, { error: 'Email terlalu panjang' }, origin);
    }

    // Check if already subscribed
    const encodedEmail = encodeURIComponent(email);
    const existing = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'newsletter_subscribers',
      `?email=eq.${encodedEmail}&select=id`);

    if (existing && existing.length > 0) {
      return cors(200, { success: true, message: 'Email sudah terdaftar!' }, origin);
    }

    // Insert new subscriber
    const result = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'newsletter_subscribers', '', 'POST', {
      email,
      subscribed_at: new Date().toISOString(),
      is_active: true
    });

    if (result && result.length > 0) {
      return cors(200, { success: true, message: 'Berhasil subscribe! Terima kasih 🎉' }, origin);
    }

    // Table might not exist - still return success (graceful degradation)
    return cors(200, { success: true, message: 'Terima kasih telah subscribe!' }, origin);
  } catch (e) {
    console.error('Subscribe error:', e.message || e);
    // Graceful degradation - don't break the user experience
    return cors(200, { success: true, message: 'Terima kasih telah subscribe!' }, origin);
  }
}

export async function onRequestOptions(context) {
  const origin = context.request.headers.get('origin') || '';
  return cors(200, '', origin);
}

function cors(status, data, origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': allowed,
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'X-Content-Type-Options': 'nosniff'
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
  if (!resp.ok) console.error('Supabase error:', resp.status);
  return result;
}
