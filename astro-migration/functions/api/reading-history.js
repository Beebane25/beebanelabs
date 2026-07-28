// Cloudflare Pages Function: Reading History
// URL: /api/reading-history

const ALLOWED_ORIGINS = ['https://beebanelabs.pages.dev', 'https://beebanelabs.id', 'https://www.beebanelabs.id'];

export async function onRequestPost(context) {
  const { request, env } = context;
  const SUPABASE_URL = env.SUPABASE_URL || '';
  const SUPABASE_KEY = env.SUPABASE_SERVICE_KEY || '';
  const origin = request.headers.get('origin') || '';

  try {
    const body = await request.json();
    const { token, articleSlug, action } = body;
    
    if (!token || typeof token !== 'string') {
      return cors(400, { error: 'Invalid token' }, origin);
    }

    // Get session
    const encodedToken = encodeURIComponent(token);
    const sessions = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions',
      `?token=eq.${encodedToken}&select=id,user_id,expires_at`);
    
    if (!sessions || sessions.length === 0 || new Date(sessions[0].expires_at) < new Date()) {
      return cors(200, { success: false, reason: 'no_session' }, origin);
    }

    const userId = sessions[0].user_id;

    if (action === 'record') {
      // Record reading activity
      if (!articleSlug) return cors(400, { error: 'Article slug required' }, origin);
      
      const encodedUserId = encodeURIComponent(userId);
      const encodedSlug = encodeURIComponent(articleSlug);
      
      // Upsert reading history
      const existing = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'reading_history',
        `?user_id=eq.${encodedUserId}&article_slug=eq.${encodedSlug}&select=id`);
      
      if (existing && existing.length > 0) {
        // Update existing record
        await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'reading_history',
          `?id=eq.${existing[0].id}`, 'PATCH', { read_at: new Date().toISOString() });
      } else {
        // Insert new record
        await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'reading_history', '', 'POST', {
          user_id: userId, article_slug: articleSlug
        });
      }
      
      return cors(200, { success: true }, origin);
    }
    
    if (action === 'get') {
      // Get all reading history for user
      const encodedUserId = encodeURIComponent(userId);
      const history = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'reading_history',
        `?user_id=eq.${encodedUserId}&select=article_slug,read_at,read_duration_seconds&order=read_at.desc`);
      
      return cors(200, { history: history || [] }, origin);
    }

    return cors(400, { error: 'Invalid action' }, origin);

  } catch (e) {
    // Error logged for debugging
    console.error('Reading history error:', e);
    return cors(500, { error: 'Internal server error' }, origin);
  }
}

export async function onRequestOptions() { return cors(200, ''); }

function cors(status, data, origin = '') {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': allowed,
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    }
  });
}

async function supabaseQuery(url, key, table, params = '', method = 'GET', data = null) {
  params = params || '';  // defensive guard against null
  const fetchUrl = `${url}/rest/v1/${table}${params}`;
  const opts = { method, headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' } };
  if (data) opts.body = JSON.stringify(data);
  const resp = await fetch(fetchUrl, opts);
  return await resp.json();
}
