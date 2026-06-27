// Cloudflare Pages Function: User Activity
// URL: /api/user-activity

const ALLOWED_ORIGINS = ['https://beebanelabs.pages.dev', 'https://beebanelabs.id', 'https://www.beebanelabs.id'];

export async function onRequestPost(context) {
  const { request, env } = context;
  const SUPABASE_URL = env.SUPABASE_URL || '';
  const SUPABASE_KEY = env.SUPABASE_SERVICE_KEY || '';
  const origin = request.headers.get('origin') || '';

  try {
    const body = await request.json();
    const { token, action, activityType, description, metadata } = body;
    
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
      // Record activity
      if (!activityType) return cors(400, { error: 'Activity type required' }, origin);
      
      await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'user_activity', '', 'POST', {
        user_id: userId,
        activity_type: activityType,
        description: description || '',
        metadata: metadata || {}
      });
      
      return cors(200, { success: true }, origin);
    }
    
    if (action === 'get') {
      // Get all activity for user
      const encodedUserId = encodeURIComponent(userId);
      const limit = body.limit || 50;
      const activities = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'user_activity',
        `?user_id=eq.${encodedUserId}&select=activity_type,description,metadata,created_at&order=created_at.desc&limit=${limit}`);
      
      return cors(200, { activities: activities || [] }, origin);
    }

    return cors(400, { error: 'Invalid action' }, origin);

  } catch (e) {
    // Error logged for debugging
    console.error('User activity error:', e);
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
