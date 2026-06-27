// Cloudflare Pages Function: Get Unlocked Articles
// URL: /api/unlocked-articles
// Returns all articles a user has unlocked

const ALLOWED_ORIGINS = ['https://beebanelabs.pages.dev', 'https://beebanelabs.id', 'https://www.beebanelabs.id'];

export async function onRequestPost(context) {
  const { request, env } = context;
  const SUPABASE_URL = env.SUPABASE_URL || '';
  const SUPABASE_KEY = env.SUPABASE_SERVICE_KEY || '';
  const origin = request.headers.get('origin') || '';

  try {
    const body = await request.json();
    const { token } = body;
    
    if (!token || typeof token !== 'string' || token.length > 128) {
      return cors(400, { error: 'Invalid token' }, origin);
    }

    // Get session
    const encodedToken = encodeURIComponent(token);
    const sessions = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions',
      `?token=eq.${encodedToken}&select=id,user_id,expires_at`);
    
    if (!sessions || sessions.length === 0) {
      return cors(200, { articles: [], tokens: 0, plan: 'free' }, origin);
    }
    
    if (new Date(sessions[0].expires_at) < new Date()) {
      return cors(200, { articles: [], tokens: 0, plan: 'free' }, origin);
    }

    const userId = sessions[0].user_id;
    const encodedUserId = encodeURIComponent(userId);

    // Get user info (tokens, plan)
    const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users',
      `?id=eq.${encodedUserId}&select=tokens,plan`);
    
    const userTokens = users?.[0]?.tokens || 0;
    const userPlan = users?.[0]?.plan || 'free';

    // Get all unlocked articles for this user
    const unlocks = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'article_unlocks',
      `?user_id=eq.${encodedUserId}&select=article_slug,unlocked_at`);
    
    const articles = (unlocks || []).map(u => ({
      slug: u.article_slug,
      unlockedAt: u.unlocked_at
    }));

    return cors(200, { 
      articles, 
      tokens: userTokens, 
      plan: userPlan,
      count: articles.length 
    }, origin);

  } catch (e) {
    // Error logged for debugging
    console.error('Unlocked articles error:', e);
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
  const fetchUrl = `${url}/rest/v1/${table}${params}`;
  const opts = { method, headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' } };
  if (data) opts.body = JSON.stringify(data);
  const resp = await fetch(fetchUrl, opts);
  return await resp.json();
}
