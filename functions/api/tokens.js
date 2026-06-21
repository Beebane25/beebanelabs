// Cloudflare Pages Function: Token Operations
// URL: /api/tokens

export async function onRequestPost(context) {
  const { request, env } = context;
  const SUPABASE_URL = env.SUPABASE_URL || '';
  const SUPABASE_KEY = env.SUPABASE_SERVICE_KEY || '';

  try {
    const body = await request.json();
    const action = body.action;

    // === CHECK ACCESS ===
    if (action === 'check-access') {
      const { token, articleSlug } = body;
      if (!token || !articleSlug) return cors(400, { error: 'Token and article required' });

      // Validate session
      const sessions = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions',
        `?token=eq.${token}&select=id,user_id,expires_at`);
      if (!sessions || sessions.length === 0) return cors(200, { access: false, reason: 'no_session' });

      if (new Date(sessions[0].expires_at) < new Date()) {
        return cors(200, { access: false, reason: 'expired' });
      }

      // Check if user has unlocked this article
      const unlocks = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'article_unlocks',
        `?user_id=eq.${sessions[0].user_id}&article_slug=eq.${articleSlug}&select=id`);
      if (unlocks && unlocks.length > 0) {
        // Get user token balance
        const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users',
          `?id=eq.${sessions[0].user_id}&select=tokens,plan`);
        return cors(200, {
          access: true,
          reason: 'unlocked',
          tokens: users?.[0]?.tokens || 0,
          plan: users?.[0]?.plan || 'free'
        });
      }

      // Not unlocked - get token balance
      const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users',
        `?id=eq.${sessions[0].user_id}&select=tokens,plan`);
      return cors(200, {
        access: false,
        reason: 'locked',
        tokens: users?.[0]?.tokens || 0,
        plan: users?.[0]?.plan || 'free'
      });
    }

    // === USE TOKEN TO UNLOCK ===
    if (action === 'use-token') {
      const { token, articleSlug } = body;
      if (!token || !articleSlug) return cors(400, { error: 'Token and article required' });

      // Validate session
      const sessions = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions',
        `?token=eq.${token}&select=id,user_id,expires_at`);
      if (!sessions || sessions.length === 0) return cors(401, { error: 'Session tidak valid' });

      if (new Date(sessions[0].expires_at) < new Date()) {
        return cors(401, { error: 'Session expired' });
      }

      const userId = sessions[0].user_id;

      // Check if already unlocked
      const existing = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'article_unlocks',
        `?user_id=eq.${userId}&article_slug=eq.${articleSlug}&select=id`);
      if (existing && existing.length > 0) {
        const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users',
          `?id=eq.${userId}&select=tokens`);
        return cors(200, { success: true, message: 'Artikel sudah diunlock', tokens: users?.[0]?.tokens || 0 });
      }

      // Get current token balance
      const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users',
        `?id=eq.${userId}&select=tokens,plan`);
      if (!users || users.length === 0) return cors(404, { error: 'User tidak ditemukan' });

      const user = users[0];
      if (user.plan !== 'free' && user.plan !== 'tokens') {
        // Premium user - unlimited access
        await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'article_unlocks', '', 'POST', {
          user_id: userId, article_slug: articleSlug
        });
        return cors(200, { success: true, message: 'Premium access', tokens: user.tokens, premium: true });
      }

      if (user.tokens <= 0) {
        return cors(403, { error: 'Token habis. Beli token tambahan.', tokens: 0 });
      }

      // Deduct token
      const newTokens = user.tokens - 1;
      await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users',
        `?id=eq.${userId}`, 'PATCH', { tokens: newTokens });

      // Record unlock
      await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'article_unlocks', '', 'POST', {
        user_id: userId, article_slug: articleSlug
      });

      return cors(200, {
        success: true,
        message: 'Artikel dibuka! Token tersisa: ' + newTokens,
        tokens: newTokens
      });
    }

    // === GET TOKEN BALANCE ===
    if (action === 'balance') {
      const { token } = body;
      if (!token) return cors(400, { error: 'Session token required' });

      const sessions = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'sessions',
        `?token=eq.${token}&select=user_id,expires_at`);
      if (!sessions || sessions.length === 0) return cors(200, { tokens: 0, plan: 'free' });

      if (new Date(sessions[0].expires_at) < new Date()) {
        return cors(200, { tokens: 0, plan: 'free', reason: 'expired' });
      }

      const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users',
        `?id=eq.${sessions[0].user_id}&select=tokens,plan`);
      if (!users || users.length === 0) return cors(200, { tokens: 0, plan: 'free' });

      return cors(200, { tokens: users[0].tokens, plan: users[0].plan });
    }

    // === ADD TOKENS (for payment callback) ===
    if (action === 'add-tokens') {
      const { userId, count, orderId } = body;
      if (!userId || !count) return cors(400, { error: 'userId and count required' });

      // Get current tokens
      const users = await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users',
        `?id=eq.${userId}&select=tokens`);
      if (!users || users.length === 0) return cors(404, { error: 'User not found' });

      const newTokens = (users[0].tokens || 0) + count;
      await supabaseQuery(SUPABASE_URL, SUPABASE_KEY, 'users',
        `?id=eq.${userId}`, 'PATCH', { tokens: newTokens, plan: 'tokens' });

      return cors(200, { success: true, tokens: newTokens });
    }

    return cors(400, { error: 'Action tidak valid' });
  } catch (e) {
    console.error('Token error:', e);
    return cors(500, { error: 'Internal server error' });
  }
}

export async function onRequestOptions() {
  return cors(200, '');
}

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
